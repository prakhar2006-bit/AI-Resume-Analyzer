import type { VercelRequest, VercelResponse } from '@vercel/node'
import multiparty from 'multiparty'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

// ─── Clients ─────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
)

// ─── Parse multipart form using multiparty ────────────────────────────────────
function parseForm(req: VercelRequest): Promise<{ fields: Record<string, string[]>; filePath: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form()
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      const uploaded = files?.pdf?.[0]
      if (!uploaded) return reject(new Error('No PDF file uploaded'))
      resolve({
        fields,
        filePath: uploaded.path,
        mimeType: uploaded.headers['content-type'] || 'application/pdf',
      })
    })
  })
}

// ─── PDF text extraction ──────────────────────────────────────────────────────
async function extractPdfText(filePath: string): Promise<string> {
  try {
    // Dynamically require pdf-parse (CJS module)
    const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'))
    const buffer = fs.readFileSync(filePath)
    const result = await (pdfParse as any)(buffer)
    return result.text
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .trim()
  } catch (err) {
    console.error('PDF parse error:', err)
    throw new Error('Failed to extract text from PDF. Please ensure it is a valid, text-based PDF.')
  }
}

// ─── Mock analysis ────────────────────────────────────────────────────────────
function getMockAnalysis() {
  return {
    ats_score: 82,
    score_breakdown: { formatting: 22, keywords: 18, experience: 21, skills_match: 21 },
    overall_verdict: 'Good',
    summary:
      'The resume demonstrates strong technical proficiency and clear professional progression. While well-formatted, it could benefit from more specific industry keywords to rank higher in specialized ATS filters.',
    strengths: [
      'Consistent and professional formatting',
      'Strong progression in technical responsibilities',
      'Clear quantifiable achievements in recent roles',
    ],
    missing_keywords: ['TypeScript', 'CI/CD', 'AWS Lambda', 'Unit Testing'],
    improvement_suggestions: [
      { priority: 'High', category: 'Keywords', suggestion: 'Integrate specific mentions of TypeScript and AWS architecture to match modern stack expectations.' },
      { priority: 'Medium', category: 'Experience', suggestion: "Add more metrics to your bullet points (e.g., 'increased performance by X%')." },
      { priority: 'Low', category: 'Formatting', suggestion: 'Ensure the font size is consistent across all sections.' },
    ],
    skills_detected: {
      technical: ['React', 'JavaScript', 'Node.js', 'Express', 'PostgreSQL'],
      soft: ['Team Leadership', 'Agile Management', 'Communication'],
      tools: ['Git', 'Docker', 'Jira', 'VS Code'],
    },
    experience_level: 'Mid Level',
    recommended_roles: [
      { title: 'Senior Frontend Developer', match_percentage: 92, reason: 'Strong background in React and UI architecture.' },
      { title: 'Full Stack Engineer', match_percentage: 85, reason: 'Demonstrated capability in both frontend and backend environments.' },
    ],
    industry_fit: ['Tech', 'SaaS', 'E-commerce'],
    red_flags: ['Slightly high word count for a 2-page resume'],
    word_count: 650,
    estimated_years_experience: 5,
  }
}

// ─── Claude AI analysis ───────────────────────────────────────────────────────
async function analyzeWithClaude(resumeText: string, jobDescription?: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key' || apiKey === 'mock') {
    console.log('🧪 Running in MOCK MODE')
    await new Promise((r) => setTimeout(r, 1000))
    return getMockAnalysis()
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach with 15+ years of experience in HR and recruitment across tech, finance, and consulting industries.

Analyze the following resume text and return a detailed JSON report.

RESUME TEXT:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ''}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "ats_score": <number 0-100>,
  "score_breakdown": {
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "experience": <number 0-25>,
    "skills_match": <number 0-25>
  },
  "overall_verdict": "<one of: Excellent | Good | Needs Work | Poor>",
  "summary": "<2-3 sentence executive summary of the resume>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "missing_keywords": ["<keyword 1>", "<keyword 2>"],
  "improvement_suggestions": [
    { "priority": "High|Medium|Low", "category": "<e.g. Experience|Skills|Formatting>", "suggestion": "<actionable suggestion>" }
  ],
  "skills_detected": {
    "technical": ["<skill>"],
    "soft": ["<skill>"],
    "tools": ["<tool>"]
  },
  "experience_level": "<one of: Entry Level | Mid Level | Senior | Executive>",
  "recommended_roles": [
    { "title": "<role title>", "match_percentage": <number>, "reason": "<why this role matches>" }
  ],
  "industry_fit": ["<industry 1>", "<industry 2>", "<industry 3>"],
  "red_flags": ["<issue 1>"],
  "word_count": <number>,
  "estimated_years_experience": <number>
}`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response from Claude')

  const text = content.text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse AI response as JSON')

  return JSON.parse(jsonMatch[0]) as Record<string, unknown>
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const url = req.url || ''

  // ─── GET /api/health ───────────────────────────────────────────────────────
  if (req.method === 'GET' && url.includes('/api/health')) {
    return res.json({
      status: 'ok',
      anthropicConfigured: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key',
      supabaseConfigured: !!process.env.VITE_SUPABASE_URL,
      serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
  }

  // ─── POST /api/editor/tips ─────────────────────────────────────────────────
  if (req.method === 'POST' && url.includes('/api/editor/tips')) {
    try {
      const { section, content } = req.body as { section: string; content: string }
      if (!content || content.length < 10) return res.json({ tips: [] })

      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey || apiKey === 'mock' || apiKey === 'your_anthropic_api_key') {
        await new Promise((r) => setTimeout(r, 800))
        return res.json({
          tips: [
            'Try to use more action verbs like "Spearheaded" or "Implemented".',
            'Quantify your achievements with numbers (e.g., "Increased sales by 20%").',
          ],
        })
      }

      const prompt = `You are a professional resume reviewer. Provide 2-3 short, actionable tips to improve the following "${section}" section of a resume for ATS optimization.
    
CONTENT:
${content}

Return ONLY a JSON array of strings: ["tip1", "tip2"]`

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = ((message.content[0] as any).text as string).trim()
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const tips = jsonMatch ? JSON.parse(jsonMatch[0]) : []
      return res.json({ tips })
    } catch (err) {
      console.error('Tips error:', err)
      return res.status(500).json({ error: 'Failed to fetch tips' })
    }
  }

  // ─── POST /api/analyze-resume ──────────────────────────────────────────────
  if (req.method === 'POST' && url.includes('/api/analyze-resume')) {
    let filePath: string | undefined
    try {
      // Parse multipart form
      const { fields, filePath: fp, mimeType } = await parseForm(req)
      filePath = fp

      if (mimeType !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are accepted' })
      }

      const resume_id = fields.resume_id?.[0]
      const user_id = fields.user_id?.[0]
      const job_description = fields.job_description?.[0]

      if (!resume_id || !user_id) {
        return res.status(400).json({ error: 'Missing resume_id or user_id' })
      }

      // 1. Extract text
      let resumeText = ''
      const isMock =
        !process.env.ANTHROPIC_API_KEY ||
        process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key' ||
        process.env.ANTHROPIC_API_KEY === 'mock'

      try {
        resumeText = await extractPdfText(filePath)
      } catch (err) {
        if (!isMock) throw err
        console.warn('⚠️ PDF extraction failed, using mock placeholder')
      }

      if (!isMock && (!resumeText || resumeText.length < 50)) {
        return res.status(400).json({ error: 'Could not extract enough text from the PDF. Please ensure it is a text-based PDF, not a scanned image.' })
      }

      if (isMock && (!resumeText || resumeText.length < 50)) {
        resumeText = '[MOCK RESUME TEXT: Original PDF was image-based or unreadable]'
      }

      // 2. Analyze with Claude
      const analysis = await analyzeWithClaude(resumeText, job_description)

      // 3. Save to DB
      const { data: analysisRow, error: dbErr } = await supabase
        .from('analysis_results')
        .insert({
          resume_id,
          user_id,
          ats_score: analysis.ats_score,
          score_breakdown: analysis.score_breakdown,
          overall_verdict: analysis.overall_verdict,
          summary: analysis.summary,
          strengths: analysis.strengths,
          missing_keywords: analysis.missing_keywords,
          improvement_suggestions: analysis.improvement_suggestions,
          skills_detected: analysis.skills_detected,
          recommended_roles: analysis.recommended_roles,
          experience_level: analysis.experience_level,
          industry_fit: analysis.industry_fit,
          red_flags: analysis.red_flags,
          word_count: analysis.word_count,
          estimated_years_experience: analysis.estimated_years_experience,
          raw_response: analysis,
        })
        .select()
        .single()

      if (dbErr) throw new Error(`Database error: ${dbErr.message}`)

      // 4. Update resume status
      await supabase.from('resumes').update({ status: 'complete' }).eq('id', resume_id)

      // 5. Notification
      await supabase.from('notifications').insert({
        user_id,
        type: 'analysis_complete',
        message: `Your resume analysis is complete! ATS Score: ${analysis.ats_score}/100`,
        is_read: false,
      })

      return res.json({ analysis_id: (analysisRow as { id: string }).id, ats_score: analysis.ats_score })
    } catch (err: unknown) {
      console.error('Analysis error:', err)
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      return res.status(500).json({ error: msg })
    } finally {
      // Clean up temp file
      if (filePath) {
        try { fs.unlinkSync(filePath) } catch {}
      }
    }
  }

  return res.status(404).json({ error: 'Not found' })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

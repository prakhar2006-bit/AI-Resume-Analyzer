import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.VITE_APP_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.set('trust proxy', 1)

// Rate limiter removed for local development stability
const analysisLimiter = (req: any, res: any, next: any) => next()

// Multer for PDF uploads (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are accepted'))
    } else {
      cb(null, true)
    }
  },
})

// ─── Clients ────────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

// Use Service Role Key for the server to bypass RLS during analysis saving
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
)

// ─── PDF text extraction ───────────────────────────────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const result = await pdfParse(buffer)
    // Sanitize: strip potential HTML/script tags
    return result.text
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .trim()
  } catch (err) {
    console.error('PDF parse error:', err)
    throw new Error('Failed to extract text from PDF. Please ensure it is a valid, text-based PDF.')
  }
}

async function analyzeWithClaude(resumeText: string, jobDescription?: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  // 🧪 MOCK MODE: Return simulated analysis if no real key is found
  if (!apiKey || apiKey === 'your_anthropic_api_key' || apiKey === 'mock') {
    console.log('🧪 Running in MOCK MODE (Simulating AI Analysis)')
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Artificial delay

    return {
      ats_score: 82,
      score_breakdown: {
        formatting: 22,
        keywords: 18,
        experience: 21,
        skills_match: 21,
      },
      overall_verdict: "Good",
      summary: "The resume demonstrates strong technical proficiency and clear professional progression. While well-formatted, it could benefit from more specific industry keywords to rank higher in specialized ATS filters.",
      strengths: [
        "Consistent and professional formatting",
        "Strong progression in technical responsibilities",
        "Clear quantifiable achievements in recent roles"
      ],
      missing_keywords: ["TypeScript", "CI/CD", "AWS Lambda", "Unit Testing"],
      improvement_suggestions: [
        { "priority": "High", "category": "Keywords", "suggestion": "Integrate specific mentions of TypeScript and AWS architecture to match modern stack expectations." },
        { "priority": "Medium", "category": "Experience", "suggestion": "Add more metrics to your bullet points (e.g., 'increased performance by X%')." },
        { "priority": "Low", "category": "Formatting", "suggestion": "Ensure the font size is consistent across all sections." }
      ],
      skills_detected: {
        "technical": ["React", "JavaScript", "Node.js", "Express", "PostgreSQL"],
        "soft": ["Team Leadership", "Agile Management", "Communication"],
        "tools": ["Git", "Docker", "Jira", "VS Code"]
      },
      experience_level: "Mid Level",
      recommended_roles: [
        { "title": "Senior Frontend Developer", "match_percentage": 92, "reason": "Strong background in React and UI architecture." },
        { "title": "Full Stack Engineer", "match_percentage": 85, "reason": "Demonstrated capability in both frontend and backend environments." }
      ],
      industry_fit: ["Tech", "SaaS", "E-commerce"],
      red_flags: ["Slightly high word count for a 2-page resume"],
      word_count: 650,
      estimated_years_experience: 5
    }
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

  // Parse JSON — Claude should return clean JSON
  const text = content.text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse AI response as JSON')

  return JSON.parse(jsonMatch[0]) as Record<string, unknown>
}

// ─── Route: POST /api/analyze-resume ──────────────────────────────────────────
app.post(
  '/api/analyze-resume',
  upload.single('pdf'),
  analysisLimiter,
  async (req, res) => {
    try {
      const { resume_id, user_id, job_description } = req.body as {
        resume_id: string
        user_id: string
        job_description?: string
      }

      if (!req.file) {
        res.status(400).json({ error: 'No PDF file uploaded' })
        return
      }
      if (!resume_id || !user_id) {
        res.status(400).json({ error: 'Missing resume_id or user_id' })
        return
      }

      // Check API key (Allowing mock mode if key is missing or set to placeholder)
      const apiKey = process.env.ANTHROPIC_API_KEY
      const isMockMode = !apiKey || apiKey === 'your_anthropic_api_key' || apiKey === 'mock'

      if (isMockMode) {
        console.warn('⚠️  Proceeding with MOCK analysis (No real API key detected)')
      }

      // 1. Extract text
      let resumeText = ''
      try {
        resumeText = await extractPdfText(req.file.buffer)
      } catch (err) {
        console.warn('⚠️ Text extraction failed, but proceeding because of Mock Mode.')
      }

      const isMock = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key' || process.env.ANTHROPIC_API_KEY === 'mock'

      if (!isMock && (!resumeText || resumeText.length < 50)) {
        res.status(400).json({ error: 'Could not extract enough text from the PDF. Please ensure it is a text-based PDF, not a scanned image.' })
        return
      }

      // Fallback for mock mode if text is empty
      if (isMock && (!resumeText || resumeText.length < 50)) {
        resumeText = "[MOCK RESUME TEXT: Original PDF was image-based or unreadable]"
      }

      // 2. Analyze
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

      // 5. Create notification
      await supabase.from('notifications').insert({
        user_id,
        type: 'analysis_complete',
        message: `Your resume analysis is complete! ATS Score: ${analysis.ats_score}/100`,
        is_read: false,
      })

      res.json({ analysis_id: (analysisRow as { id: string }).id, ats_score: analysis.ats_score })
    } catch (err: unknown) {
      console.error('Analysis error:', err)
      const msg = err instanceof Error ? err.message : 'Analysis failed'
      res.status(500).json({ error: msg })
    }
  }
)

// ─── Route: POST /api/editor/tips ───────────────────────────────────────────
app.post('/api/editor/tips', async (req, res) => {
  try {
    const { section, content } = req.body as { section: string, content: string }
    if (!content || content.length < 10) {
      return res.json({ tips: [] })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'mock' || apiKey === 'your_anthropic_api_key') {
      // Mock tips
      await new Promise(r => setTimeout(r, 800))
      const mockTips = [
        `Try to use more action verbs like "Spearheaded" or "Implemented".`,
        `Quantify your achievements with numbers (e.g., "Increased sales by 20%").`,
        `Ensure this section directly addresses keywords from the target industry.`
      ]
      return res.json({ tips: mockTips.slice(0, 2) })
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

    const text = (message.content[0] as any).text.trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const tips = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    res.json({ tips })
  } catch (err) {
    console.error('Tips error:', err)
    res.status(500).json({ error: 'Failed to fetch tips' })
  }
})

// ─── Route: GET /api/health ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key',
    supabaseConfigured: !!process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL !== 'your_supabase_project_url',
    serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })
})

export default app

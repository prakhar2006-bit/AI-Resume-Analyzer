import express from 'express'
import cors from 'cors'
import multer from 'multer'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'module'

dotenv.config()

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const app = express()

app.use(cors({ origin: process.env.VITE_APP_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.set('trust proxy', 1)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') cb(new Error('Only PDF files are accepted'))
    else cb(null, true)
  },
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
)

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const result = await pdfParse(buffer)
    return result.text.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
  } catch (err) {
    console.error('PDF parse error:', err)
    throw new Error('Failed to extract text from PDF.')
  }
}

function getMockAnalysis() {
  return {
    ats_score: 82,
    score_breakdown: { formatting: 22, keywords: 18, experience: 21, skills_match: 21 },
    overall_verdict: 'Good',
    summary: 'The resume demonstrates strong technical proficiency and clear professional progression.',
    strengths: ['Consistent and professional formatting', 'Strong progression in technical responsibilities', 'Clear quantifiable achievements in recent roles'],
    missing_keywords: ['TypeScript', 'CI/CD', 'AWS Lambda', 'Unit Testing'],
    improvement_suggestions: [
      { priority: 'High', category: 'Keywords', suggestion: 'Integrate specific mentions of TypeScript and AWS architecture.' },
      { priority: 'Medium', category: 'Experience', suggestion: "Add more metrics to your bullet points." },
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

async function analyzeWithClaude(resumeText: string, jobDescription?: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key' || apiKey === 'mock') {
    console.log('🧪 MOCK MODE')
    await new Promise(r => setTimeout(r, 2000))
    return getMockAnalysis()
  }

  const prompt = `You are an expert ATS analyst. Analyze the following resume and return ONLY valid JSON with this exact structure:
{
  "ats_score": <number 0-100>,
  "score_breakdown": { "formatting": <0-25>, "keywords": <0-25>, "experience": <0-25>, "skills_match": <0-25> },
  "overall_verdict": "<Excellent|Good|Needs Work|Poor>",
  "summary": "<2-3 sentences>",
  "strengths": ["<strength>"],
  "missing_keywords": ["<keyword>"],
  "improvement_suggestions": [{ "priority": "High|Medium|Low", "category": "<category>", "suggestion": "<text>" }],
  "skills_detected": { "technical": ["<skill>"], "soft": ["<skill>"], "tools": ["<tool>"] },
  "experience_level": "<Entry Level|Mid Level|Senior|Executive>",
  "recommended_roles": [{ "title": "<role>", "match_percentage": <number>, "reason": "<text>" }],
  "industry_fit": ["<industry>"],
  "red_flags": ["<issue>"],
  "word_count": <number>,
  "estimated_years_experience": <number>
}

RESUME TEXT:
${resumeText}
${jobDescription ? `\nTARGET JOB DESCRIPTION:\n${jobDescription}` : ''}`

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

app.post('/api/analyze-resume', upload.single('pdf'), async (req, res) => {
  try {
    const { resume_id, user_id, job_description } = req.body as { resume_id: string; user_id: string; job_description?: string }
    if (!req.file) { res.status(400).json({ error: 'No PDF file uploaded' }); return }
    if (!resume_id || !user_id) { res.status(400).json({ error: 'Missing resume_id or user_id' }); return }

    const isMock = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key' || process.env.ANTHROPIC_API_KEY === 'mock'
    let resumeText = ''
    try { resumeText = await extractPdfText(req.file.buffer) } catch (err) { if (!isMock) throw err }

    if (!isMock && (!resumeText || resumeText.length < 50)) {
      res.status(400).json({ error: 'Could not extract enough text from the PDF. Please ensure it is a text-based PDF.' }); return
    }
    if (isMock && (!resumeText || resumeText.length < 50)) resumeText = '[MOCK RESUME TEXT]'

    const analysis = await analyzeWithClaude(resumeText, job_description)

    const { data: analysisRow, error: dbErr } = await supabase
      .from('analysis_results')
      .insert({
        resume_id, user_id,
        ats_score: analysis.ats_score, score_breakdown: analysis.score_breakdown,
        overall_verdict: analysis.overall_verdict, summary: analysis.summary,
        strengths: analysis.strengths, missing_keywords: analysis.missing_keywords,
        improvement_suggestions: analysis.improvement_suggestions, skills_detected: analysis.skills_detected,
        recommended_roles: analysis.recommended_roles, experience_level: analysis.experience_level,
        industry_fit: analysis.industry_fit, red_flags: analysis.red_flags,
        word_count: analysis.word_count, estimated_years_experience: analysis.estimated_years_experience,
        raw_response: analysis,
      })
      .select().single()

    if (dbErr) throw new Error(`Database error: ${dbErr.message}`)
    await supabase.from('resumes').update({ status: 'complete' }).eq('id', resume_id)
    await supabase.from('notifications').insert({
      user_id, type: 'analysis_complete',
      message: `Your resume analysis is complete! ATS Score: ${analysis.ats_score}/100`, is_read: false,
    })

    res.json({ analysis_id: (analysisRow as { id: string }).id, ats_score: analysis.ats_score })
  } catch (err: unknown) {
    console.error('Analysis error:', err)
    const msg = err instanceof Error ? err.message : 'Analysis failed'
    res.status(500).json({ error: msg })
  }
})

app.post('/api/editor/tips', async (req, res) => {
  try {
    const { section, content } = req.body as { section: string; content: string }
    if (!content || content.length < 10) return res.json({ tips: [] })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'mock' || apiKey === 'your_anthropic_api_key') {
      await new Promise(r => setTimeout(r, 800))
      return res.json({ tips: ['Use more action verbs like "Spearheaded".', 'Quantify achievements with numbers.'] })
    }

    const prompt = `You are a professional resume reviewer. Provide 2-3 short, actionable tips to improve the following "${section}" section of a resume for ATS optimization.\n\nCONTENT:\n${content}\n\nReturn ONLY a JSON array of strings: ["tip1", "tip2"]`
    const message = await anthropic.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
    const text = ((message.content[0] as any).text as string).trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    return res.json({ tips: jsonMatch ? JSON.parse(jsonMatch[0]) : [] })
  } catch (err) {
    console.error('Tips error:', err)
    return res.status(500).json({ error: 'Failed to fetch tips' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key',
    supabaseConfigured: !!process.env.VITE_SUPABASE_URL,
    serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🚀 ResumeIQ API Server running on http://localhost:${PORT}`)
  console.log(`   Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing'}`)
  console.log(`   Supabase:      ${process.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`)
  console.log(`   Service Role:  ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '⚠️  Missing'}\n`)
})

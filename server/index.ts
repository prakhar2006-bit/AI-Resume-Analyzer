import app from '../api/index.ts'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`\n🚀 ResumeIQ API Server running on http://localhost:${PORT}`)
  console.log(`   Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing ANTHROPIC_API_KEY in .env'}`)
  console.log(`   Supabase:      ${process.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing VITE_SUPABASE_URL in .env'}`)
  console.log(`   Service Role:  ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '⚠️  Missing (RLS may block server writes)'}\n`)
})

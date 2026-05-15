import { useMemo } from 'react'

interface Props {
  data: any
}

export function AtsScoreBadge({ data }: Props) {
  const score = useMemo(() => {
    let s = 0
    // Basic scoring algorithm
    if (data.contact.name) s += 10
    if (data.contact.email) s += 5
    if (data.contact.phone) s += 5
    
    const summaryWords = data.summary.split(/\s+/).filter(Boolean).length
    if (summaryWords >= 40 && summaryWords <= 100) s += 20
    else if (summaryWords > 0) s += 10
    
    if (data.experience.length >= 2) s += 20
    else if (data.experience.length === 1) s += 10
    
    const totalExpDesc = data.experience.reduce((acc: number, curr: any) => acc + curr.description.length, 0)
    if (totalExpDesc > 500) s += 20
    else if (totalExpDesc > 200) s += 10
    
    if (data.skills.length >= 5) s += 20
    else if (data.skills.length > 0) s += 10
    
    return Math.min(s, 100)
  }, [data])

  const getColor = () => {
    if (score < 40) return 'text-red-500 bg-red-500/10 border-red-500/20'
    if (score < 60) return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    if (score < 80) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }

  return (
    <div className={`px-3 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 ${getColor()}`}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${score >= 80 ? 'bg-emerald-500' : 'bg-current'}`} />
      ATS Score: {score}
    </div>
  )
}

interface WordCountProps {
  content: string
  min: number
  max: number
}

export function SectionWordCount({ content, min, max }: WordCountProps) {
  const words = content.split(/\s+/).filter(Boolean).length
  
  const getColor = () => {
    if (words === 0) return 'text-[#4A5568]'
    if (words < min) return 'text-red-400'
    if (words > max) return 'text-orange-400'
    return 'text-emerald-400'
  }

  return (
    <div className={`text-[10px] font-medium flex items-center gap-1.5 ${getColor()}`}>
      <span className="opacity-70 uppercase tracking-tighter">Words:</span>
      <span className="font-bold">{words}</span>
      <span className="opacity-50">/</span>
      <span className="opacity-70">{min}-{max} recommended</span>
    </div>
  )
}

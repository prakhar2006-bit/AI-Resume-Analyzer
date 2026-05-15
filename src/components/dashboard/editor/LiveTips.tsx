import { useState } from 'react'
import { Sparkles, Loader2, Lightbulb, ChevronRight } from 'lucide-react'

interface Props {
  section: string
  content: string
}

export function LiveTips({ section, content }: Props) {
  const [tips, setTips] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState('')

  const fetchTips = async () => {
    if (!content || content.length < 20 || content === lastAnalyzed) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/editor/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content })
      })
      const data = await res.json()
      if (data.tips) setTips(data.tips)
      setLastAnalyzed(content)
    } catch (err) {
      console.error('Failed to fetch tips')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/20 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
          </div>
          <span className="text-sm font-semibold text-[#F1F5F9]">AI Analysis Tips</span>
        </div>
        <button 
          onClick={fetchTips}
          disabled={loading || content.length < 20}
          className="text-[10px] uppercase font-bold tracking-widest text-[#6366F1] hover:text-[#22D3EE] transition-colors flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Refresh Tips'}
        </button>
      </div>

      {tips.length > 0 ? (
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-xs text-[#94A3B8] leading-relaxed">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[#4A5568] italic">
          {content.length < 20 
            ? "Start typing to get real-time AI improvement tips..." 
            : "Click 'Refresh Tips' to get personalized advice."}
        </p>
      )}
    </div>
  )
}

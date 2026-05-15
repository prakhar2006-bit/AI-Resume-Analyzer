import type { ScoreBreakdown } from '@/lib/types'
import { getScoreColor } from '@/lib/utils'
import { Type, Hash, Briefcase, Star } from 'lucide-react'

const items = [
  { key: 'formatting' as const, label: 'Formatting', icon: Type, max: 25 },
  { key: 'keywords' as const, label: 'Keywords', icon: Hash, max: 25 },
  { key: 'experience' as const, label: 'Experience', icon: Briefcase, max: 25 },
  { key: 'skills_match' as const, label: 'Skills Match', icon: Star, max: 25 },
]

interface Props { breakdown: ScoreBreakdown }

export function ScoreBreakdownCards({ breakdown }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ key, label, icon: Icon, max }) => {
        const val = breakdown[key]
        const pct = Math.round((val / max) * 100)
        const color = getScoreColor(pct)
        return (
          <div key={key} className="card" style={{ padding: '1rem' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon style={{ width: 14, height: 14, color }} />
                </div>
                <span className="text-xs text-[#94A3B8] font-medium">{label}</span>
              </div>
              <span className="font-bold text-sm" style={{ color }}>{val}<span className="text-[#4A5568] font-normal">/{max}</span></span>
            </div>
            <div className="w-full bg-[#2A2A3A] rounded-full" style={{ height: 4 }}>
              <div
                className="rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, height: 4, background: color, boxShadow: `0 0 6px ${color}60` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import type { ImprovementSuggestion } from '@/lib/types'
import { getPriorityBadgeClass } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { suggestions: ImprovementSuggestion[] }

const priorities = ['High', 'Medium', 'Low'] as const

export function SuggestionsAccordion({ suggestions }: Props) {
  const [open, setOpen] = useState<string | null>('High')

  const grouped = priorities.reduce((acc, p) => {
    acc[p] = suggestions.filter((s) => s.priority === p)
    return acc
  }, {} as Record<string, ImprovementSuggestion[]>)

  return (
    <div className="space-y-2">
      {priorities.map((priority) => {
        const items = grouped[priority]
        if (!items.length) return null
        const isOpen = open === priority
        return (
          <div key={priority} className="border border-[#2A2A3A] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : priority)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn('badge', getPriorityBadgeClass(priority))}>{priority}</span>
                <span className="text-sm text-[#94A3B8] font-medium">{items.length} suggestion{items.length > 1 ? 's' : ''}</span>
              </div>
              <ChevronDown
                style={{ width: 16, height: 16 }}
                className={cn('text-[#4A5568] transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && (
              <div className="border-t border-[#2A2A3A]">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={cn('px-4 py-3 text-sm', i < items.length - 1 && 'border-b border-[#2A2A3A]/50')}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium mt-0.5 flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}
                      >
                        {item.category}
                      </span>
                      <p className="text-[#94A3B8]">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

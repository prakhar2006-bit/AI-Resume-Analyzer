import type { SkillsDetected } from '@/lib/types'
import { Code2, Users, Wrench } from 'lucide-react'

const colConfig = [
  { key: 'technical' as const, label: 'Technical', icon: Code2, color: '#6366F1' },
  { key: 'soft' as const, label: 'Soft Skills', icon: Users, color: '#22D3EE' },
  { key: 'tools' as const, label: 'Tools', icon: Wrench, color: '#10B981' },
]

interface Props { skills: SkillsDetected }

export function SkillsTags({ skills }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {colConfig.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="card" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon style={{ width: 14, height: 14, color }} />
            </div>
            <span className="text-sm font-semibold text-[#F1F5F9]">{label}</span>
            <span className="ml-auto text-xs text-[#4A5568]">{skills[key].length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills[key].map((skill: string) => (
              <span
                key={skill}
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
              >
                {skill}
              </span>
            ))}
            {skills[key].length === 0 && (
              <span className="text-xs text-[#4A5568]">None detected</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props { keywords: string[] }

export function KeywordCloud({ keywords }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (kw: string) => {
    navigator.clipboard.writeText(kw)
    setCopied(kw)
    toast.success(`Copied "${kw}"`)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <button
          key={kw}
          onClick={() => handleCopy(kw)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#EF4444',
          }}
          title="Click to copy"
        >
          {kw}
          {copied === kw ? (
            <Check style={{ width: 11, height: 11 }} />
          ) : (
            <Copy style={{ width: 11, height: 11 }} />
          )}
        </button>
      ))}
      {keywords.length === 0 && (
        <p className="text-[#4A5568] text-sm">No missing keywords detected. Great job!</p>
      )}
    </div>
  )
}

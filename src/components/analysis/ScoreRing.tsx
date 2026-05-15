import { useEffect, useRef } from 'react'
import { getScoreColor } from '@/lib/utils'

interface Props {
  score: number
  size?: number
  strokeWidth?: number
  animate?: boolean
}

export function ScoreRing({ score, size = 180, strokeWidth = 12, animate = true }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const color = getScoreColor(score)
  const dashOffset = circumference - (score / 100) * circumference

  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!animate || !circleRef.current) return
    circleRef.current.style.strokeDashoffset = String(circumference)
    const t = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        circleRef.current.style.strokeDashoffset = String(dashOffset)
      }
    }, 100)
    return () => clearTimeout(t)
  }, [score, circumference, dashOffset, animate])

  const label =
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2A2A3A"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animate ? circumference : dashOffset}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'none' }}
        >
          <span className="font-heading font-bold" style={{ fontSize: size * 0.22, color }}>
            {score}
          </span>
          <span className="text-xs text-[#94A3B8] font-medium">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

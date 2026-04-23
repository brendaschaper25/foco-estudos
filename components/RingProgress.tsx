type Props = {
  percent: number        // 0-100
  studiedMin: number
  goalMin: number
  size?: number
}

export default function RingProgress({ percent, studiedMin, goalMin, size = 180 }: Props) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color = percent >= 100 ? '#10b981' : '#6366f1'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth={12} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="text-center -mt-2">
        <p className="text-2xl font-bold">{studiedMin}min</p>
        <p className="text-gray-400 text-sm">meta: {goalMin}min</p>
      </div>
    </div>
  )
}

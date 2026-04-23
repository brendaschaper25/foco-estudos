type Props = {
  percent: number
  studiedMin: number
  goalMin: number
  size?: number
}

export default function RingProgress({ percent, studiedMin, goalMin, size = 180 }: Props) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color = percent >= 100 ? '#4ade80' : '#ffffff'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s ease',
            filter: `drop-shadow(0 0 6px ${color}88)`,
          }}
        />
      </svg>
      <div className="text-center -mt-2">
        <p className="text-2xl font-bold">{studiedMin}min</p>
        <p className="text-sm" style={{ color: 'rgba(240,249,255,0.4)' }}>meta: {goalMin}min</p>
      </div>
    </div>
  )
}

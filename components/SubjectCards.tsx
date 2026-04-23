import { formatMinutes } from '@/lib/utils'

type SubjectStat = { nome: string; cor: string; total_min: number }

export default function SubjectCards({ stats }: { stats: SubjectStat[] }) {
  if (stats.length === 0) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map(s => (
        <div key={s.nome} className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
          <div>
            <p className="text-sm font-medium">{s.nome}</p>
            <p className="text-gray-400 text-xs">{formatMinutes(s.total_min)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

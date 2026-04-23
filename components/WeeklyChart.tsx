'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type DayData = { date: string; label: string; horas: number }
type SubjectData = { nome: string; cor: string; minutos: number }

export default function WeeklyChart({ days, subjects }: { days: DayData[], subjects: SubjectData[] }) {
  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold mb-4 tracking-tight">Horas por dia</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={days}>
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} unit="h" />
            <Tooltip formatter={(v) => [`${v}h`, 'Horas']}
              contentStyle={{ background: '#12151f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
            <Bar dataKey="horas" fill="white" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {subjects.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4 tracking-tight">Por matéria</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={subjects} dataKey="minutos" cx="50%" cy="50%" outerRadius={70}>
                  {subjects.map((s, i) => <Cell key={i} fill={s.cor} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${Math.round(Number(v) / 60 * 10) / 10}h`, '']}
                  contentStyle={{ background: '#12151f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {subjects.map(s => (
                <div key={s.nome} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
                  <span>{s.nome}</span>
                  <span className="text-gray-400">{Math.round(s.minutos / 60 * 10) / 10}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

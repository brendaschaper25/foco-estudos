import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import WeeklyChart from '@/components/WeeklyChart'
import { Session, Subject } from '@/types'

export default async function HistoricoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const startDate = sevenDaysAgo.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  const [{ data: sessions }, { data: subjects }] = await Promise.all([
    supabase.from('sessions').select('*').eq('user_id', user.id).gte('criado_em', startDate),
    supabase.from('subjects').select('*').eq('user_id', user.id),
  ])

  const allSessions = (sessions as Session[]) ?? []
  const subjectMap = Object.fromEntries((subjects as Subject[]).map(s => [s.id, s]))

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' })
    const minutos = allSessions
      .filter(s => s.criado_em.startsWith(dateStr))
      .reduce((acc, s) => acc + s.duracao_min, 0)
    return { date: dateStr, label, horas: Math.round(minutos / 60 * 10) / 10 }
  })

  const subjectStats = allSessions.reduce((acc: Record<string, { nome: string; cor: string; minutos: number }>, s) => {
    const key = s.subject_id ?? '__none__'
    const nome = s.subject_id ? (subjectMap[s.subject_id]?.nome ?? 'Sem matéria') : 'Sem matéria'
    const cor = s.subject_id ? (subjectMap[s.subject_id]?.cor ?? '#6b7280') : '#6b7280'
    if (!acc[key]) acc[key] = { nome, cor, minutos: 0 }
    acc[key].minutos += s.duracao_min
    return acc
  }, {})

  const totalMin = allSessions.reduce((acc, s) => acc + s.duracao_min, 0)
  const totalPomodoros = allSessions.filter(s => s.duracao_min >= 20).length

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Histórico</h1>
      <div className="flex gap-6">
        <div className="glass rounded-xl p-4 flex-1 text-center">
          <p className="text-3xl font-bold">{Math.round(totalMin / 60 * 10) / 10}h</p>
          <p className="text-gray-400 text-sm">na semana</p>
        </div>
        <div className="glass rounded-xl p-4 flex-1 text-center">
          <p className="text-3xl font-bold">{totalPomodoros}</p>
          <p className="text-gray-400 text-sm">pomodoros</p>
        </div>
      </div>
      <WeeklyChart days={days} subjects={Object.values(subjectStats)} />
    </div>
  )
}

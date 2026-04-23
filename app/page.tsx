import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RingProgress from '@/components/RingProgress'
import DailyGoals from '@/components/DailyGoals'
import SubjectCards from '@/components/SubjectCards'
import Link from 'next/link'
import { calcProgress, calcStreak, getTodayBR } from '@/lib/utils'
import { Settings, Subject, Session, DailyGoal } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = getTodayBR()

  const [{ data: settings }, { data: sessions }, { data: goals }, { data: subjects }] = await Promise.all([
    supabase.from('settings').select('*').eq('user_id', user.id).single(),
    supabase.from('sessions').select('*').eq('user_id', user.id),
    supabase.from('daily_goals').select('*').eq('user_id', user.id).eq('data', today).order('created_at'),
    supabase.from('subjects').select('*').eq('user_id', user.id),
  ])

  const cfg = settings as Settings
  const allSessions = (sessions as Session[]) ?? []
  const todaySessions = allSessions.filter(s => s.criado_em.startsWith(today))
  const studiedMin = todaySessions.reduce((acc, s) => acc + s.duracao_min, 0)
  const goalMin = Math.round((cfg?.meta_horas_dia ?? 2) * 60)
  const percent = calcProgress(studiedMin, cfg?.meta_horas_dia ?? 2)

  const sessionDates = allSessions.map(s => s.criado_em.slice(0, 10))
  const streak = calcStreak(sessionDates)

  const subjectMap = Object.fromEntries((subjects as Subject[]).map(s => [s.id, s]))
  const subjectStats = todaySessions.reduce((acc: Record<string, { nome: string; cor: string; total_min: number }>, s) => {
    const key = s.subject_id ?? '__none__'
    const nome = s.subject_id ? (subjectMap[s.subject_id]?.nome ?? 'Sem matéria') : 'Sem matéria'
    const cor = s.subject_id ? (subjectMap[s.subject_id]?.cor ?? '#6b7280') : '#6b7280'
    if (!acc[key]) acc[key] = { nome, cor, total_min: 0 }
    acc[key].total_min += s.duracao_min
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hoje</h1>
        {streak > 0 && <span className="text-orange-400 font-medium">🔥 {streak} {streak === 1 ? 'dia' : 'dias'} seguidos</span>}
      </div>

      <div className="flex flex-col items-center gap-4">
        <RingProgress percent={percent} studiedMin={studiedMin} goalMin={goalMin} />
        <Link href="/timer" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition">
          Iniciar sessão →
        </Link>
      </div>

      <SubjectCards stats={Object.values(subjectStats)} />
      <DailyGoals goals={(goals as DailyGoal[]) ?? []} today={today} />
    </div>
  )
}

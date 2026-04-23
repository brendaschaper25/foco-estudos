import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RingProgress from '@/components/RingProgress'
import DailyGoals from '@/components/DailyGoals'
import SubjectCards from '@/components/SubjectCards'
import Link from 'next/link'
import { calcProgress, calcStreak, formatMinutes, getTodayBR } from '@/lib/utils'
import { Settings, Subject, Session, DailyGoal } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = getTodayBR()
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo'
  })

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
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 capitalize">{todayLabel}</p>
          <h1 className="text-2xl font-bold">Hoje</h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium px-3 py-1.5 rounded-full">
            🔥 <span>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
          </div>
        )}
      </div>

      {/* Hero: progresso do dia */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-900/60 border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-5">
        <RingProgress percent={percent} studiedMin={studiedMin} goalMin={goalMin} size={200} />

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatMinutes(studiedMin)}</p>
            <p className="text-gray-500 text-xs mt-0.5">estudados</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{formatMinutes(goalMin)}</p>
            <p className="text-gray-500 text-xs mt-0.5">meta</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold">{todaySessions.length}</p>
            <p className="text-gray-500 text-xs mt-0.5">{todaySessions.length === 1 ? 'sessão' : 'sessões'}</p>
          </div>
        </div>

        <Link
          href="/timer"
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition text-sm"
        >
          {studiedMin === 0 ? 'Começar →' : 'Continuar →'}
        </Link>
      </div>

      <SubjectCards stats={Object.values(subjectStats)} />
      <DailyGoals goals={(goals as DailyGoal[]) ?? []} today={today} />
    </div>
  )
}

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DailyGoals from '@/components/DailyGoals'
import SubjectCards from '@/components/SubjectCards'
import Link from 'next/link'
import { calcProgress, calcStreak, formatMinutes, getTodayBR } from '@/lib/utils'
import { Settings, Subject, Session, DailyGoal } from '@/types'
import RingProgress from '@/components/RingProgress'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = getTodayBR()
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo',
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
  const streak = calcStreak(allSessions.map(s => s.criado_em.slice(0, 10)))

  const subjectMap = Object.fromEntries((subjects as Subject[]).map(s => [s.id, s]))
  const subjectStats = todaySessions.reduce((acc: Record<string, { nome: string; cor: string; total_min: number }>, s) => {
    const key = s.subject_id ?? '__none__'
    const nome = s.subject_id ? (subjectMap[s.subject_id]?.nome ?? 'Sem matéria') : 'Sem matéria'
    const cor = s.subject_id ? (subjectMap[s.subject_id]?.cor ?? '#6b7280') : '#6b7280'
    if (!acc[key]) acc[key] = { nome, cor, total_min: 0 }
    acc[key].total_min += s.duracao_min
    return acc
  }, {})

  const goalReached = studiedMin >= goalMin && goalMin > 0

  return (
    <div className="space-y-10">

      {/* Header editorial */}
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-1 capitalize">{todayLabel}</p>
          <h1 className="text-3xl font-black tracking-tight">Hoje</h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-orange-400 font-bold text-lg">🔥</span>
            <span className="font-bold text-white">{streak}</span>
            <span className="text-gray-500 text-xs">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
          </div>
        )}
      </div>

      {/* Hero: progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Ring centralizado */}
        <div className="flex justify-center">
          <div className="relative">
            <RingProgress percent={percent} studiedMin={studiedMin} goalMin={goalMin} size={220} />
            {goalReached && (
              <div className="absolute -top-2 -right-2 text-xl">✨</div>
            )}
          </div>
        </div>

        {/* Stats em escala editorial */}
        <div className="space-y-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">estudado</p>
            <p className="text-5xl font-black tracking-tight" style={{ color: goalReached ? '#34d399' : '#f1f1f5' }}>
              {formatMinutes(studiedMin)}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">meta</p>
            <p className="text-2xl font-bold text-gray-500">{formatMinutes(goalMin)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">sessões</p>
              <p className="text-2xl font-bold">{todaySessions.length}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-gray-600 mb-1">progresso</p>
              <p className="text-2xl font-bold" style={{ color: '#818cf8' }}>{percent}%</p>
            </div>
          </div>

          <Link
            href="/timer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: '#818cf8',
              color: '#030305',
              boxShadow: '0 0 24px rgba(129,140,248,0.3)',
            }}
          >
            {studiedMin === 0 ? 'Começar sessão' : 'Continuar'} →
          </Link>
        </div>
      </div>

      <SubjectCards stats={Object.values(subjectStats)} />
      <DailyGoals goals={(goals as DailyGoal[]) ?? []} today={today} />
    </div>
  )
}

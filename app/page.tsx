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

      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <p className="label-dim mb-1 capitalize">{todayLabel}</p>
          <h1 className="text-3xl font-black tracking-tight">Hoje</h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <span className="text-base">🔥</span>
            <span className="font-bold text-white text-sm">{streak}</span>
            <span className="label-dim" style={{ letterSpacing: '0.08em', textTransform: 'none', fontSize: 11 }}>
              {streak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        )}
      </div>

      {/* Hero: progresso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Anel */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Anel decorativo extra — profundidade */}
            <div style={{
              position: 'absolute', inset: -16,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.05)',
            }} />
            <div style={{
              position: 'absolute', inset: -32,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.03)',
            }} />
            <RingProgress percent={percent} studiedMin={studiedMin} goalMin={goalMin} size={220} />
            {goalReached && (
              <div className="absolute -top-2 -right-2 text-xl">✨</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div>
            <p className="label-dim mb-1">estudado</p>
            <p className="text-5xl font-black tracking-tight" style={{ color: goalReached ? '#4ade80' : 'white' }}>
              {formatMinutes(studiedMin)}
            </p>
          </div>
          <div>
            <p className="label-dim mb-1">meta</p>
            <p className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatMinutes(goalMin)}</p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="label-dim mb-1">sessões</p>
              <p className="text-2xl font-bold text-white">{todaySessions.length}</p>
            </div>
            <div>
              <p className="label-dim mb-1">progresso</p>
              <p className="text-2xl font-bold text-white">{percent}%</p>
            </div>
          </div>

          <Link
            href="/timer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'white',
              color: '#07090f',
              boxShadow: '0 0 32px rgba(255,255,255,0.15)',
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

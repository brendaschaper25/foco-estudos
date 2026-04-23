import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PomodoroTimer from '@/components/PomodoroTimer'
import { Settings, Subject } from '@/types'

export default async function TimerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: settings }, { data: subjects }] = await Promise.all([
    supabase.from('settings').select('*').eq('user_id', user.id).single(),
    supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at'),
  ])

  return (
    <div className="space-y-2">
      <div className="border-b border-white/5 pb-6">
        <p className="label-dim mb-1">técnica pomodoro</p>
        <h1 className="text-3xl font-black tracking-tight">Timer</h1>
      </div>
      <PomodoroTimer settings={settings as Settings} subjects={(subjects as Subject[]) ?? []} />
    </div>
  )
}

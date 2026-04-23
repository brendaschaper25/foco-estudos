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
    <div>
      <h1 className="text-xl font-bold mb-8">Timer</h1>
      <PomodoroTimer settings={settings as Settings} subjects={(subjects as Subject[]) ?? []} />
    </div>
  )
}

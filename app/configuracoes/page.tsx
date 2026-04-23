import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SubjectManager from '@/components/SubjectManager'
import SettingsForm from '@/components/SettingsForm'
import { Settings, Subject } from '@/types'

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: settings }, { data: subjects }] = await Promise.all([
    supabase.from('settings').select('*').eq('user_id', user.id).single(),
    supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at'),
  ])

  const presets = {
    foco_min: searchParams.foco ? Number(searchParams.foco) : undefined,
    pausa_curta_min: searchParams.pausa_curta ? Number(searchParams.pausa_curta) : undefined,
    pausa_longa_min: searchParams.pausa_longa ? Number(searchParams.pausa_longa) : undefined,
    ciclos_ate_pausa_longa: searchParams.ciclos ? Number(searchParams.ciclos) : undefined,
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-white/5 pb-6">
        <p className="label-dim mb-1">timer e matérias</p>
        <h1 className="text-3xl font-black tracking-tight">Configurações</h1>
      </div>
      <SubjectManager subjects={(subjects as Subject[]) ?? []} />
      <SettingsForm settings={settings as Settings} presets={presets} />
    </div>
  )
}

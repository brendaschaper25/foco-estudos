'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Settings } from '@/types'
import toast from 'react-hot-toast'

export default function SettingsForm({ settings, presets }: { settings: Settings, presets: Partial<Settings> }) {
  const [form, setForm] = useState({
    foco_min: presets.foco_min ?? settings.foco_min,
    pausa_curta_min: presets.pausa_curta_min ?? settings.pausa_curta_min,
    pausa_longa_min: presets.pausa_longa_min ?? settings.pausa_longa_min,
    ciclos_ate_pausa_longa: presets.ciclos_ate_pausa_longa ?? settings.ciclos_ate_pausa_longa,
    meta_horas_dia: settings.meta_horas_dia,
  })
  const supabase = createClient()

  function setField(key: keyof typeof form, value: number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    const { error } = await supabase.from('settings').update(form).eq('id', settings.id)
    if (error) { toast.error('Erro ao salvar configurações'); return }
    toast.success('Configurações salvas!')
  }

  const field = (label: string, key: keyof typeof form, min: number, max: number, unit: string) => (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-300">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" min={min} max={max} value={form[key]}
          onChange={e => setField(key, Math.min(max, Math.max(min, Number(e.target.value))))}
          className="w-20 px-3 py-1 bg-gray-800 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        <span className="text-gray-500 text-sm w-8">{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Timer & Meta</h2>
      <div className="bg-gray-800 rounded-xl p-6 space-y-4">
        {field('Foco', 'foco_min', 1, 120, 'min')}
        {field('Pausa curta', 'pausa_curta_min', 1, 60, 'min')}
        {field('Pausa longa', 'pausa_longa_min', 1, 120, 'min')}
        {field('Ciclos até pausa longa', 'ciclos_ate_pausa_longa', 1, 10, 'x')}
        {field('Meta diária', 'meta_horas_dia', 0, 24, 'h')}
        <button onClick={save}
          className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg font-medium transition mt-2">
          Salvar configurações
        </button>
      </div>
    </div>
  )
}

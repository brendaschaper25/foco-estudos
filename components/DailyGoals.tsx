'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { DailyGoal } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DailyGoals({ goals, today }: { goals: DailyGoal[], today: string }) {
  const [text, setText] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function addGoal() {
    if (!text.trim()) return
    const { error } = await supabase.from('daily_goals').insert({ descricao: text.trim(), data: today })
    if (error) { toast.error('Erro ao adicionar meta'); return }
    setText('')
    router.refresh()
  }

  async function toggle(goal: DailyGoal) {
    await supabase.from('daily_goals').update({ concluida: !goal.concluida }).eq('id', goal.id)
    router.refresh()
  }

  async function remove(id: string) {
    await supabase.from('daily_goals').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <h2 className="font-semibold text-lg mb-4">Metas de hoje</h2>
      <div className="space-y-2 mb-4">
        {goals.map(g => (
          <div key={g.id} className="flex items-center gap-3">
            <input type="checkbox" checked={g.concluida} onChange={() => toggle(g)}
              className="w-4 h-4 accent-indigo-500" />
            <span className={g.concluida ? 'line-through text-gray-500' : ''}>{g.descricao}</span>
            <button onClick={() => remove(g.id)} className="ml-auto text-gray-600 hover:text-red-400 text-xs">✕</button>
          </div>
        ))}
        {goals.length === 0 && <p className="text-gray-500 text-sm">Nenhuma meta adicionada</p>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          placeholder="Adicionar meta..."
          className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        <button onClick={addGoal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition">
          +
        </button>
      </div>
    </div>
  )
}

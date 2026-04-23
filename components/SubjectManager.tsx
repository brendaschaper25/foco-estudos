'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Subject } from '@/types'
import { SUBJECT_COLORS } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SubjectManager({ subjects }: { subjects: Subject[] }) {
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(SUBJECT_COLORS[0])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function addSubject() {
    setError('')
    if (!nome.trim()) return
    const { error } = await supabase.from('subjects').insert({ nome: nome.trim(), cor })
    if (error?.code === '23505') { setError('Já existe uma matéria com esse nome'); return }
    if (error) { toast.error('Erro ao criar matéria'); return }
    setNome('')
    router.refresh()
  }

  async function saveRename(id: string) {
    if (!editNome.trim()) { setEditingId(null); return }
    const { error } = await supabase.from('subjects').update({ nome: editNome.trim() }).eq('id', id)
    if (error?.code === '23505') { toast.error('Já existe uma matéria com esse nome'); return }
    if (error) { toast.error('Erro ao renomear'); return }
    setEditingId(null)
    router.refresh()
  }

  async function deleteSubject(id: string) {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) { toast.error('Erro ao deletar matéria'); return }
    setDeleteId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Matérias</h2>

      <div className="space-y-2">
        {subjects.map(s => (
          <div key={s.id} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
            {editingId === s.id ? (
              <input
                autoFocus
                value={editNome}
                onChange={e => setEditNome(e.target.value)}
                onBlur={() => saveRename(s.id)}
                onKeyDown={e => { if (e.key === 'Enter') saveRename(s.id); if (e.key === 'Escape') setEditingId(null) }}
                className="flex-1 bg-transparent focus:outline-none border-b border-indigo-500"
              />
            ) : (
              <span className="flex-1 cursor-pointer" onClick={() => { setEditingId(s.id); setEditNome(s.nome) }}>{s.nome}</span>
            )}
            <button onClick={() => setDeleteId(s.id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <input
          value={nome} onChange={e => { setNome(e.target.value); setError('') }}
          placeholder="Nome da matéria" maxLength={50}
          className="w-full bg-transparent focus:outline-none border-b border-gray-600 pb-1"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          {SUBJECT_COLORS.map(c => (
            <button key={c} onClick={() => setCor(c)}
              className={`w-6 h-6 rounded-full transition ${cor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
        <button onClick={addSubject}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition">
          + Adicionar matéria
        </button>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-semibold">Deletar matéria?</h3>
            <p className="text-gray-400 text-sm">Sessões existentes ficam como "Sem matéria".</p>
            <div className="flex gap-3">
              <button onClick={() => deleteSubject(deleteId)}
                className="flex-1 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition">Deletar</button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

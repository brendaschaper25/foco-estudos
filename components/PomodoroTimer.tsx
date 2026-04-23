'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Settings, Subject } from '@/types'
import RingProgress from './RingProgress'
import toast from 'react-hot-toast'

type Phase = 'foco' | 'pausa_curta' | 'pausa_longa'

function playChime(type: 'focus_done' | 'break_done') {
  try {
    const ctx = new AudioContext()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)

    const notes = type === 'focus_done'
      ? [523.25, 659.25, 783.99] // C5 E5 G5 — acorde maior ascendente (recompensa)
      : [783.99, 659.25]          // G5 E5 — dois tons suaves (aviso gentil)

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.3)
    })

    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + notes.length * 0.18 + 0.35)

    setTimeout(() => ctx.close(), (notes.length * 0.18 + 0.5) * 1000)
  } catch {
    // AudioContext não disponível (SSR ou browser restrito)
  }
}

export default function PomodoroTimer({ settings, subjects }: { settings: Settings, subjects: Subject[] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('foco')
  const [cycleCount, setCycleCount] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(settings.foco_min * 60)
  const [running, setRunning] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [pendingSession, setPendingSession] = useState<{ duracao_min: number } | null>(null)
  const [muted, setMuted] = useState(false)
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const router = useRouter()
  const supabase = createClient()

  const phaseDuration = useCallback((p: Phase) => {
    if (p === 'foco') return settings.foco_min * 60
    if (p === 'pausa_curta') return settings.pausa_curta_min * 60
    return settings.pausa_longa_min * 60
  }, [settings])

  const saveSession = useCallback(async (duracao_min: number) => {
    const { error } = await supabase.from('sessions').insert({
      subject_id: selectedSubjectId,
      duracao_min,
    })
    if (error) {
      toast.error('Erro ao salvar sessão')
      setPendingSession({ duracao_min })
    } else {
      router.refresh()
    }
  }, [supabase, selectedSubjectId, router])

  const handlePhaseComplete = useCallback(() => {
    if (phase === 'foco') {
      if (!mutedRef.current) playChime('focus_done')
      saveSession(settings.foco_min)
      const newCycle = cycleCount + 1
      setCycleCount(newCycle)
      const nextPhase = newCycle % settings.ciclos_ate_pausa_longa === 0 ? 'pausa_longa' : 'pausa_curta'
      setPhase(nextPhase)
      setSecondsLeft(phaseDuration(nextPhase))
    } else {
      if (!mutedRef.current) playChime('break_done')
      setPhase('foco')
      setSecondsLeft(phaseDuration('foco'))
    }
    setRunning(false)
  }, [phase, cycleCount, settings, phaseDuration, saveSession])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(id); handlePhaseComplete(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, phase, handlePhaseComplete])

  // Barra de espaço: iniciar/pausar
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return
      e.preventDefault()
      setRunning(r => !r)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  async function retryPending() {
    if (!pendingSession) return
    const { error } = await supabase.from('sessions').insert({
      subject_id: selectedSubjectId,
      duracao_min: pendingSession.duracao_min,
    })
    if (!error) { setPendingSession(null); router.refresh() }
    else toast.error('Falha novamente. Verifique sua conexão.')
  }

  function skipPhase() { handlePhaseComplete() }

  function endSession() {
    if (phase === 'foco' && secondsLeft < settings.foco_min * 60) {
      setShowEndModal(true)
    } else {
      setRunning(false)
      setPhase('foco')
      setSecondsLeft(phaseDuration('foco'))
      setCycleCount(0)
    }
  }

  function confirmEndModal(save: boolean) {
    setShowEndModal(false)
    if (save) {
      const elapsed = settings.foco_min * 60 - secondsLeft
      const duracao_min = Math.max(1, Math.ceil(elapsed / 60))
      saveSession(duracao_min)
    }
    setRunning(false)
    setPhase('foco')
    setSecondsLeft(phaseDuration('foco'))
    setCycleCount(0)
  }

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const seconds = (secondsLeft % 60).toString().padStart(2, '0')
  const totalSecs = phaseDuration(phase)
  const percent = Math.round(((totalSecs - secondsLeft) / totalSecs) * 100)

  const phaseLabel = { foco: 'Foco', pausa_curta: 'Pausa Curta', pausa_longa: 'Pausa Longa' }[phase]

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full max-w-xs">
        <label className="block text-sm text-gray-400 mb-2">Matéria (opcional)</label>
        <select
          value={selectedSubjectId ?? ''}
          onChange={e => setSelectedSubjectId(e.target.value || null)}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg text-sm focus:outline-none"
        >
          <option value="">Sem matéria</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4 uppercase tracking-wider">{phaseLabel} · Ciclo {cycleCount + 1}</p>
        <RingProgress percent={percent} studiedMin={Math.floor((totalSecs - secondsLeft) / 60)} goalMin={settings.foco_min} size={220} />
        <p className="text-5xl font-mono font-bold mt-4">{minutes}:{seconds}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setRunning(r => !r)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition min-w-[100px]">
          {running ? 'Pausar' : 'Iniciar'}
        </button>
        {running && (
          <button onClick={skipPhase}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition">
            Pular →
          </button>
        )}
        <button onClick={endSession}
          className="px-4 py-3 bg-gray-800 hover:bg-red-900 rounded-xl text-sm transition">
          Encerrar
        </button>
        <button
          onClick={() => setMuted(m => !m)}
          title={muted ? 'Ativar som' : 'Silenciar'}
          className="px-3 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition"
        >
          {muted ? '🔕' : '🔔'}
        </button>
      </div>

      <p className="text-xs text-gray-600">Espaço para pausar / iniciar</p>

      {pendingSession && (
        <button onClick={retryPending} className="text-sm text-yellow-400 hover:underline">
          Tentar salvar novamente ({pendingSession.duracao_min}min)
        </button>
      )}

      {showEndModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-semibold text-lg">Salvar sessão parcial?</h3>
            <p className="text-gray-400 text-sm">
              {Math.max(1, Math.ceil((settings.foco_min * 60 - secondsLeft) / 60))} min estudados
            </p>
            <div className="flex gap-3">
              <button onClick={() => confirmEndModal(true)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition">Sim</button>
              <button onClick={() => confirmEndModal(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

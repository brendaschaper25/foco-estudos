'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const WAVE_DELAYS = [0, 1.8, 3.6, 5.4]
const WAVE_CYCLE  = 7.2
const WAVE_SIZE   = 900

function sonarPing(ctx: AudioContext, freq: number, vol = 0.07) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  const lp   = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 1400
  osc.connect(lp); lp.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.22, ctx.currentTime + 2.2)
  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2)
  osc.start(); osc.stop(ctx.currentTime + 2.3)
}

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const ctxRef      = useRef<AudioContext | null>(null)
  const activeRef   = useRef(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const router      = useRouter()
  const supabase    = createClient()

  function clearTimers() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  function scheduleCycle(ctx: AudioContext) {
    const freqs = [380, 340, 300, 268]
    WAVE_DELAYS.forEach((delayS, i) => {
      const t = setTimeout(() => {
        if (activeRef.current) sonarPing(ctx, freqs[i])
      }, delayS * 1000)
      timeoutsRef.current.push(t)
    })
    const next = setTimeout(() => {
      if (activeRef.current) { clearTimers(); scheduleCycle(ctx) }
    }, WAVE_CYCLE * 1000)
    timeoutsRef.current.push(next)
  }

  function startAudio() {
    if (activeRef.current) return
    activeRef.current = true
    try {
      const ctx = new AudioContext()
      if (ctx.state === 'suspended') ctx.resume()
      ctxRef.current = ctx
      scheduleCycle(ctx)
    } catch { /* sem suporte */ }
  }

  useEffect(() => {
    const handler = () => startAudio()
    window.addEventListener('click', handler, { once: true })
    return () => {
      window.removeEventListener('click', handler)
      activeRef.current = false
      clearTimers()
      ctxRef.current?.close()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      // Tenta logar primeiro
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: senha })

      if (signInError) {
        // Se não existe, cria a conta e loga
        const { error: signUpError } = await supabase.auth.signUp({ email, password: senha })
        if (signUpError) {
          setError('Email ou senha inválidos.')
          return
        }
        // Loga após criar conta
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (loginError) { setError('Erro ao entrar. Tente novamente.'); return }
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    fontSize: 14, textAlign: 'center' as const, color: 'white',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    outline: 'none', letterSpacing: '0.04em',
    transition: 'border-color 0.2s',
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ background: '#07090f' }}
    >
      {/* Ondas sonar */}
      <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
        {WAVE_DELAYS.map((delay) => (
          <div key={delay} style={{
            width: WAVE_SIZE, height: WAVE_SIZE,
            position: 'absolute', left: '50%', top: '50%',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 0 18px rgba(255,255,255,0.06)',
            animation: `ripple ${WAVE_CYCLE}s cubic-bezier(0.15,0.65,0.35,1) ${delay}s infinite`,
          }} />
        ))}
        <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
          <div style={{ position: 'absolute', left: -48, top: '50%', width: 96, height: 1, background: 'rgba(255,255,255,0.18)', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: -48, left: '50%', height: 96, width: 1, background: 'rgba(255,255,255,0.18)', transform: 'translateX(-50%)' }} />
          {[-32,-16,16,32].map(x => (
            <div key={x} style={{ position: 'absolute', left: x, top: '50%', width: 1, height: x % 32 === 0 ? 10 : 6, background: 'rgba(255,255,255,0.22)', transform: 'translate(-50%,-50%)' }} />
          ))}
          {[-32,-16,16,32].map(y => (
            <div key={y} style={{ position: 'absolute', top: y, left: '50%', height: 1, width: y % 32 === 0 ? 10 : 6, background: 'rgba(255,255,255,0.22)', transform: 'translate(-50%,-50%)' }} />
          ))}
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: 'white',
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            animation: 'center-pulse 3s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-[320px] flex flex-col items-center text-center gap-9">
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ width: 18, height: 1, background: 'rgba(255,255,255,0.25)', display: 'inline-block' }} />
            sistema de foco
            <span style={{ width: 18, height: 1, background: 'rgba(255,255,255,0.25)', display: 'inline-block' }} />
          </p>
          <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>
            FOCO.
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', marginTop: 14, lineHeight: 1.65 }}>
            25 minutos de cada vez.<br />Um passo de cada vez.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <input
            type="email" required
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
            onBlur={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
          <input
            type="password" required
            placeholder="senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
            onBlur={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
          {error && (
            <p style={{ color: '#f87171', fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              background: 'white', color: '#07090f', border: 'none',
              boxShadow: loading ? 'none' : '0 0 40px rgba(255,255,255,0.18)',
              opacity: loading ? 0.55 : 1,
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}
          >
            {loading ? 'Entrando…' : 'Entrar →'}
          </button>
        </form>

        <p style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
          acesso pessoal
        </p>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

// 4 ondas com delay escalonado — efeito sonar contínuo
const WAVES = [0, 1.8, 3.6, 5.4]
const WAVE_SIZE = 860

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError('Erro ao enviar o link. Verifique o email.')
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* Ondas sonar — expandem do centro e somem */}
      <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
        {WAVES.map((delay) => (
          <div
            key={delay}
            style={{
              width: WAVE_SIZE,
              height: WAVE_SIZE,
              position: 'absolute',
              left: '50%',
              top: '50%',
              borderRadius: '50%',
              border: '1px solid rgba(34,211,238,0.7)',
              boxShadow: '0 0 12px rgba(34,211,238,0.2), inset 0 0 8px rgba(34,211,238,0.05)',
              animation: `ripple 7.2s cubic-bezier(0.2,0.6,0.4,1) ${delay}s infinite`,
            }}
          />
        ))}
        {/* Ponto central */}
        <div style={{
          width: 10, height: 10,
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: '#22d3ee',
          animation: 'center-pulse 3s ease-in-out infinite',
        }} />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center gap-8">

        {/* Marca */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase mb-5" style={{ color: 'rgba(34,211,238,0.55)' }}>
            <span className="w-5 h-px" style={{ background: 'rgba(34,211,238,0.4)' }} />
            sistema de foco
            <span className="w-5 h-px" style={{ background: 'rgba(34,211,238,0.4)' }} />
          </div>
          <h1 className="text-6xl font-black tracking-tight text-white leading-none">
            FOCO<span style={{ color: '#22d3ee' }}>.</span>
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(240,249,255,0.4)' }}>
            25 minutos de cada vez.<br />Um passo de cada vez.
          </p>
        </div>

        {/* Form */}
        {sent ? (
          <div className="glass rounded-2xl px-8 py-6 w-full text-center space-y-2">
            <p className="text-2xl">📬</p>
            <p className="text-white font-semibold">Link enviado!</p>
            <p className="text-sm" style={{ color: 'rgba(240,249,255,0.45)' }}>
              Confira <span style={{ color: '#22d3ee' }}>{email}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm text-center text-white tracking-wide transition placeholder:text-gray-600 focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {error && (
              <p className="text-red-400 text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: '#22d3ee',
                color: '#010d14',
                boxShadow: loading ? 'none' : '0 0 32px rgba(34,211,238,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-900/40 border-t-cyan-900 animate-spin" />
                  Enviando…
                </span>
              ) : 'Entrar →'}
            </button>
          </form>
        )}

        <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(240,249,255,0.35)' }}>
          sem senha · acesso por email
        </p>
      </div>
    </div>
  )
}

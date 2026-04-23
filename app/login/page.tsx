'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const RINGS = [
  { size: 140,  opacity: 0.55, glow: 14, delay: 0 },
  { size: 260,  opacity: 0.38, glow: 10, delay: 0.4 },
  { size: 400,  opacity: 0.24, glow: 6,  delay: 0.8 },
  { size: 560,  opacity: 0.14, glow: 4,  delay: 1.2 },
  { size: 730,  opacity: 0.08, glow: 2,  delay: 1.6 },
  { size: 920,  opacity: 0.04, glow: 0,  delay: 2.0 },
]

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

      {/* Anéis concêntricos — motivo "foco" */}
      <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
        {RINGS.map((ring, i) => (
          <div
            key={ring.size}
            style={{
              width: ring.size,
              height: ring.size,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1px solid rgba(129,140,248,${ring.opacity})`,
              boxShadow: ring.glow > 0
                ? `0 0 ${ring.glow}px rgba(129,140,248,${ring.opacity * 0.6}), inset 0 0 ${ring.glow}px rgba(129,140,248,0.05)`
                : 'none',
              animation: `ring-pulse ${4.5 + i * 0.5}s ease-in-out ${ring.delay}s infinite`,
            }}
          />
        ))}
        {/* Centro iluminado */}
        <div style={{
          width: 12, height: 12,
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: '#818cf8',
          boxShadow: '0 0 0 4px rgba(129,140,248,0.2), 0 0 40px 12px rgba(129,140,248,0.5)',
        }} />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center gap-8">

        {/* Marca */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-indigo-400/70 mb-6">
            <span className="w-4 h-px bg-indigo-400/50" />
            sistema de foco
            <span className="w-4 h-px bg-indigo-400/50" />
          </div>
          <h1 className="text-6xl font-black tracking-tight text-white leading-none">
            FOCO<span style={{ color: '#818cf8' }}>.</span>
          </h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            25 minutos de cada vez.<br />Um passo de cada vez.
          </p>
        </div>

        {/* Form / Confirmação */}
        {sent ? (
          <div className="glass rounded-2xl px-8 py-6 w-full text-center space-y-2">
            <p className="text-2xl">📬</p>
            <p className="text-white font-semibold">Link enviado!</p>
            <p className="text-gray-500 text-sm">
              Confira <span className="text-indigo-400">{email}</span>
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
              className="w-full px-4 py-3.5 bg-white/[0.04] text-white rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/60 transition text-sm text-center placeholder:text-gray-600 tracking-wide"
            />
            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: loading ? 'rgba(129,140,248,0.3)' : '#818cf8',
                color: '#030305',
                boxShadow: loading ? 'none' : '0 0 32px rgba(129,140,248,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-900/40 border-t-indigo-900 animate-spin" />
                  Enviando…
                </span>
              ) : 'Entrar →'}
            </button>
          </form>
        )}

        <p className="text-gray-700 text-xs tracking-widest uppercase">sem senha</p>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

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
    if (error) {
      setError('Erro ao enviar o link. Verifique o email e tente novamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-700/8 blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/6 blur-[80px]" />
      </div>

      {/* Marca */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Foco<span className="text-indigo-400">.</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 tracking-wide">estude com intenção</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-2xl p-8 shadow-2xl">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-4">📬</div>
            <p className="text-white font-semibold text-lg">Link enviado!</p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Verifique sua caixa de entrada em<br />
              <span className="text-indigo-400 font-medium">{email}</span>
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">
              Entre com seu email — vamos te mandar um link mágico.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition placeholder:text-gray-600 text-sm"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all glow-indigo"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Enviando…
                  </span>
                ) : 'Entrar →'}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-gray-700 text-xs mt-8">sem senha · sem complicação</p>
    </div>
  )
}

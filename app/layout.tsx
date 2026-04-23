import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase-server'
import Nav from '@/components/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Foco Estudos',
  description: 'Timer Pomodoro e tracking de estudos',
}

// Marcadores de canto estilo visor/câmera + grid de pontos
function GeometricBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Grid de pontos muito sutil */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Colchetes de canto — estilo visor de precisão */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Superior esquerdo */}
        <path d="M 3 12 L 3 3 L 12 3" fill="none" stroke="white" strokeWidth="0.35" opacity="0.18"/>
        <path d="M 3.5 15 L 3.5 3.5 L 15 3.5" fill="none" stroke="white" strokeWidth="0.12" opacity="0.08"/>
        {/* Superior direito */}
        <path d="M 88 3 L 97 3 L 97 12" fill="none" stroke="white" strokeWidth="0.35" opacity="0.18"/>
        <path d="M 85 3.5 L 96.5 3.5 L 96.5 15" fill="none" stroke="white" strokeWidth="0.12" opacity="0.08"/>
        {/* Inferior esquerdo */}
        <path d="M 3 88 L 3 97 L 12 97" fill="none" stroke="white" strokeWidth="0.35" opacity="0.18"/>
        <path d="M 3.5 85 L 3.5 96.5 L 15 96.5" fill="none" stroke="white" strokeWidth="0.12" opacity="0.08"/>
        {/* Inferior direito */}
        <path d="M 88 97 L 97 97 L 97 88" fill="none" stroke="white" strokeWidth="0.35" opacity="0.18"/>
        <path d="M 85 96.5 L 96.5 96.5 L 96.5 85" fill="none" stroke="white" strokeWidth="0.12" opacity="0.08"/>
        {/* Linha senoidal no rodapé */}
        <path d="M 0 98 Q 12.5 95.5 25 98 Q 37.5 100.5 50 98 Q 62.5 95.5 75 98 Q 87.5 100.5 100 98"
          fill="none" stroke="white" strokeWidth="0.18" opacity="0.07"/>
      </svg>
    </div>
  )
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('settings').upsert(
      { user_id: user.id },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
  }

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* GeometricBg só aparece para usuários logados — login tem seu próprio fundo */}
        {user && <GeometricBg />}
        <Toaster position="top-right" toastOptions={{
          style: { background: '#12151f', color: '#f0f9ff', border: '1px solid rgba(255,255,255,0.08)' }
        }} />
        {user && <Nav />}
        <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
          {children}
        </main>
      </body>
    </html>
  )
}

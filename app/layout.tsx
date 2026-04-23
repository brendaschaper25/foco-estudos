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

// Scope reticle — concentric circles + crosshairs suggesting precision/focus
function GeometricBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Concentric scope rings */}
        {[10, 20, 32, 46, 62, 80].map((r, i) => (
          <circle key={r} cx="50" cy="50" r={r}
            fill="none" stroke="white" strokeWidth="0.12"
            opacity={Math.max(0.02, 0.09 - i * 0.013)}
          />
        ))}
        {/* Crosshair lines */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.1" opacity="0.055" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.1" opacity="0.055" />
        {/* Diagonal at 30° — off-axis frequency line */}
        <line x1="2" y1="26" x2="98" y2="74" stroke="white" strokeWidth="0.07" opacity="0.025" />
        <line x1="26" y1="2" x2="74" y2="98" stroke="white" strokeWidth="0.07" opacity="0.025" />
        {/* Tick marks on horizontal axis */}
        {[-40,-30,-20,-10,10,20,30,40].map(x => (
          <line key={x} x1={50+x} y1="48.8" x2={50+x} y2="51.2"
            stroke="white" strokeWidth="0.12" opacity="0.06" />
        ))}
        {/* Tick marks on vertical axis */}
        {[-40,-30,-20,-10,10,20,30,40].map(y => (
          <line key={y} x1="48.8" y1={50+y} x2="51.2" y2={50+y}
            stroke="white" strokeWidth="0.12" opacity="0.06" />
        ))}
        {/* Subtle sine wave across center */}
        <path
          d="M 0 50 Q 12.5 44 25 50 Q 37.5 56 50 50 Q 62.5 44 75 50 Q 87.5 56 100 50"
          fill="none" stroke="white" strokeWidth="0.12" opacity="0.04"
        />
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
        <GeometricBg />
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

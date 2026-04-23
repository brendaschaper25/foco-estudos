import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Foco Estudos',
  description: 'Timer Pomodoro e tracking de estudos',
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
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff' } }} />
        {user && (
          <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-indigo-400 transition">Dashboard</Link>
            <Link href="/timer" className="hover:text-indigo-400 transition">Timer</Link>
            <Link href="/historico" className="hover:text-indigo-400 transition">Histórico</Link>
            <Link href="/tecnicas" className="hover:text-indigo-400 transition">Técnicas</Link>
            <Link href="/configuracoes" className="hover:text-indigo-400 transition">Configurações</Link>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </nav>
        )}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/timer', label: 'Timer' },
  { href: '/historico', label: 'Histórico' },
  { href: '/tecnicas', label: 'Técnicas' },
  { href: '/configuracoes', label: 'Config' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-white/5 px-6 py-0 flex items-center gap-1 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
      <Link href="/" className="font-bold text-white tracking-tight mr-6 py-4 text-sm">
        Foco<span className="text-indigo-400">.</span>
      </Link>

      {links.map(({ href, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-4 text-sm border-b-2 transition-colors ${
              active
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </Link>
        )
      })}

      <div className="ml-auto pl-4 border-l border-white/5 py-4">
        <LogoutButton />
      </div>
    </nav>
  )
}

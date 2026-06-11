'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Megaphone, Sparkles,
  BarChart3, Settings, Zap,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'AI Studio', href: '/studio', icon: Sparkles },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -64, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -64, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-border flex flex-col items-center py-3 z-50"
    >
      <Link href="/" className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm mb-4 shrink-0">
        <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
      </Link>

      <div className="w-6 h-px bg-border mb-3" />

      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center relative transition-all duration-150',
                  active
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                {item.name === 'AI Studio' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full border border-white" />
                )}
              </Link>
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                {item.name}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="relative group">
        <Link
          href="/settings"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
        </Link>
        <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
          Settings
        </div>
      </div>
    </motion.aside>
  )
}
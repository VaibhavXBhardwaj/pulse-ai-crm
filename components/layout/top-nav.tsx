'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Megaphone,
  Sparkles, BarChart3, Search, Bell, Zap,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'AI Studio', href: '/studio', icon: Sparkles },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-md border-b border-border"
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-[15px] text-gray-900 tracking-tight">
            PulseAI
          </span>
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                <span>{item.name}</span>
                {item.name === 'AI Studio' && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500 text-white leading-none">
                    AI
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <Avatar className="w-7 h-7 cursor-pointer">
            <AvatarFallback className="text-[11px] font-semibold bg-brand-50 text-brand-600">
              VA
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </motion.header>
  )
}
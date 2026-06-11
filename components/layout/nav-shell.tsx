'use client'

import { AnimatePresence } from 'framer-motion'
import { useScroll } from '@/hooks/use-scroll'
import { TopNav } from './top-nav'
import { SideNav } from './side-nav'
import { cn } from '@/lib/utils'

export function NavShell({ children }: { children: React.ReactNode }) {
  const { scrolled } = useScroll(80)

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AnimatePresence mode="wait">
        {!scrolled ? <TopNav key="top" /> : <SideNav key="side" />}
      </AnimatePresence>

      <main
        className={cn(
          'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          scrolled ? 'pl-16 pt-0' : 'pl-0 pt-14'
        )}
      >
        {children}
      </main>
    </div>
  )
} 
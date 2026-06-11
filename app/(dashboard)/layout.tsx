import { NavShell } from '@/components/layout/nav-shell'
import { ScrollProgress } from '@/components/layout/scroll-progress'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <NavShell>{children}</NavShell>
    </>
  )
}
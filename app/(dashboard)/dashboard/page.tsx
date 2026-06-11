'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, Megaphone, TrendingUp, Target,
  ArrowUpRight, ArrowRight, Sparkles,
  AlertTriangle, MapPin, ShoppingBag,
  ChevronRight, Activity, Zap,
} from 'lucide-react'
import {
  formatCurrency, formatCompactNumber,
  formatRelativeTime, getInitials,
} from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

// ─── Unchanged business data ─────────────────────────────────────────────────

const weeklyData = [
  { day: 'Mon', sent: 420, delivered: 398, opened: 180 },
  { day: 'Tue', sent: 380, delivered: 361, opened: 210 },
  { day: 'Wed', sent: 560, delivered: 532, opened: 290 },
  { day: 'Thu', sent: 490, delivered: 465, opened: 240 },
  { day: 'Fri', sent: 620, delivered: 589, opened: 310 },
  { day: 'Sat', sent: 280, delivered: 266, opened: 140 },
  { day: 'Sun', sent: 190, delivered: 180, opened: 95 },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: '#10B981', bg: '#ECFDF5' },
  completed: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6' },
  draft:     { label: 'Draft',     color: '#F59E0B', bg: '#FFFBEB' },
  queued:    { label: 'Queued',    color: '#6366F1', bg: '#EEF2FF' },
  paused:    { label: 'Paused',    color: '#EF4444', bg: '#FEF2F2' },
  failed:    { label: 'Failed',    color: '#EF4444', bg: '#FEF2F2' },
}

const CHANNEL_COLORS: Record<string, string> = {
  email: '#6366F1', whatsapp: '#10B981', sms: '#F59E0B', rcs: '#8B5CF6',
}

const CUSTOMER_STATUS: Record<string, { color: string; bg: string }> = {
  active:   { color: '#10B981', bg: '#ECFDF5' },
  at_risk:  { color: '#F59E0B', bg: '#FFFBEB' },
  churned:  { color: '#EF4444', bg: '#FEF2F2' },
  new:      { color: '#6366F1', bg: '#EEF2FF' },
}

// ─── Animation config ─────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1]

const kpiContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const kpiCard = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
}

const sectionEntry = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.44, delay, ease: EASE },
})

// ─── Premium reusable UI components ───────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E4EAF4] shadow-[0_1px_3px_rgba(10,20,50,0.05),0_1px_2px_rgba(10,20,50,0.04)] overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}

function CardHeader({
  title,
  sub,
  icon: Icon,
  iconColor = '#6366F1',
  action,
  accent,
}: {
  title: string
  sub: string
  icon?: React.ElementType
  iconColor?: string
  action?: React.ReactNode
  accent?: string
}) {
  return (
    <div className="px-6 py-4 border-b border-[#EEF2FA] flex items-center justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-px">
          {Icon && (
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: iconColor }} strokeWidth={2} />
          )}
          <h2 className="font-semibold text-[13px] text-slate-800 tracking-tight leading-none">
            {title}
          </h2>
        </div>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: accent ?? '#94A3B8' }}
        >
          {sub}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors duration-150"
    >
      View all <ArrowRight className="w-3 h-3" />
    </Link>
  )
}

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  accent,
}: {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  trend?: string
  accent: string
}) {
  return (
    <motion.div
      variants={kpiCard}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 480, damping: 34 } }}
      className="relative bg-white rounded-2xl border border-[#E4EAF4] shadow-[0_1px_3px_rgba(10,20,50,0.05)] hover:shadow-[0_10px_32px_rgba(10,20,50,0.08),0_2px_8px_rgba(10,20,50,0.04)] transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      {/* Accent line */}
      <div className="h-[2px] w-full shrink-0" style={{ background: accent }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.1em] leading-none mt-0.5"
            style={{ color: '#94A3B8' }}
          >
            {title}
          </span>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accent}10` }}
          >
            <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={2} />
          </div>
        </div>

        <div>
          <div
            className="font-black leading-none text-slate-900 tracking-tight tabular-nums"
            style={{ fontSize: '2.05rem', fontFeatureSettings: '"tnum"' }}
          >
            {value}
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-[11px] text-slate-400 leading-none">{sub}</span>
            {trend && (
              <span
                className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none"
                style={{ color: '#059669', background: '#D1FAE5' }}
              >
                <ArrowUpRight className="w-2.5 h-2.5" />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
  })

  const pieData = data ? [
    { name: 'Active',  value: data.stats.activeCustomers,  color: '#10B981' },
    { name: 'At Risk', value: data.stats.atRiskCustomers,  color: '#F59E0B' },
    { name: 'Churned', value: data.stats.churnedCustomers, color: '#EF4444' },
    { name: 'New',     value: data.stats.totalCustomers - data.stats.activeCustomers - data.stats.atRiskCustomers - data.stats.churnedCustomers, color: '#6366F1' },
  ] : []

  return (
    <div className="min-h-screen" style={{ background: '#F3F6FB' }}>

      {/* ═══════════════════════════════════════════════════════
          HERO — dark command-centre header, the only dark
          surface on the page. Transitions hard to white below.
      ═══════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #060F1E 0%, #0C1829 60%, #070D1B 100%)' }}
      >
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(148,163,184,0.07) 1.5px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Indigo radial bloom — top-right */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 800px 320px at 72% -10%, rgba(99,102,241,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-9">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-start justify-between gap-6"
          >
            {/* Left — title block */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: '#64748B' }}
                >
                  Live overview
                </span>
              </div>

              <h1 className="font-black text-white leading-tight tracking-tight" style={{ fontSize: '2.15rem' }}>
                Dashboard
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed max-w-sm" style={{ color: '#64748B' }}>
                Customer engagement and revenue across all channels.
              </p>
            </div>

            {/* Right — action buttons */}
            <div className="flex items-center gap-2.5 pt-1.5 shrink-0">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.88)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#A5B4FC' }} />
                New Campaign
              </Link>
              <Link
                href="/customers"
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-xl text-white transition-all duration-200"
                style={{
                  background: '#6366F1',
                  boxShadow: '0 4px 18px rgba(99,102,241,0.30)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#5254CC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#6366F1'
                }}
              >
                <Users className="w-3.5 h-3.5" />
                Customers
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hard edge — no fade, intentional cut */}
        <div
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          CONTENT AREA
      ═══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* ── KPI COMMAND CENTER ─────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[142px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={kpiContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <KPICard
              title="Total Customers"
              value={formatCompactNumber(data?.stats.totalCustomers ?? 0)}
              sub={`${data?.stats.activeCustomers ?? 0} active right now`}
              icon={Users}
              trend="+12%"
              accent="#6366F1"
            />
            <KPICard
              title="Total Revenue"
              value={formatCurrency(data?.stats.totalRevenue ?? 0)}
              sub="from completed orders"
              icon={TrendingUp}
              trend="+8.2%"
              accent="#10B981"
            />
            <KPICard
              title="Active Campaigns"
              value={String(data?.stats.activeCampaigns ?? 0)}
              sub={`of ${data?.stats.totalCampaigns ?? 0} total campaigns`}
              icon={Megaphone}
              accent="#F59E0B"
            />
            <KPICard
              title="Conversion Rate"
              value={`${data?.stats.conversionRate ?? 0}%`}
              sub="campaign average"
              icon={Target}
              trend="+2.1%"
              accent="#8B5CF6"
            />
          </motion.div>
        )}

        {/* ── CHARTS ROW ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Communication Activity — 2 cols */}
          <motion.div {...sectionEntry(0.18)} className="col-span-2">
            <Card className="h-full">
              <div className="px-6 py-5 border-b border-[#EEF2FA] flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-px">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" strokeWidth={2} />
                    <h2 className="font-semibold text-[13px] text-slate-800 tracking-tight leading-none">
                      Communication Activity
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Message performance this week</p>
                </div>
                {/* Floating legend */}
                <div className="flex items-center gap-4 shrink-0 pt-0.5">
                  {[
                    { label: 'Sent',      color: '#6366F1' },
                    { label: 'Delivered', color: '#10B981' },
                    { label: 'Opened',    color: '#F59E0B' },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-5">
                <ResponsiveContainer width="100%" height={252}>
                  <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E4EAF4',
                        borderRadius: 10,
                        fontSize: 12,
                        boxShadow: '0 8px 28px rgba(10,20,50,0.09)',
                        padding: '8px 12px',
                      }}
                      cursor={{ stroke: '#EEF2FA', strokeWidth: 2 }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="#6366F1" strokeWidth={1.5} fill="url(#sentGrad)" dot={false} />
                    <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={1.5} fill="url(#deliveredGrad)" dot={false} />
                    <Area type="monotone" dataKey="opened" stroke="#F59E0B" strokeWidth={1.5} fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Customer Health — 1 col */}
          <motion.div {...sectionEntry(0.26)}>
            <Card className="h-full">
              <CardHeader title="Customer Health" sub="Audience breakdown" />
              <div className="px-6 py-5">
                {isLoading ? (
                  <Skeleton className="h-40 rounded-full mx-auto w-40" />
                ) : (
                  <>
                    {/* Donut + center stat */}
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={158}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={68}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span
                          className="font-black leading-none text-slate-900 tracking-tight tabular-nums"
                          style={{ fontSize: '1.75rem', fontFeatureSettings: '"tnum"' }}
                        >
                          {formatCompactNumber(data?.stats.totalCustomers ?? 0)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-[0.09em]">
                          Total
                        </span>
                      </div>
                    </div>

                    {/* Legend rows */}
                    <div className="mt-3 space-y-2.5">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                            {d.name}
                          </span>
                          <span
                            className="text-[12px] font-bold text-slate-800 tabular-nums"
                            style={{ fontFeatureSettings: '"tnum"' }}
                          >
                            {d.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── CAMPAIGNS + ORDERS ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Recent Campaigns — 2 cols */}
          <motion.div {...sectionEntry(0.32)} className="col-span-2">
            <Card>
              <CardHeader
                title="Recent Campaigns"
                sub="Latest activity"
                icon={Megaphone}
                iconColor="#F59E0B"
                action={<ViewAll href="/campaigns" />}
              />
              {/* Table head */}
              <div className="px-6 py-2.5 grid grid-cols-12 gap-2 bg-[#F8FAFE] border-b border-[#EEF2FA]">
                <span className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Campaign</span>
                <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Channel</span>
                <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Status</span>
                <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em] text-right">Sent</span>
                <span className="col-span-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em] text-right">When</span>
              </div>
              {/* Rows */}
              <div>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="px-6 py-4 flex items-center gap-3 border-b border-[#F5F7FC]">
                        <Skeleton className="h-3 w-44" />
                        <Skeleton className="h-3 w-16 ml-auto" />
                      </div>
                    ))
                  : data?.recentCampaigns.map((c: {
                      id: string; name: string; status: string; channel: string;
                      audienceSize: number; launchedAt: string | null; createdAt: string;
                    }) => {
                      const s = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft
                      return (
                        <Link
                          key={c.id}
                          href={`/campaigns/${c.id}`}
                          className="px-6 py-3.5 grid grid-cols-12 gap-2 items-center group hover:bg-indigo-50/40 transition-colors duration-150 border-b border-[#F5F7FC] last:border-0"
                        >
                          <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: s.color }}
                            />
                            <span className="text-[12px] font-medium text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                              {c.name}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                              style={{
                                color: CHANNEL_COLORS[c.channel],
                                background: `${CHANNEL_COLORS[c.channel]}14`,
                              }}
                            >
                              {c.channel}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: s.color, background: s.bg }}
                            >
                              {s.label}
                            </span>
                          </div>
                          <div
                            className="col-span-2 text-[12px] font-semibold text-slate-500 text-right tabular-nums"
                            style={{ fontFeatureSettings: '"tnum"' }}
                          >
                            {c.audienceSize.toLocaleString()}
                          </div>
                          <div className="col-span-1 text-[11px] text-slate-400 text-right">
                            {c.launchedAt ? formatRelativeTime(c.launchedAt) : '—'}
                          </div>
                        </Link>
                      )
                    })}
              </div>
            </Card>
          </motion.div>

          {/* Recent Orders — 1 col */}
          <motion.div {...sectionEntry(0.38)}>
            <Card>
              <CardHeader
                title="Recent Orders"
                sub="Latest purchases"
                icon={ShoppingBag}
                iconColor="#8B5CF6"
              />
              <div>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="px-6 py-3.5 flex items-center gap-3 border-b border-[#F5F7FC]">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                        <Skeleton className="h-3 w-14" />
                      </div>
                    ))
                  : data?.recentOrders.map((o: {
                      id: string; amount: number; customerName: string;
                      city: string | null; createdAt: string;
                    }) => (
                      <div
                        key={o.id}
                        className="px-6 py-3.5 flex items-center gap-3 border-b border-[#F5F7FC] last:border-0"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-1"
                          style={{
                            background: 'linear-gradient(135deg, #EDE9FE, #EEF2FF)',
                            ringColor: 'rgba(139,92,246,0.15)',
                          }}
                        >
                          <span className="text-[10px] font-bold text-indigo-600">
                            {getInitials(o.customerName)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-slate-700 truncate">
                            {o.customerName}
                          </div>
                          {o.city && (
                            <div className="flex items-center gap-0.5 text-[10px] text-slate-400 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {o.city}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className="text-[12px] font-bold text-slate-900 tabular-nums"
                            style={{ fontFeatureSettings: '"tnum"' }}
                          >
                            {formatCurrency(o.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {formatRelativeTime(o.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── TOP CUSTOMERS + NEEDS ATTENTION ────────────────── */}
        <div className="grid grid-cols-3 gap-4 pb-8">

          {/* Top Customers — 2 cols */}
          <motion.div {...sectionEntry(0.42)} className="col-span-2">
            <Card>
              <CardHeader
                title="Top Customers"
                sub="Highest lifetime value"
                icon={Users}
                iconColor="#6366F1"
                action={<ViewAll href="/customers" />}
              />
              {/* Sticky table head */}
              <div className="px-6 py-2.5 grid grid-cols-12 gap-2 bg-[#F8FAFE] border-b border-[#EEF2FA] sticky top-0 z-10">
                <span className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Customer</span>
                <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em] text-right">Orders</span>
                <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em] text-right">Total Spend</span>
                <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em] text-right">Status</span>
              </div>
              <div>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="px-6 py-4 flex items-center gap-3 border-b border-[#F5F7FC]">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-16 ml-auto" />
                      </div>
                    ))
                  : data?.topCustomers.map((c: {
                      id: string; name: string; email: string; city: string | null;
                      totalSpend: number; orderCount: number; status: string; lastOrderAt: string | null;
                    }) => {
                      const st = CUSTOMER_STATUS[c.status] ?? CUSTOMER_STATUS.active
                      return (
                        <Link
                          key={c.id}
                          href={`/customers/${c.id}`}
                          className="px-6 py-3.5 grid grid-cols-12 gap-2 items-center group hover:bg-indigo-50/40 transition-colors duration-150 border-b border-[#F5F7FC] last:border-0"
                        >
                          <div className="col-span-5 flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-1"
                              style={{
                                background: 'linear-gradient(135deg, #EEF2FF, #EDE9FE)',
                                ringColor: 'rgba(99,102,241,0.18)',
                              }}
                            >
                              <span className="text-[10px] font-bold text-indigo-600">
                                {getInitials(c.name)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                {c.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {c.city ?? c.email}
                              </div>
                            </div>
                          </div>
                          <div
                            className="col-span-2 text-[12px] font-semibold text-slate-600 text-right tabular-nums"
                            style={{ fontFeatureSettings: '"tnum"' }}
                          >
                            {c.orderCount}
                          </div>
                          <div
                            className="col-span-3 text-[12px] font-bold text-slate-900 text-right tabular-nums"
                            style={{ fontFeatureSettings: '"tnum"' }}
                          >
                            {formatCurrency(c.totalSpend)}
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                              style={{ color: st.color, background: st.bg }}
                            >
                              {c.status.replace('_', ' ')}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
              </div>
            </Card>
          </motion.div>

          {/* Needs Attention — 1 col */}
          <motion.div {...sectionEntry(0.48)}>
            <Card className="flex flex-col">
              {/* Amber alert header — the only warm element in the page */}
              <div
                className="px-6 py-4 border-b flex items-center justify-between shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 60%, #FFFBEB 100%)',
                  borderBottomColor: 'rgba(245,158,11,0.15)',
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-px">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2} />
                    <h2 className="font-semibold text-[13px] text-slate-800 tracking-tight leading-none">
                      Needs Attention
                    </h2>
                  </div>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(180,120,0,0.75)' }}>
                    At-risk customers
                  </p>
                </div>
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.20)' }}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                </div>
              </div>

              {/* Risk list */}
              <div className="flex-1">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="px-6 py-3.5 flex items-center gap-3 border-b border-[#F5F7FC]">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </div>
                    ))
                  : data?.atRiskList.map((c: {
                      id: string; name: string; totalSpend: number; lastOrderAt: string | null;
                    }) => (
                      <Link
                        key={c.id}
                        href={`/customers/${c.id}`}
                        className="px-6 py-3.5 flex items-center gap-3 group hover:bg-amber-50/50 transition-colors duration-150 border-b border-[#F5F7FC] last:border-0"
                      >
                        {/* Avatar with amber alert dot */}
                        <div className="relative shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: '#FFFBEB',
                              border: '1px solid rgba(245,158,11,0.25)',
                            }}
                          >
                            <span className="text-[10px] font-bold text-amber-700">
                              {getInitials(c.name)}
                            </span>
                          </div>
                          <div
                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                            style={{
                              background: '#FBBF24',
                              border: '2px solid white',
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {formatCurrency(c.totalSpend)} lifetime
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-amber-500 shrink-0 text-right">
                          {c.lastOrderAt ? formatRelativeTime(c.lastOrderAt) : '—'}
                        </div>
                      </Link>
                    ))}
              </div>

              {/* CTA */}
              <div className="px-6 py-4 border-t border-[#EEF2FA] shrink-0">
                <Link
                  href="/studio"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-[12px] font-bold text-indigo-600 rounded-xl transition-colors duration-150"
                  style={{ background: '#EEF2FF' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E0E7FF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#EEF2FF'
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create win-back campaign
                </Link>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
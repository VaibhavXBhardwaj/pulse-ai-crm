'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, Megaphone, TrendingUp, Target,
  ArrowUpRight, ArrowRight, Sparkles,
  Activity, UserCheck, UserMinus, AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatCompactNumber, formatRelativeTime, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

import type { Variants } from 'framer-motion'

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const CHANNEL_COLORS: Record<string, string> = {
  email: '#6366F1',
  whatsapp: '#10B981',
  sms: '#F59E0B',
  rcs: '#8B5CF6',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: '#10B981', bg: '#ECFDF5' },
  completed: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6' },
  draft:     { label: 'Draft',     color: '#F59E0B', bg: '#FFFBEB' },
  queued:    { label: 'Queued',    color: '#6366F1', bg: '#EEF2FF' },
  paused:    { label: 'Paused',    color: '#EF4444', bg: '#FEF2F2' },
}

// Fake weekly trend data for the chart
const weeklyData = [
  { day: 'Mon', sent: 420, delivered: 398, opened: 180 },
  { day: 'Tue', sent: 380, delivered: 361, opened: 210 },
  { day: 'Wed', sent: 560, delivered: 532, opened: 290 },
  { day: 'Thu', sent: 490, delivered: 465, opened: 240 },
  { day: 'Fri', sent: 620, delivered: 589, opened: 310 },
  { day: 'Sat', sent: 280, delivered: 266, opened: 140 },
  { day: 'Sun', sent: 190, delivered: 180, opened: 95 },
]

function StatCard({
  title, value, sub, icon: Icon, trend, color, delay = 0,
}: {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  trend?: string
  color: string
  delay?: number
}) {
  return (
    <motion.div variants={item} className="pulse-card p-5 flex flex-col gap-3 group hover:shadow-dropdown transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="stat-number text-2xl text-gray-900">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{sub}</span>
          {trend && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
  })

  const pieData = data ? [
    { name: 'Active', value: data.stats.activeCustomers, color: '#10B981' },
    { name: 'At Risk', value: data.stats.atRiskCustomers, color: '#F59E0B' },
    { name: 'Churned', value: data.stats.churnedCustomers, color: '#EF4444' },
    { name: 'New', value: data.stats.totalCustomers - data.stats.activeCustomers - data.stats.atRiskCustomers - data.stats.churnedCustomers, color: '#6366F1' },
  ] : []

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="px-6 py-8 border-b border-border bg-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-screen-xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight">
                Good morning, Vaibhav
              </h1>
              <p className="text-gray-500 mt-0.5 text-sm">
                Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/studio" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-white hover:bg-gray-50 transition-colors">
  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
  New Campaign
</Link>
              <Link href="/customers" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors">
  <Users className="w-3.5 h-3.5" />
  View Customers
</Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Customers"
              value={formatCompactNumber(data?.stats.totalCustomers ?? 0)}
              sub={`${data?.stats.activeCustomers ?? 0} active`}
              icon={Users}
              trend="+12%"
              color="#6366F1"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(data?.stats.totalRevenue ?? 0)}
              sub="from all orders"
              icon={TrendingUp}
              trend="+8.2%"
              color="#10B981"
            />
            <StatCard
              title="Active Campaigns"
              value={String(data?.stats.activeCampaigns ?? 0)}
              sub={`of ${data?.stats.totalCampaigns ?? 0} total`}
              icon={Megaphone}
              color="#F59E0B"
            />
            <StatCard
              title="Conversion Rate"
              value={`${data?.stats.conversionRate ?? 0}%`}
              sub="campaign average"
              icon={Target}
              trend="+2.1%"
              color="#8B5CF6"
            />
          </motion.div>
        )}

        {/* Charts row */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4"
        >
          {/* Weekly activity chart */}
          <motion.div variants={item} className="col-span-2 pulse-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold text-gray-900">Communication Activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">Messages sent this week</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Delivered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Opened
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
                  cursor={{ stroke: '#E5E7EB' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#6366F1" strokeWidth={2} fill="url(#sentGrad)" dot={false} />
                <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} fill="url(#deliveredGrad)" dot={false} />
                <Area type="monotone" dataKey="opened" stroke="#F59E0B" strokeWidth={2} fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Customer health */}
          <motion.div variants={item} className="pulse-card p-5">
            <div className="mb-4">
              <h2 className="font-display font-semibold text-gray-900">Customer Health</h2>
              <p className="text-xs text-gray-400 mt-0.5">Audience breakdown</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-medium text-gray-900 tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Recent campaigns */}
        <motion.div variants={item} initial="hidden" animate="show" className="pulse-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-gray-900">Recent Campaigns</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest campaign activity</p>
            </div>
            <Link href="/campaigns" className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
  View all <ArrowRight className="w-3 h-3" />
</Link>
          </div>
          <div className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              : data?.recentCampaigns.map((campaign: {
                  id: string
                  name: string
                  status: string
                  channel: string
                  audienceSize: number
                  communicationCount: number
                  launchedAt: string | null
                  createdAt: string
                }) => {
                  const statusCfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft
                  return (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: statusCfg.color }}
                      />
                      <span className="font-medium text-sm text-gray-900 flex-1 truncate group-hover:text-brand-600 transition-colors">
                        {campaign.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                        style={{ color: statusCfg.color, background: statusCfg.bg }}
                      >
                        {statusCfg.label}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                        style={{
                          background: `${CHANNEL_COLORS[campaign.channel]}15`,
                          color: CHANNEL_COLORS[campaign.channel],
                        }}
                      >
                        {campaign.channel}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 tabular-nums w-20 text-right">
                        {campaign.audienceSize.toLocaleString()} reached
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 w-28 text-right">
                        {campaign.launchedAt
                          ? formatRelativeTime(campaign.launchedAt)
                          : 'Not launched'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-400 transition-colors shrink-0" />
                    </Link>
                  )
                })}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4 pb-8"
        >
          {[
            {
              icon: Sparkles,
              title: 'Launch AI Campaign',
              desc: 'Describe your goal, AI does the rest',
              href: '/studio',
              color: '#6366F1',
              cta: 'Open Studio',
            },
            {
              icon: UserMinus,
              title: 'Win Back Churned',
              desc: `${data?.stats.churnedCustomers ?? 0} customers need attention`,
              href: '/studio',
              color: '#EF4444',
              cta: 'Create Campaign',
            },
            {
              icon: Activity,
              title: 'View Analytics',
              desc: 'Campaign performance & insights',
              href: '/analytics',
              color: '#10B981',
              cta: 'See Analytics',
            },
          ].map((action) => (
            <motion.div variants={item} key={action.title}>
              <Link
                href={action.href}
                className="pulse-card p-5 flex flex-col gap-3 group hover:shadow-dropdown transition-all duration-200"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${action.color}15` }}
                >
                  <action.icon className="w-5 h-5" style={{ color: action.color }} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{action.desc}</div>
                </div>
                <div
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: action.color }}
                >
                  {action.cta}
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
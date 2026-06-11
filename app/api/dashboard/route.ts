import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [
    totalCustomers,
    activeCustomers,
    atRiskCustomers,
    churnedCustomers,
    totalCampaigns,
    activeCampaigns,
    revenueResult,
    recentCampaigns,
    communicationStats,
    topCustomers,
    atRiskList,
    recentOrders,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: 'active' } }),
    prisma.customer.count({ where: { status: 'at_risk' } }),
    prisma.customer.count({ where: { status: 'churned' } }),
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: { in: ['active', 'queued'] } } }),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
    prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { communications: true } } },
    }),
    prisma.communication.groupBy({ by: ['status'], _count: true }),
    prisma.customer.findMany({
      orderBy: { totalSpend: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, city: true, totalSpend: true, orderCount: true, status: true, lastOrderAt: true },
    }),
    prisma.customer.findMany({
      where: { status: 'at_risk' },
      orderBy: { totalSpend: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, totalSpend: true, lastOrderAt: true, city: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { customer: { select: { name: true, city: true } } },
    }),
  ])

  const totalRevenue = revenueResult._sum.amount ?? 0
  const commMap = Object.fromEntries(communicationStats.map((s) => [s.status, s._count]))
  const totalSent = Object.values(commMap).reduce((a, b) => a + b, 0)
  const totalConverted = commMap['converted'] ?? 0
  const conversionRate = totalSent > 0 ? Math.round((totalConverted / totalSent) * 1000) / 10 : 0

  return NextResponse.json({
    stats: { totalCustomers, activeCustomers, atRiskCustomers, churnedCustomers, totalCampaigns, activeCampaigns, totalRevenue, conversionRate },
    recentCampaigns: recentCampaigns.map((c) => ({
      id: c.id, name: c.name, status: c.status, channel: c.channel,
      audienceSize: c.audienceSize, communicationCount: c._count.communications,
      launchedAt: c.launchedAt, createdAt: c.createdAt,
    })),
    communicationStats: commMap,
    topCustomers,
    atRiskList,
    recentOrders: recentOrders.map((o) => ({
      id: o.id, amount: o.amount, status: o.status,
      createdAt: o.createdAt, customerName: o.customer.name, city: o.customer.city,
    })),
  })
}
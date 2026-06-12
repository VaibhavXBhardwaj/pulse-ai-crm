import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalCustomers,
      revenueAgg,
      totalOrders,
      customersByStatus,
      ordersRaw,
      topCities,
      campaignStatsRaw,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.aggregate({ _sum: { totalSpend: true } }),
      prisma.order.count(),
      prisma.customer.groupBy({
        by: ["status"],
        _count: { status: true },
        orderBy: { _count: { status: "desc" } },
      }),
      // Orders grouped by month (last 6 months)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(created_at, 'Mon YY') AS month,
          DATE_TRUNC('month', created_at) AS month_dt,
          COUNT(*)::int AS orders,
          SUM(amount) AS revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month, month_dt
        ORDER BY month_dt ASC
      `,
      prisma.customer.groupBy({
        by: ["city"],
        _count: { city: true },
        where: { city: { not: null } },
        orderBy: { _count: { city: "desc" } },
        take: 10,
      }),
      // Campaign delivery stats
      prisma.communicationEvent.groupBy({
        by: ["eventType"],
        _count: { eventType: true },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.totalSpend ?? 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalCustomers : 0;

    const revenueByMonth = (ordersRaw as { month: string; orders: number; revenue: number }[]).map((r) => ({
      month: r.month,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }));

    const csMap = Object.fromEntries(
      customersByStatus.map((s) => [s.status, s._count.status])
    );

    const evMap = Object.fromEntries(
      campaignStatsRaw.map((e: { eventType: string; _count: { eventType: number } }) => [e.eventType, e._count.eventType])
    );

    const totalCampaigns = await prisma.campaign.count();

    return NextResponse.json({
      totalCustomers,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      customersByStatus: Object.entries(csMap).map(([status, count]) => ({ status, count })),
      revenueByMonth,
      topCities: topCities.map((c) => ({ city: c.city!, count: c._count.city })),
      campaignStats: {
        total: totalCampaigns,
        sent: evMap.sent ?? 0,
        delivered: evMap.delivered ?? 0,
        opened: evMap.opened ?? 0,
        clicked: evMap.clicked ?? 0,
      },
    });
  } catch (err) {
    console.error("[/api/analytics]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
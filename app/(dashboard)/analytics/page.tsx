"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Users, ShoppingBag, Activity,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  customersByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  topCities: { city: string; count: number }[];
  campaignStats: { total: number; sent: number; delivered: number; opened: number; clicked: number };
}

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  at_risk: "#f59e0b",
  churned: "#ef4444",
  new: "#6366f1",
};

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <div className="font-semibold text-gray-700 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-medium text-gray-900">
            {p.name.toLowerCase().includes("revenue") ? `₹${Number(p.value).toLocaleString("en-IN")}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/40 p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { totalCustomers, totalRevenue, totalOrders, avgOrderValue,
    customersByStatus, revenueByMonth, topCities, campaignStats } = data;

  const fmtCurrency = (v: number) => `₹${(v / 1000).toFixed(0)}K`;
  const deliverRate = campaignStats.sent > 0 ? Math.round((campaignStats.delivered / campaignStats.sent) * 100) : 0;
  const openRate = campaignStats.delivered > 0 ? Math.round((campaignStats.opened / campaignStats.delivered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Business performance overview</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total customers", value: totalCustomers.toLocaleString(), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Total revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Total orders", value: totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Avg order value", value: `₹${Math.round(avgOrderValue).toLocaleString()}`, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", bg)}>
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue over time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueByMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two columns: customer health + orders by month */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Customer health donut */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Customer health</h3>
            <div className="flex items-center gap-4">
              <PieChart width={140} height={140}>
                <Pie
                  data={customersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx={65} cy={65}
                  innerRadius={44}
                  outerRadius={65}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {customersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                  ))}
                </Pie>
              </PieChart>
              <div className="space-y-2 flex-1">
                {customersByStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? "#94a3b8" }} />
                      <span className="text-gray-600 capitalize">{s.status.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{s.count.toLocaleString()}</span>
                      <span className="text-gray-400">({Math.round((s.count / totalCustomers) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders per month bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders per month</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={revenueByMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Bar dataKey="orders" name="Orders" fill="#818cf8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign performance + top cities */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Campaign stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Campaign performance</h3>
            <div className="space-y-3">
              {[
                { label: "Total campaigns", value: campaignStats.total, bar: false },
                { label: "Messages sent", value: campaignStats.sent, bar: false },
                { label: "Delivery rate", value: `${deliverRate}%`, bar: true, pct: deliverRate, color: "bg-green-400" },
                { label: "Open rate", value: `${openRate}%`, bar: true, pct: openRate, color: "bg-amber-400" },
                { label: "Click rate", value: campaignStats.sent > 0 ? `${Math.round((campaignStats.clicked / campaignStats.sent) * 100)}%` : "—", bar: true, pct: campaignStats.sent > 0 ? Math.round((campaignStats.clicked / campaignStats.sent) * 100) : 0, color: "bg-violet-400" },
              ].map(({ label, value, bar, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                  {bar && (
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${pct ?? 0}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top cities */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Customers by city</h3>
            <div className="space-y-2.5">
              {topCities.slice(0, 8).map((c, i) => (
                <div key={c.city} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{c.city}</span>
                      <span className="text-gray-500">{c.count}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div
                        className="h-1 rounded-full bg-violet-400"
                        style={{ width: `${Math.round((c.count / topCities[0].count) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
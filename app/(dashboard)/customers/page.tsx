"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Users, TrendingUp, AlertTriangle, UserX,
  MapPin, Mail, Phone, ShoppingBag, Calendar, ChevronRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalSpend: number;
  orderCount: number;
  lastOrderAt?: string;
  tags: string[];
  status: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-green-50 text-green-700 border-green-200" },
  at_risk: { label: "At risk", color: "bg-amber-50 text-amber-700 border-amber-200" },
  churned: { label: "Churned", color: "bg-red-50 text-red-700 border-red-200" },
  new: { label: "New", color: "bg-blue-50 text-blue-700 border-blue-200" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(date?: string) {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ── Customer profile side panel ────────────────────────────────────────────────

function CustomerPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const cfg = STATUS_CONFIG[customer.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
  const avgOrder = customer.orderCount > 0 ? Math.round(customer.totalSpend / customer.orderCount) : 0;
  const isVIP = customer.totalSpend > 100000;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-white border-l border-gray-100 shadow-xl z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Customer profile</span>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Identity */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-base shrink-0">
            {getInitials(customer.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{customer.name}</span>
              {isVIP && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">VIP</span>
              )}
            </div>
            <Badge className={cn("text-xs border mt-1", cfg.color)}>{cfg.label}</Badge>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Contact</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.city && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{customer.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total spend", value: formatCurrency(customer.totalSpend), icon: TrendingUp },
            { label: "Orders", value: customer.orderCount.toString(), icon: ShoppingBag },
            { label: "Avg order", value: formatCurrency(avgOrder), icon: TrendingUp },
            { label: "Last order", value: timeAgo(customer.lastOrderAt), icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-0.5">{label}</div>
              <div className="text-sm font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {customer.tags.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {customer.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Member since */}
        <div className="text-xs text-gray-400">
          Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Footer action */}
      <div className="p-4 border-t border-gray-100">
        <Button
          className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm gap-2"
          onClick={() => window.location.href = `/studio?brief=customers+similar+to+${encodeURIComponent(customer.name)}`}
        >
          <span>Create campaign for segment</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    setCustomers(data.customers ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 200);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  // Summary counts from full dataset (just use what we have client-side)
  const counts = {
    all: total,
    active: customers.filter((c) => c.status === "active").length,
    at_risk: customers.filter((c) => c.status === "at_risk").length,
    churned: customers.filter((c) => c.status === "churned").length,
  };

  const FILTER_TABS = [
    { key: "all", label: "All", icon: Users },
    { key: "active", label: "Active", icon: TrendingUp },
    { key: "at_risk", label: "At risk", icon: AlertTriangle },
    { key: "churned", label: "Churned", icon: UserX },
  ];

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total customers</p>
            </div>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm gap-2"
              onClick={() => window.location.href = "/studio"}
            >
              <Filter className="w-4 h-4" />
              Create segment
            </Button>
          </div>

          {/* Search + filter tabs */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-gray-200 text-sm"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {FILTER_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    status === key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {label}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    status === key ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"
                  )}>
                    {counts[key as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              {["Customer", "Status", "Total spend", "Orders", "Last order", ""].map((h) => (
                <div key={h} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            {customers.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                No customers found
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {customers.map((c) => {
                  const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
                  const isVIP = c.totalSpend > 100000;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelected(c.id === selected?.id ? null : c)}
                      className={cn(
                        "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-5 py-3.5 items-center cursor-pointer transition-colors hover:bg-gray-50/70",
                        selected?.id === c.id && "bg-violet-50/50"
                      )}
                    >
                      {/* Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-semibold shrink-0">
                          {getInitials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                            {isVIP && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold shrink-0">VIP</span>}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{c.city ?? c.email}</div>
                        </div>
                      </div>
                      {/* Status */}
                      <div>
                        <Badge className={cn("text-xs border", cfg.color)}>{cfg.label}</Badge>
                      </div>
                      {/* Spend */}
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(c.totalSpend)}</div>
                      {/* Orders */}
                      <div className="text-sm text-gray-600">{c.orderCount}</div>
                      {/* Last order */}
                      <div className="text-sm text-gray-500">{timeAgo(c.lastOrderAt)}</div>
                      {/* Arrow */}
                      <div className="flex justify-end">
                        <ChevronRight className={cn("w-4 h-4 text-gray-300 transition-colors", selected?.id === c.id && "text-violet-500")} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {selected && (
          <CustomerPanel customer={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
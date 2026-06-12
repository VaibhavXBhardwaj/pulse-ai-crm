'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import BackgroundPath from '@/components/BackgroundPath'
import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Users, Megaphone, BarChart3,
  Sparkles, Check, ChevronRight, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Campaign Studio',
    description: 'Describe your goal in plain language. PulseAI builds the audience, writes the message, picks the channel, and launches — in under two minutes.',
  },
  {
    icon: Users,
    title: 'Intelligent Segmentation',
    description: 'Stop building audiences manually. PulseAI analyses purchase behaviour, recency, and lifetime value to surface the right customers automatically.',
  },
  {
    icon: Megaphone,
    title: 'Multi-channel Delivery',
    description: 'Reach shoppers on WhatsApp, Email, SMS, and RCS. PulseAI recommends the best channel for each segment based on historical engagement.',
  },
  {
    icon: BarChart3,
    title: 'Performance Intelligence',
    description: 'Track delivered, opened, clicked, and converted in real time. Understand why campaigns succeed or fail with AI-generated insights.',
  },
]

const METRICS = [
  { value: '1,000+', label: 'Brands using PulseAI' },
  { value: '3.4x', label: 'Average ROI improvement' },
  { value: '2 min', label: 'Average campaign setup' },
  { value: '94%', label: 'Message delivery rate' },
]

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: 'Free forever',
    description: 'For brands just getting started with CRM.',
    features: ['Up to 500 customers', '3 campaigns/month', 'Email channel', 'Basic analytics'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹2,499',
    period: 'per month',
    description: 'For brands ready to scale their outreach.',
    features: ['Up to 10,000 customers', 'Unlimited campaigns', 'WhatsApp, SMS, Email, RCS', 'AI Campaign Studio', 'Advanced analytics', 'Priority support'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large brands with complex needs.',
    features: ['Unlimited customers', 'Dedicated infrastructure', 'Custom integrations', 'SLA guarantee', 'Dedicated account manager'],
    cta: 'Talk to sales',
    highlighted: false,
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
  <div className="min-h-screen bg-[#FAFBFF] text-slate-900 overflow-hidden relative">
     <BackgroundPath />
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-0 left-1/3 h-[700px] w-[700px] rounded-full bg-violet-200/40 blur-[150px]" />
  <div className="absolute top-40 right-0 h-[600px] w-[600px] rounded-full bg-cyan-200/40 blur-[150px]" />
  <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-indigo-200/30 blur-[180px]" />
</div>
      {/* Navbar */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-[15px] text-gray-900 tracking-tight">PulseAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-lg transition-colors flex items-center gap-1.5"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/sign-in" className="px-3 py-2.5 text-sm font-medium text-gray-700 text-center border border-gray-200 rounded-lg">
                Log in
              </Link>
              <Link href="/sign-up" className="px-3 py-2.5 text-sm font-semibold text-white bg-[#6366F1] text-center rounded-lg">
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-44 pb-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6366F1]/20 bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              AI-Native CRM for Indian Retail
            </div>
            <h1 className="font-display font-black text-7xl lg:text-[88px] text-slate-950 tracking-[-0.06em] leading-[0.95] mb-8">
              Reach every shopper
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">at the right moment.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-9 max-w-2xl mb-10">
              PulseAI turns your customer data into targeted campaigns. Describe your goal in plain language — the AI builds the audience, crafts the message, and measures what works.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-lg transition-colors"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg transition-colors"
              >
                View demo
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              No credit card required. Free plan available.
            </p>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="mt-16 relative"
          >
            <div className="rounded-[36px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_40px_100px_rgba(15,23,42,0.12)] overflow-hidden">
              {/* Browser chrome */}
              <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-48 h-5 bg-gray-100 rounded-md mx-auto flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">app.pulseai.in/dashboard</span>
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="bg-[#F9FAFB] p-6">
                {/* Mock top nav */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-5 w-48 bg-gray-200 rounded-md mb-1.5" />
                    <div className="h-3 w-32 bg-gray-100 rounded-md" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-28 bg-white border border-gray-200 rounded-lg" />
                    <div className="h-8 w-28 bg-[#6366F1] rounded-lg" />
                  </div>
                </div>
                {/* Mock stat cards */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {['Total Customers', 'Revenue', 'Campaigns', 'Conversion'].map((label, i) => (
                    <div key={label} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="text-[10px] text-gray-400 mb-2">{label}</div>
                      <div className="h-6 w-20 bg-gray-100 rounded mb-1" />
                      <div className="h-2.5 w-16 bg-gray-50 rounded" />
                    </div>
                  ))}
                </div>
                {/* Mock chart */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 h-32">
                    <div className="h-3 w-32 bg-gray-100 rounded mb-4" />
                    <div className="flex items-end gap-1 h-16">
                      {[40,65,45,80,60,90,70,85,55,75,95,65].map((h,i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: i === 10 ? '#6366F1' : '#E0E7FF',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100 h-32">
                    <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                    <div className="flex items-center justify-center h-16">
                      <div className="w-16 h-16 rounded-full border-8 border-[#6366F1] border-t-[#E0E7FF] border-r-[#E0E7FF]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -inset-20 bg-gradient-to-r from-violet-300/30 via-indigo-300/20 to-cyan-300/30 rounded-full blur-[120px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="py-24 border-y border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {METRICS.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="font-display font-bold text-5xl text-gray-900 tracking-tight mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-300">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-3">
              Platform
            </div>
            <h2 className="font-display font-bold text-4xl text-gray-900 tracking-tight mb-4">
              Everything you need to reach your shoppers.
            </h2>
            <p className="text-gray-500 text-lg">
              PulseAI is built for the entire campaign lifecycle — from segmentation to delivery to analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
                className="group p-8 rounded-[28px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:border-violet-200 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(99,102,241,0.12)] transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#EEF2FF] group-hover:border-[#6366F1]/20 transition-colors">
                  <feature.icon className="w-4.5 h-4.5 text-gray-500 group-hover:text-[#6366F1] transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-3">
              Workflow
            </div>
            <h2 className="font-display font-bold text-4xl text-gray-900 tracking-tight mb-4">
              From intent to impact in minutes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe your goal',
                desc: 'Type what you want to achieve. "Re-engage customers who haven\'t ordered in 60 days." That\'s all PulseAI needs.',
              },
              {
                step: '02',
                title: 'AI builds the campaign',
                desc: 'PulseAI identifies the audience, generates personalised messages, recommends the best channel, and estimates reach.',
              },
              {
                step: '03',
                title: 'Launch and measure',
                desc: 'Send the campaign with one click. Track delivery, opens, clicks, and conversions in real time.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
                className="relative"
              >
                <div className="text-xs font-mono font-bold text-[#6366F1]/40 mb-3">{step.step}</div>
                <h3 className="font-display font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-6 w-5 h-5 text-gray-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-3">
              Pricing
            </div>
            <h2 className="font-display font-bold text-4xl text-gray-900 tracking-tight mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-gray-500">Start free. Scale when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'rounded-2xl p-6 border',
                  plan.highlighted
                    ? 'border-[#6366F1] bg-white ring-1 ring-[#6366F1] shadow-modal'
                    : 'border-gray-100 bg-white'
                )}
              >
                {plan.highlighted && (
                  <div className="inline-block px-2.5 py-1 text-[11px] font-semibold text-white bg-[#6366F1] rounded-full mb-3">
                    Most popular
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-500 mb-1">{plan.name}</div>
                  <div className="font-display font-bold text-3xl text-gray-900 tracking-tight">
                    {plan.price}
                    {plan.price !== 'Custom' && (
                      <span className="text-sm font-normal text-gray-400 ml-1">/ {plan.period}</span>
                    )}
                  </div>
                  {plan.price === 'Custom' && (
                    <div className="text-sm text-gray-400">{plan.period}</div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                <Link
                  href="/sign-up"
                  className={cn(
                    'block w-full py-2 text-sm font-semibold text-center rounded-lg transition-colors mb-5',
                    plan.highlighted
                      ? 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                  )}
                >
                  {plan.cta}
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center rounded-[40px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-12 py-24 text-white shadow-[0_40px_120px_rgba(15,23,42,0.3)]">
          <h2 className="font-display font-bold text-4xl text-white tracking-tight mb-4">
            Start reaching your customers smarter.
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of Indian retail brands using PulseAI to run intelligent campaigns.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] rounded-lg transition-colors"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-400 mt-3">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6366F1] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-sm text-gray-900">PulseAI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
          </div>
          <div className="text-sm text-gray-400">
            2026 PulseAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
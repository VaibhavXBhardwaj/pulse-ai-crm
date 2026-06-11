import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith',
  'Ananya', 'Diya', 'Pihu', 'Saanvi', 'Myra', 'Anika', 'Aadhya', 'Isha',
  'Priya', 'Kavya', 'Nisha', 'Pooja', 'Sneha', 'Divya', 'Meera', 'Riya',
  'Rahul', 'Rohit', 'Amit', 'Vikram', 'Raj', 'Suresh', 'Ramesh', 'Kiran',
  'Deepak', 'Manoj', 'Sanjay', 'Ajay', 'Vijay', 'Ravi', 'Nitin', 'Sachin',
]

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Mehta',
  'Joshi', 'Nair', 'Reddy', 'Rao', 'Pillai', 'Menon', 'Iyer', 'Agarwal',
  'Bansal', 'Garg', 'Mittal', 'Malhotra', 'Kapoor', 'Chopra', 'Khanna',
  'Bose', 'Das', 'Chatterjee', 'Mukherjee', 'Ghosh', 'Sen', 'Roy',
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Surat',
  'Kochi', 'Indore', 'Bhopal', 'Nagpur', 'Visakhapatnam', 'Vadodara',
]

const PRODUCT_CATALOG = [
  { name: 'Cotton Kurta', price: 899 },
  { name: 'Silk Saree', price: 4999 },
  { name: 'Denim Jeans', price: 1299 },
  { name: 'Casual T-Shirt', price: 499 },
  { name: 'Formal Shirt', price: 1499 },
  { name: 'Ethnic Lehenga', price: 8999 },
  { name: 'Woolen Sweater', price: 1799 },
  { name: 'Sports Shoes', price: 2499 },
  { name: 'Leather Sandals', price: 1199 },
  { name: 'Handbag', price: 2299 },
  { name: 'Sunglasses', price: 799 },
  { name: 'Wristwatch', price: 3499 },
  { name: 'Perfume', price: 1599 },
  { name: 'Face Serum', price: 899 },
  { name: 'Moisturiser', price: 599 },
  { name: 'Lipstick Set', price: 699 },
  { name: 'Protein Bar Pack', price: 499 },
  { name: 'Green Tea Box', price: 349 },
  { name: 'Coffee Blend', price: 799 },
  { name: 'Yoga Mat', price: 1299 },
]

const TAGS = [
  'loyal', 'high-value', 'frequent-buyer', 'fashion', 'beauty',
  'wellness', 'electronics', 'seasonal', 'sale-shopper', 'premium',
  'new-arrival-fan', 'discount-seeker',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - randomInt(0, daysAgo))
  return d
}

function generateEmail(name: string, index: number): string {
  const providers = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const clean = name.toLowerCase().replace(/\s/g, '.')
  return `${clean}${index}@${randomFrom(providers)}`
}

function generatePhone(): string {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '88', '87']
  return `+91${randomFrom(prefixes)}${randomInt(10000000, 99999999)}`
}

function getCustomerStatus(lastOrderAt: Date | null, orderCount: number): string {
  if (!lastOrderAt) return 'churned'
  const days = Math.floor((Date.now() - lastOrderAt.getTime()) / 86400000)
  if (orderCount <= 1 && days < 30) return 'new'
  if (days > 90) return 'churned'
  if (days > 45) return 'at_risk'
  return 'active'
}

async function main() {
  console.log('🌱 Starting seed...')

  await prisma.communicationEvent.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.campaignAudience.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.aiSuggestion.deleteMany()
  console.log('🗑️  Cleared existing data')

  // Generate 1000 customers
  const customers = []
  for (let i = 0; i < 1000; i++) {
    const firstName = randomFrom(INDIAN_FIRST_NAMES)
    const lastName = randomFrom(INDIAN_LAST_NAMES)
    const name = `${firstName} ${lastName}`
    customers.push({
      name,
      email: generateEmail(name, i),
      phone: Math.random() > 0.15 ? generatePhone() : null,
      city: Math.random() > 0.1 ? randomFrom(CITIES) : null,
      tags: Array.from({ length: randomInt(0, 3) }, () => randomFrom(TAGS))
        .filter((v, i, a) => a.indexOf(v) === i),
      createdAt: randomDate(365),
    })
  }

  await prisma.customer.createMany({ data: customers })
  console.log('👥 Created 1000 customers')

  const allCustomers = await prisma.customer.findMany({
    select: { id: true, createdAt: true },
  })

  const shuffled = [...allCustomers].sort(() => Math.random() - 0.5)
  const highValueCustomers = shuffled.slice(0, 200)
  const regularCustomers = shuffled.slice(200)

  const orders: {
    customerId: string
    amount: number
    status: string
    items: { name: string; quantity: number; price: number }[]
    createdAt: Date
  }[] = []

  for (const customer of highValueCustomers) {
    const count = randomInt(3, 12)
    for (let j = 0; j < count; j++) {
      const items = Array.from({ length: randomInt(1, 4) }, () => {
        const p = randomFrom(PRODUCT_CATALOG)
        return { name: p.name, quantity: randomInt(1, 3), price: p.price }
      })
      orders.push({
        customerId: customer.id,
        amount: items.reduce((s, i) => s + i.price * i.quantity, 0),
        status: Math.random() > 0.05 ? 'completed' : 'returned',
        items,
        createdAt: randomDate(300),
      })
    }
  }

  for (const customer of regularCustomers) {
    const count = randomInt(0, 3)
    for (let j = 0; j < count; j++) {
      const items = Array.from({ length: randomInt(1, 3) }, () => {
        const p = randomFrom(PRODUCT_CATALOG)
        return { name: p.name, quantity: 1, price: p.price }
      })
      orders.push({
        customerId: customer.id,
        amount: items.reduce((s, i) => s + i.price * i.quantity, 0),
        status: Math.random() > 0.05 ? 'completed' : 'returned',
        items,
        createdAt: randomDate(300),
      })
    }
  }

  const BATCH = 500
  for (let i = 0; i < orders.length; i += BATCH) {
    await prisma.order.createMany({ data: orders.slice(i, i + BATCH) })
  }
  console.log(`📦 Created ${orders.length} orders`)

  // Update customer aggregates
  const allOrders = await prisma.order.findMany({
    select: { customerId: true, amount: true, createdAt: true, status: true },
  })

  const stats = new Map<string, { total: number; count: number; last: Date }>()
  for (const o of allOrders) {
    if (o.status === 'returned') continue
    const e = stats.get(o.customerId)
    if (!e) {
      stats.set(o.customerId, { total: o.amount, count: 1, last: o.createdAt })
    } else {
      e.total += o.amount
      e.count += 1
      if (o.createdAt > e.last) e.last = o.createdAt
    }
  }

  for (const [id, s] of stats) {
    await prisma.customer.update({
      where: { id },
      data: {
        totalSpend: Math.round(s.total),
        orderCount: s.count,
        lastOrderAt: s.last,
        status: getCustomerStatus(s.last, s.count),
      },
    })
  }

  await prisma.customer.updateMany({
    where: { orderCount: 0 },
    data: { status: 'churned' },
  })
  console.log('📊 Updated customer aggregates')

  // Seed campaigns
  const c1 = await prisma.campaign.create({
    data: {
      name: 'Win-Back High Value Customers',
      status: 'completed',
      channel: 'whatsapp',
      aiBrief: 'Re-engage customers who spent over ₹10,000 but have not ordered in 60 days',
      aiStrategy: {
        targetAudience: 'High-value customers inactive for 60+ days',
        reasoning: 'These customers have demonstrated high purchase intent. A win-back offer is likely to convert.',
        estimatedReach: 87,
        recommendedChannel: 'whatsapp',
        expectedConversionRate: 18,
        keyMessage: 'We miss you — here is 15% off your next order',
        urgency: 'high',
      },
      segmentRules: {
        conditions: [
          { field: 'totalSpend', operator: 'gte', value: 10000 },
          { field: 'daysSinceLastOrder', operator: 'gte', value: 60 },
        ],
        logic: 'AND',
      },
      audienceSize: 87,
      messageTemplate: "Hi {{name}}, we noticed you haven't shopped in a while. Here's 15% off your next order. Use code MISSYOU15. Valid 48 hours! 🛍️",
      launchedAt: new Date(Date.now() - 7 * 86400000),
    },
  })

  const c2 = await prisma.campaign.create({
    data: {
      name: 'New Arrivals — Fashion Enthusiasts',
      status: 'active',
      channel: 'email',
      aiBrief: 'Promote new summer collection to customers tagged as fashion buyers',
      aiStrategy: {
        targetAudience: 'Customers with fashion tag and at least 2 orders',
        reasoning: 'Fashion-tagged customers respond well to new arrival announcements.',
        estimatedReach: 134,
        recommendedChannel: 'email',
        expectedConversionRate: 12,
        keyMessage: 'Summer 2025 collection is here',
        urgency: 'medium',
      },
      segmentRules: {
        conditions: [
          { field: 'tags', operator: 'contains', value: 'fashion' },
          { field: 'orderCount', operator: 'gte', value: 2 },
        ],
        logic: 'AND',
      },
      audienceSize: 134,
      messageTemplate: 'Hi {{name}}, our Summer 2025 collection just dropped! Free shipping on orders above ₹999.',
      launchedAt: new Date(Date.now() - 2 * 86400000),
    },
  })

  await prisma.campaign.create({
    data: {
      name: 'First Purchase Nudge',
      status: 'draft',
      channel: 'sms',
      aiBrief: 'Convert customers who signed up but never ordered',
      segmentRules: {
        conditions: [{ field: 'orderCount', operator: 'eq', value: 0 }],
        logic: 'AND',
      },
      audienceSize: 0,
      messageTemplate: 'Hi {{name}}, welcome! Use code FIRST10 for 10% off your first order 🎉',
    },
  })
  console.log('📣 Created 3 sample campaigns')

  // Seed communications
  const winBackCustomers = await prisma.customer.findMany({
    where: { totalSpend: { gte: 5000 }, status: { in: ['churned', 'at_risk'] } },
    take: 87,
  })

  const commStatuses = ['delivered', 'delivered', 'opened', 'opened', 'clicked', 'converted', 'failed']

  await prisma.communication.createMany({
    data: winBackCustomers.map((c) => ({
      campaignId: c1.id,
      customerId: c.id,
      channel: 'whatsapp',
      message: `Hi ${c.name.split(' ')[0]}, here's 15% off. Code MISSYOU15. Valid 48hrs! 🛍️`,
      status: randomFrom(commStatuses),
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(Date.now() - 6 * 86400000),
    })),
  })

  const fashionCustomers = await prisma.customer.findMany({
    where: { tags: { has: 'fashion' }, orderCount: { gte: 2 } },
    take: 134,
  })

  const activeStatuses = ['sent', 'delivered', 'delivered', 'opened', 'clicked']

  await prisma.communication.createMany({
    data: fashionCustomers.map((c) => ({
      campaignId: c2.id,
      customerId: c.id,
      channel: 'email',
      message: `Hi ${c.name.split(' ')[0]}, our Summer 2025 collection just dropped!`,
      status: randomFrom(activeStatuses),
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(Date.now() - 86400000),
    })),
  })

  console.log('💬 Created sample communications')
  console.log('✅ Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
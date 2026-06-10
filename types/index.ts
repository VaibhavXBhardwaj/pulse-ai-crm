export type CustomerStatus = 'active' | 'at_risk' | 'churned' | 'new'

export type CampaignStatus =
  | 'draft'
  | 'queued'
  | 'active'
  | 'completed'
  | 'paused'
  | 'failed'

export type CommunicationStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'opened'
  | 'clicked'
  | 'converted'

export type Channel = 'email' | 'sms' | 'whatsapp' | 'rcs'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  totalSpend: number
  orderCount: number
  lastOrderAt: string | null
  tags: string[]
  status: CustomerStatus
  createdAt: string
}

export interface Order {
  id: string
  customerId: string
  amount: number
  status: string
  items: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  channel: Channel
  aiBrief: string | null
  aiStrategy: CampaignStrategy | null
  segmentRules: SegmentRule | null
  audienceSize: number
  messageTemplate: string
  launchedAt: string | null
  createdAt: string
  stats?: CampaignStats
}

export interface CampaignStats {
  sent: number
  delivered: number
  failed: number
  opened: number
  clicked: number
  converted: number
}

export interface CampaignStrategy {
  targetAudience: string
  reasoning: string
  estimatedReach: number
  recommendedChannel: Channel
  expectedConversionRate: number
  keyMessage: string
  urgency: 'low' | 'medium' | 'high'
}

export interface SegmentRule {
  conditions: SegmentCondition[]
  logic: 'AND' | 'OR'
}

export interface SegmentCondition {
  field: string
  operator: string
  value: string | number
}

export interface MessageVariant {
  tone: 'safe' | 'persuasive' | 'premium'
  subject: string
  body: string
}

export interface Communication {
  id: string
  campaignId: string
  customerId: string
  channel: Channel
  message: string
  status: CommunicationStatus
  createdAt: string
  updatedAt: string
}

export interface AiInsight {
  type: 'success' | 'warning' | 'opportunity' | 'info'
  title: string
  description: string
  action?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    perPage: number
  }
}
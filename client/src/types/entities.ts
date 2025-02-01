export interface User {
  id: number
  username: string
  fullName: string
  profilePicture: string
  followersCount: number
  postsCount: number
  bio: string
  industry: string
}

export interface ActivityHours {
  id: number
  hours: { [hour: string]: number }
  peakActivityScore: number
  createdAt: Date
}

export interface FollowersHistory {
  date: string
  count: number
}

export interface GrowthPrediction {
  percentage: number
  timeframe: string
  confidenceScore: number
}

export interface Demographics {
  ageRanges: Array<{
    range: string
    percentage: number
  }>
  genderDistribution: Array<{
    gender: string
    percentage: number
  }>
  topLocations: Array<{
    location: string
    percentage: number
  }>
}

export interface AudienceQuality {
  engagementRate: number
  authenticity: number
  botPercentage: number
  activeFollowers: number
}

export interface Post {
  id: number
  externalId: string
  type: string
  caption: string | null
  mediaUrl: string
  likesCount: number
  commentsCount: number
  engagement: number
  postedAt: Date
  location?: Location
  createdAt: Date
}

export interface Location {
  id: number
  externalId: string
  name: string
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string | null
  country: string | null
  additionalInfo?: {
    website?: string
    phone?: string
    category?: string
    hours?: string[]
  }
}

export interface Benchmark {
  id: number
  competitorUsername: string
  followersCount: number
  engagementRate: number
  postFrequency: number
  topHashtags: string[]
  createdAt: Date
}

export interface KPIFinancier {
  revenue: {
    sponsoredPosts: number
    affiliateMarketing: number
    productSales: number
    coaching: number
  }
  currentPeriod: string
}

export interface MLInsights {
  visibility: {
    increase: number
    confidence: number
  }
  content: {
    tips: string[]
  }
  growth: {
    engagement: number
    confidence: number
  }
}

export interface Benchmarks {
  industryMetrics: Array<{
    name: string
    value: number
    trend: number
  }>
  competitors: Array<{
    username: string
    followers: number
    engagement: number
    avatar: string
  }>
  bestPractices: Array<{
    id: number
    text: string
  }>
}

export interface Hashtags {
  top: Array<{
    name: string
    engagement: number
    posts: number
  }>
  trending: Array<{
    name: string
    growth: number
    description: string
  }>
}

export interface DashboardData {
  user: User
  audienceQuality: AudienceQuality
  growthPrediction: GrowthPrediction
  followersHistory: FollowersHistory[]
  demographics: Demographics
  kpis: KPIFinancier
  mlInsights: MLInsights
  benchmarks: Benchmarks
  hashtags: Hashtags
} 
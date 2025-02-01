import type {
  User,
  ActivityHours,
  FollowersHistory,
  GrowthPrediction,
  Demographics,
  AudienceQuality,
  Post,
  Benchmark,
  KPIFinancier,
  DashboardData,
  MLInsights,
  Benchmarks,
  Hashtags
} from '../types/entities'

class MockService {
  async getCurrentUser(): Promise<User> {
    return {
      id: 1,
      username: 'demo_user',
      fullName: 'Demo User',
      profilePicture: 'https://picsum.photos/200',
      bio: 'Digital creator & Instagram growth expert 📈',
      industry: 'Digital Marketing',
      followersCount: 25800,
      postsCount: 342
    }
  }

  async getActivityHours(): Promise<ActivityHours> {
    const hours: { [key: string]: number } = {}
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0')
      hours[hour] = Math.random() * 100
    }
    return {
      id: 1,
      hours,
      peakActivityScore: 87.5,
      createdAt: new Date()
    }
  }

  async getFollowersHistory(): Promise<FollowersHistory[]> {
    const history: FollowersHistory[] = []
    const startDate = new Date('2024-01-01')
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      history.push({
        date: date.toISOString().split('T')[0],
        count: 25000 + Math.floor(Math.random() * 1000)
      })
    }
    return history
  }

  async getGrowthPrediction(): Promise<GrowthPrediction> {
    return {
      percentage: 12.5,
      confidenceScore: 85,
      timeframe: '1month'
    }
  }

  async getDemographics(): Promise<Demographics> {
    return {
      ageRanges: [
        { range: '18-24', percentage: 35 },
        { range: '25-34', percentage: 45 },
        { range: '35-44', percentage: 15 },
        { range: '45+', percentage: 5 }
      ],
      genderDistribution: [
        { gender: 'female', percentage: 65 },
        { gender: 'male', percentage: 35 }
      ],
      topLocations: [
        { location: 'Paris, France', percentage: 30 },
        { location: 'London, UK', percentage: 25 },
        { location: 'New York, USA', percentage: 20 },
        { location: 'Tokyo, Japan', percentage: 15 },
        { location: 'Other', percentage: 10 }
      ]
    }
  }

  async getAudienceQuality(): Promise<AudienceQuality> {
    return {
      engagementRate: 4.8,
      authenticity: 92.5,
      botPercentage: 3.2,
      activeFollowers: 23200
    }
  }

  async getRecentPosts(): Promise<Post[]> {
    return Array(6).fill(null).map((_, i) => ({
      id: i + 1,
      externalId: `post_${i + 1}`,
      type: 'image',
      caption: 'Sample post caption with #hashtags and @mentions',
      mediaUrl: `https://picsum.photos/400/400?random=${i}`,
      likesCount: 1200 + Math.floor(Math.random() * 800),
      commentsCount: 50 + Math.floor(Math.random() * 50),
      engagement: 4.5 + Math.random(),
      postedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      location: undefined,
      createdAt: new Date()
    }))
  }

  async getBenchmarks(): Promise<Benchmark[]> {
    return [
      {
        id: 1,
        competitorUsername: 'competitor1',
        followersCount: 28500,
        engagementRate: 5.2,
        postFrequency: 4.5,
        topHashtags: ['#marketing', '#digital', '#growth'],
        createdAt: new Date()
      },
      {
        id: 2,
        competitorUsername: 'competitor2',
        followersCount: 22000,
        engagementRate: 4.1,
        postFrequency: 3.8,
        topHashtags: ['#socialmedia', '#instagram', '#content'],
        createdAt: new Date()
      }
    ]
  }

  async getKPIFinanciers(): Promise<KPIFinancier> {
    return {
      revenue: {
        sponsoredPosts: 5800,
        affiliateMarketing: 2400,
        productSales: 3200,
        coaching: 1500
      },
      currentPeriod: 'Mars 2024'
    }
  }
}

export default new MockService()

export function getMockDashboardData(): DashboardData {
  console.log('Getting mock dashboard data')
  const data = {
    user: {
      id: 1,
      username: '@johndoe',
      fullName: 'John Doe',
      profilePicture: 'https://i.pravatar.cc/150?img=8',
      followersCount: 25600,
      postsCount: 342,
      bio: 'Digital Marketing Expert | Content Creator',
      industry: 'Marketing Digital'
    },
    audienceQuality: {
      engagementRate: 4.8,
      authenticity: 92,
      botPercentage: 3.2,
      activeFollowers: 23200
    },
    growthPrediction: {
      percentage: 15,
      timeframe: '30 jours',
      confidenceScore: 85
    },
    followersHistory: [
      { date: '2024-01-01', count: 20000 },
      { date: '2024-01-15', count: 22000 },
      { date: '2024-02-01', count: 23500 },
      { date: '2024-02-15', count: 24800 },
      { date: '2024-03-01', count: 25600 }
    ],
    demographics: {
      ageRanges: [
        { range: '18-24 ans', percentage: 35 },
        { range: '25-34 ans', percentage: 45 },
        { range: '35-44 ans', percentage: 15 },
        { range: '45+ ans', percentage: 5 }
      ],
      genderDistribution: [
        { gender: 'Femmes', percentage: 65 },
        { gender: 'Hommes', percentage: 35 }
      ],
      topLocations: [
        { location: 'Paris', percentage: 40 },
        { location: 'Lyon', percentage: 25 },
        { location: 'Marseille', percentage: 20 },
        { location: 'Bordeaux', percentage: 15 }
      ]
    },
    kpis: {
      revenue: {
        sponsoredPosts: 12500,
        affiliateMarketing: 8300,
        productSales: 15600,
        coaching: 9800
      },
      currentPeriod: 'Mars 2024'
    },
    mlInsights: {
      visibility: {
        increase: 35,
        confidence: 85
      },
      content: {
        tips: [
          'Utilisez plus de Reels pour augmenter l\'engagement',
          'Publiez entre 18h et 21h pour maximiser la portée'
        ]
      },
      growth: {
        engagement: 40,
        confidence: 90
      }
    },
    benchmarks: {
      industryMetrics: [
        { name: 'Taux d\'engagement', value: 4.2, trend: 0.6 },
        { name: 'Croissance mensuelle', value: 3.8, trend: -0.2 },
        { name: 'Qualité du contenu', value: 8.5, trend: 1.2 }
      ],
      competitors: [
        { username: '@competitor1', followers: 28.5, engagement: 5.2, avatar: 'https://i.pravatar.cc/150?img=1' },
        { username: '@competitor2', followers: 22, engagement: 4.1, avatar: 'https://i.pravatar.cc/150?img=2' }
      ],
      bestPractices: [
        { id: 1, text: '4-5 posts par semaine' },
        { id: 2, text: '15-20 stories par semaine' },
        { id: 3, text: '2-3 Reels par semaine' }
      ]
    },
    hashtags: {
      top: [
        { name: 'marketing', engagement: 5.2, posts: 12.5 },
        { name: 'digital', engagement: 4.8, posts: 8.3 },
        { name: 'business', engagement: 4.5, posts: 7.2 }
      ],
      trending: [
        { name: 'socialmediatips', growth: 25, description: 'En hausse cette semaine' },
        { name: 'contentcreator', growth: 18, description: 'Tendance émergente' }
      ]
    }
  }
  console.log('Mock data created:', data)
  return data
} 
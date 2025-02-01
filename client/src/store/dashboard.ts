import { defineStore } from 'pinia'
import { ref } from 'vue'

// Mock data
const MOCK_STATS = {
  followers: 1234,
  followersGrowth: 5.2,
  engagement: 3.8,
  posts: 42
}

const MOCK_POSTS = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/400/400',
    caption: 'Premier post #awesome',
    likes: 120,
    comments: 14
  },
  // ... autres posts mockés
]

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref(MOCK_STATS)
  const recentPosts = ref(MOCK_POSTS)

  async function fetchDashboardData() {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Les données sont déjà mockées, pas besoin de les charger
    return { stats: MOCK_STATS, recentPosts: MOCK_POSTS }
  }

  return {
    stats,
    recentPosts,
    fetchDashboardData
  }
}) 
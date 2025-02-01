import { defineStore } from 'pinia'
import { ref } from 'vue'

// Mock data
const MOCK_ADMIN_STATS = {
  totalUsers: 156,
  activeUsers: 89,
  revenue: 1250,
  growth: 12.5
}

const MOCK_USERS = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active' as const
  },
  // ... autres utilisateurs mockés
]

const MOCK_LOGS = [
  {
    id: 1,
    type: 'info' as const,
    message: 'Nouvel utilisateur inscrit',
    timestamp: new Date().toISOString()
  },
  // ... autres logs mockés
]

export const useAdminStore = defineStore('admin', () => {
  const stats = ref(MOCK_ADMIN_STATS)
  const users = ref(MOCK_USERS)
  const systemLogs = ref(MOCK_LOGS)

  async function fetchAdminData() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Utiliser les données mockées
    return {
      stats: MOCK_ADMIN_STATS,
      users: MOCK_USERS,
      logs: MOCK_LOGS
    }
  }

  async function deleteUser(userId: number) {
    await new Promise(resolve => setTimeout(resolve, 500))
    users.value = users.value.filter(user => user.id !== userId)
  }

  return {
    stats,
    users,
    systemLogs,
    fetchAdminData,
    deleteUser
  }
}) 
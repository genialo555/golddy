<template>
  <div v-if="loading" class="min-h-screen bg-[#0f172a] flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <div class="text-white text-lg">Chargement du dashboard...</div>
    </div>
  </div>
  
  <div v-else-if="data" class="h-[calc(100vh-64px)] bg-[#0f172a] mt-[64px] overflow-y-auto">
    <div class="max-w-[1920px] mx-auto p-2">
      <div class="grid grid-cols-12 gap-2">
        <!-- Colonne gauche -->
        <div class="col-span-3 space-y-2">
          <ProfileSection :user="data.user" />
          <AudienceStats :user="data.user" :audienceQuality="data.audienceQuality" />
          <AudienceQuality />
        </div>

        <!-- Colonne centrale -->
        <div class="col-span-6 space-y-2">
          <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h2 class="text-lg text-white font-semibold">Prédiction de croissance</h2>
                <p class="text-sm text-gray-400">{{ data.growthPrediction.timeframe }}</p>
              </div>
              <div class="text-2xl text-green-400 font-bold">
                +{{ data.growthPrediction.percentage }}%
              </div>
            </div>
            <div class="h-[300px]">
              <GrowthSection :prediction="data.growthPrediction" :history="data.followersHistory" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <EngagementChart />
            <RecentPosts />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-4">Répartition par âge</h3>
              <DemographicsSection :demographics="data.demographics" type="age" />
            </div>
            <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-4">Répartition par genre</h3>
              <DemographicsSection :demographics="data.demographics" type="gender" />
            </div>
            <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
              <h3 class="text-sm font-medium text-gray-400 mb-4">Top Localisations</h3>
              <DemographicsSection :demographics="data.demographics" type="locations" />
            </div>
          </div>
          <AIChat />
        </div>

        <!-- Colonne droite -->
        <div class="col-span-3 space-y-2">
          <FinancialSection :kpis="data.kpis" />
          <CollaborationSuggestions />
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-[#0f172a] flex items-center justify-center">
    <div class="text-white text-lg">Erreur de chargement des données</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DashboardData } from '../types/entities'
import { getMockDashboardData } from '../services/mock.service'

// Composants
import ProfileSection from '../components/dashboard/ProfileSection.vue'
import AudienceStats from '../components/dashboard/AudienceStats.vue'
import GrowthSection from '../components/dashboard/GrowthSection.vue'
import DemographicsSection from '../components/dashboard/DemographicsSection.vue'
import FinancialSection from '../components/dashboard/FinancialSection.vue'
import EngagementChart from '../components/dashboard/EngagementChart.vue'
import RecentPosts from '../components/dashboard/RecentPosts.vue'
import AIChat from '../components/dashboard/AIChat.vue'
import AudienceQuality from '../components/dashboard/AudienceQuality.vue'
import CollaborationSuggestions from '../components/dashboard/CollaborationSuggestions.vue'

const loading = ref(true)
const data = ref<DashboardData | null>(null)

onMounted(() => {
  debugger; // Point d'arrêt 1
  console.log('Dashboard mounted')
  try {
    loading.value = true
    console.log('Loading data...')
    const mockData = getMockDashboardData()
    debugger; // Point d'arrêt 2
    console.log('Mock data:', mockData)
    data.value = mockData
    console.log('Data assigned:', data.value)
  } catch (error) {
    console.error('Error loading data:', error)
    data.value = null
  } finally {
    setTimeout(() => {
      loading.value = false
      console.log('Loading complete, final data:', data.value)
    }, 1000)
  }
})
</script>

<style scoped>
.container {
  max-width: 1920px;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Masquer la scrollbar mais garder le défilement */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
</style> 
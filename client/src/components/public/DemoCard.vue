<template>
  <div class="relative w-[1075px] h-[864px]">
    <div class="bg-[#0f172a] rounded-2xl overflow-hidden h-full">
      <div class="transform scale-[0.7] origin-top-left">
        <div class="w-[1536px] grid grid-cols-12 gap-4">
          <!-- Colonne gauche -->
          <div class="col-span-3">
            <ProfileSection :user="data.user" />
            <AudienceStats :user="data.user" :audienceQuality="data.audienceQuality" />
            <AudienceQuality />
          </div>

          <!-- Colonne centrale -->
          <div class="col-span-6">
            <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4">
              <div class="flex justify-between items-center">
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
            <div class="grid grid-cols-2 gap-4 mt-4">
              <EngagementChart />
              <RecentPosts />
            </div>
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4">
                <h3 class="text-sm font-medium text-gray-400">Répartition par âge</h3>
                <DemographicsSection :demographics="data.demographics" type="age" />
              </div>
              <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4">
                <h3 class="text-sm font-medium text-gray-400">Répartition par genre</h3>
                <DemographicsSection :demographics="data.demographics" type="gender" />
              </div>
              <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4">
                <h3 class="text-sm font-medium text-gray-400">Top Localisations</h3>
                <DemographicsSection :demographics="data.demographics" type="locations" />
              </div>
            </div>
            <AIChat class="mt-4" />
          </div>

          <!-- Colonne droite -->
          <div class="col-span-3">
            <FinancialSection :kpis="data.kpis" />
            <CollaborationSuggestions />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DashboardData } from '../../types/entities'
import { getMockDashboardData } from '../../services/mock.service'

// Components
import ProfileSection from '../dashboard/ProfileSection.vue'
import AudienceStats from '../dashboard/AudienceStats.vue'
import GrowthSection from '../dashboard/GrowthSection.vue'
import DemographicsSection from '../dashboard/DemographicsSection.vue'
import FinancialSection from '../dashboard/FinancialSection.vue'
import EngagementChart from '../dashboard/EngagementChart.vue'
import RecentPosts from '../dashboard/RecentPosts.vue'
import AIChat from '../dashboard/AIChat.vue'
import AudienceQuality from '../dashboard/AudienceQuality.vue'
import CollaborationSuggestions from '../dashboard/CollaborationSuggestions.vue'

const data = ref<DashboardData>(getMockDashboardData())
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
</style> 
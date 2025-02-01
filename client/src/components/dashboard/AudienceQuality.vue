<template>
  <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
    <h2 class="text-lg text-white font-semibold mb-4">Qualité de l'audience</h2>
    <div class="space-y-6">
      <!-- Score global -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
          <div class="text-3xl font-bold text-white">{{ qualityScore }}%</div>
        </div>
        <p class="mt-2 text-sm text-gray-400">Score de qualité global</p>
      </div>

      <!-- Métriques détaillées -->
      <div class="grid gap-4">
        <div v-for="metric in metrics" :key="metric.name" class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">{{ metric.name }}</span>
            <span class="text-sm font-medium" :class="getScoreColor(metric.score)">
              {{ metric.score }}%
            </span>
          </div>
          <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
                 :class="getBarColor(metric.score)"
                 :style="{ width: `${metric.score}%` }">
            </div>
          </div>
        </div>
      </div>

      <!-- Recommandations -->
      <div class="p-4 bg-white/5 rounded-lg">
        <h3 class="text-sm font-medium text-gray-300 mb-2">Recommandations</h3>
        <ul class="space-y-2">
          <li v-for="(tip, index) in tips" :key="index" class="flex items-start gap-2">
            <span class="text-green-400 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="text-sm text-gray-400">{{ tip }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const qualityScore = ref(85)

const metrics = ref([
  { name: 'Engagement authentique', score: 92 },
  { name: 'Activité des followers', score: 78 },
  { name: 'Croissance organique', score: 88 },
  { name: 'Qualité des interactions', score: 82 }
])

const tips = ref([
  'Encouragez plus d\'interactions dans les commentaires',
  'Publiez plus régulièrement aux heures de pointe',
  'Engagez-vous avec des comptes similaires'
])

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

const getBarColor = (score: number) => {
  if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-400'
  if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
  return 'bg-gradient-to-r from-red-500 to-red-400'
}
</script> 
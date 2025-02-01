<template>
  <div class="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-gray-800">
    <!-- Période -->
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-400">Période:</label>
      <select v-model="selectedPeriod" 
              class="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none">
        <option value="7">7 jours</option>
        <option value="30">30 jours</option>
        <option value="90">90 jours</option>
      </select>
    </div>

    <!-- Type de contenu -->
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-400">Type:</label>
      <select v-model="selectedType"
              class="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-blue-500 focus:outline-none">
        <option value="all">Tout</option>
        <option value="photos">Photos</option>
        <option value="videos">Vidéos</option>
        <option value="reels">Reels</option>
      </select>
    </div>

    <!-- Refresh -->
    <button @click="refresh" 
            class="ml-auto flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Actualiser
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const selectedPeriod = ref('30')
const selectedType = ref('all')

const emit = defineEmits(['filter-change', 'refresh'])

watch([selectedPeriod, selectedType], ([period, type]) => {
  emit('filter-change', { period, type })
})

const refresh = () => {
  emit('refresh')
}
</script> 
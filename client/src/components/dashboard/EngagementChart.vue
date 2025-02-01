<template>
  <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
    <h2 class="text-lg text-white font-semibold mb-4">Engagement par type</h2>
    <div class="h-[300px] relative">
      <Pie
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div v-for="(item, index) in engagementTypes" :key="index" class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
        <span class="text-sm text-gray-400">{{ item.label }}: {{ item.percentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const engagementTypes = [
  { label: 'Likes', value: 65, color: '#3B82F6' },
  { label: 'Commentaires', value: 20, color: '#10B981' },
  { label: 'Partages', value: 10, color: '#8B5CF6' },
  { label: 'Sauvegardes', value: 5, color: '#F59E0B' }
]

const chartData = computed(() => ({
  labels: engagementTypes.map(type => type.label),
  datasets: [{
    data: engagementTypes.map(type => type.value),
    backgroundColor: engagementTypes.map(type => type.color),
    borderWidth: 0
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  }
}
</script> 
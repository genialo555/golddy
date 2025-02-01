<template>
  <div class="relative w-full h-full">
    <div v-if="error" class="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
      Erreur de chargement du graphique
    </div>
    <div v-else-if="!chartData || !props.history?.length" class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
      Chargement...
    </div>
    <Line
      v-else
      :data="chartData"
      :options="chartOptions"
      class="h-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { GrowthPrediction, FollowersHistory } from '../../types/entities'

const error = ref(false)

try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  )
} catch (e) {
  console.error('Error registering chart components:', e)
  error.value = true
}

const props = defineProps<{
  prediction: GrowthPrediction
  history: FollowersHistory[]
}>()

const chartData = computed(() => {
  if (!props.history?.length) return null
  
  try {
    return {
      labels: props.history.map(h => new Date(h.date).toLocaleDateString('fr-FR', { 
        day: 'numeric',
        month: 'short'
      })),
      datasets: [
        {
          label: 'Croissance attendue',
          data: props.history.map(h => h.count),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Moyenne du secteur',
          data: props.history.map(h => h.count * 0.8), // Simulé pour la démo
          borderColor: '#6b7280',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    }
  } catch (e) {
    console.error('Error creating chart data:', e)
    error.value = true
    return null
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 11
        },
        padding: 10,
        callback: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k'
          }
          return value
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 11
        },
        padding: 10
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#f8fafc',
      padding: 12,
      displayColors: false,
      callbacks: {
        title: (items: any) => {
          return items[0].label
        },
        label: (context: any) => {
          const label = context.dataset.label
          const value = context.raw.toLocaleString()
          return `${label}: ${value} abonnés`
        }
      }
    }
  }
}

onMounted(() => {
  console.log('GrowthSection mounted with data:', {
    prediction: props.prediction,
    history: props.history
  })
})
</script> 
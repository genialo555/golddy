<template>
  <div class="relative w-full h-full min-h-[300px] bg-white/5 p-4 rounded-lg">
    <!-- Test de rendu -->
    <div class="text-white mb-4">Test de rendu</div>
    
    <!-- Chart basique -->
    <Line
      :data="chartData"
      :options="chartOptions"
      ref="chartRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Enregistrement des composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const chartRef = ref(null)

// Données simplifiées
const chartData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [{
    label: 'Abonnés',
    data: [1800, 1900, 2100, 2300, 2200, 2400],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4,
    fill: true
  }]
}

// Options simplifiées
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: 'white'
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'white'
      }
    }
  }
}
</script> 
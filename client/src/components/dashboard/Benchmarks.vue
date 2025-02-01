<template>
  <div class="space-y-4">
    <!-- Métriques du secteur -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-400">Moyennes du secteur</h3>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="metric in benchmarks.industryMetrics" :key="metric.name" class="p-2 rounded bg-gray-800/50">
          <div class="text-xs text-gray-400">{{ metric.name }}</div>
          <div class="flex items-center gap-2">
            <div class="text-sm font-medium text-white">{{ metric.value }}%</div>
            <div :class="metric.trend > 0 ? 'text-green-400' : 'text-red-400'" class="text-xs">
              {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analyse concurrentielle -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-400">Analyse concurrentielle</h3>
      <div class="space-y-2">
        <div v-for="competitor in benchmarks.competitors" :key="competitor.username" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img :src="competitor.avatar" alt="" class="w-6 h-6 rounded-full">
            <span class="text-sm text-gray-300">{{ competitor.username }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-400">{{ competitor.engagement }}%</span>
            <div class="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                :style="{ width: `${competitor.engagement}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meilleures pratiques -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-400">Meilleures pratiques</h3>
      <ul class="space-y-1">
        <li v-for="practice in benchmarks.bestPractices" :key="practice.id" class="flex items-center space-x-2">
          <div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          <span class="text-sm text-gray-300">{{ practice.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Benchmarks } from '../../types/entities'

defineProps<{
  benchmarks: Benchmarks
}>()</script> 
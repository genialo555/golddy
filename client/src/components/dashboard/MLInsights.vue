<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-400">Optimisation de la visibilité</h3>
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center">
          <span class="text-white text-sm font-medium">+{{ insights.visibility.increase }}%</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-300">Confiance:</span>
          <span class="text-sm text-green-400">{{ insights.visibility.confidence }}%</span>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-400">Conseils de contenu</h3>
      <ul class="space-y-2">
        <li v-for="(tip, index) in insights.content.tips" :key="index" class="flex items-center space-x-2">
          <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          <p class="text-sm text-gray-300">{{ tip }}</p>
        </li>
      </ul>
    </div>

    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-400">Stratégie de croissance</h3>
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
          <span class="text-white text-sm font-medium">+{{ insights.growth.engagement }}%</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-300">Confiance:</span>
          <span class="text-sm text-purple-400">{{ insights.growth.confidence }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MLInsights } from '../../types/entities'

defineProps<{
  insights: MLInsights
}>()</script> 
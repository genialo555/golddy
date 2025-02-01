<template>
  <div class="space-y-2">
    <div class="grid grid-cols-2 gap-2">
      <!-- Engagement Rate -->
      <div class="p-2 rounded-lg bg-white/5">
        <div class="text-xl font-bold text-white">
          {{ audienceQuality.engagementRate.toFixed(1) }}%
        </div>
        <div class="text-[10px] text-gray-400">Engagement</div>
      </div>

      <!-- Authenticity Score -->
      <div class="p-2 rounded-lg bg-white/5">
        <div class="text-xl font-bold text-white">
          {{ audienceQuality.authenticity.toFixed(1) }}%
        </div>
        <div class="text-[10px] text-gray-400">Authenticité</div>
      </div>
    </div>

    <!-- Bot Percentage -->
    <div class="p-2 rounded-lg" :class="botPercentageBackground">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xl font-bold" :class="botPercentageColor">
            {{ audienceQuality.botPercentage.toFixed(1) }}%
          </div>
          <div class="text-[10px] text-gray-400">Bots</div>
        </div>
        <div class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center" :class="botPercentageColor">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Active Followers -->
    <div class="p-2 rounded-lg bg-white/5">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xl font-bold text-white">
            {{ formatNumber(audienceQuality.activeFollowers) }}
          </div>
          <div class="text-[10px] text-gray-400">Abonnés actifs</div>
        </div>
        <div class="w-6 h-6 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AudienceQuality } from '../../types/entities'

const props = defineProps<{
  audienceQuality: AudienceQuality
}>()

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const botPercentageColor = computed(() => {
  const percentage = props.audienceQuality.botPercentage
  if (percentage <= 5) return 'text-green-400'
  if (percentage <= 15) return 'text-yellow-400'
  return 'text-red-400'
})

const botPercentageBackground = computed(() => {
  const percentage = props.audienceQuality.botPercentage
  if (percentage <= 5) return 'bg-green-500/10'
  if (percentage <= 15) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
})
</script> 
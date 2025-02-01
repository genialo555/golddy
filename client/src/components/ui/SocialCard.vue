<template>
  <div 
    class="relative p-6 rounded-xl border border-gray-800/50 backdrop-blur-sm transition-all duration-300"
    :class="{
      'bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-orange-500/5': variant === 'instagram',
      'bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5': variant === 'tiktok',
      'bg-gradient-to-br from-blue-600/5 via-blue-500/5 to-blue-400/5': variant === 'facebook'
    }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :class="{
            'bg-gradient-to-br from-pink-500/10 to-orange-500/10': variant === 'instagram',
            'bg-gradient-to-br from-blue-500/10 to-cyan-500/10': variant === 'tiktok',
            'bg-gradient-to-br from-blue-600/10 to-blue-400/10': variant === 'facebook'
          }"
        >
          <component 
            :is="platformIcon" 
            class="w-5 h-5"
            :class="{
              'text-pink-500': variant === 'instagram',
              'text-blue-500': variant === 'tiktok',
              'text-blue-600': variant === 'facebook'
            }"
          />
        </div>
        <div>
          <h3 class="font-medium text-white">{{ platform }}</h3>
          <p class="text-sm text-gray-400">@{{ username }}</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div v-for="(stat, index) in stats" :key="index" class="text-center">
        <div class="flex items-center justify-center gap-1">
          <span class="text-xl font-semibold text-white">{{ formatValue(stat.value) }}</span>
          <span v-if="stat.trend" class="text-sm" :class="stat.trend > 0 ? 'text-green-400' : 'text-red-400'">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </span>
        </div>
        <p class="text-sm text-gray-400">{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InstagramIcon, TiktokIcon, FacebookIcon } from './icons'

interface Stat {
  label: string
  value: number
  trend?: number
}

interface Props {
  variant: 'instagram' | 'tiktok' | 'facebook'
  platform: string
  username: string
  stats: Stat[]
}

const props = defineProps<Props>()

const platformIcon = computed(() => {
  switch (props.variant) {
    case 'instagram':
      return InstagramIcon
    case 'tiktok':
      return TiktokIcon
    case 'facebook':
      return FacebookIcon
    default:
      return null
  }
})

const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}
</script> 
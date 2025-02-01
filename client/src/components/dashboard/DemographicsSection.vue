<template>
  <div class="space-y-3">
    <template v-if="type === 'age'">
      <div v-for="age in demographics.ageRanges" :key="age.range" class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="text-gray-400">{{ age.range }}</span>
          <span class="text-white">{{ age.percentage }}%</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
            :style="{ width: `${age.percentage}%` }"
          ></div>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'gender'">
      <div v-for="gender in demographics.genderDistribution" :key="gender.gender" class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="text-gray-400">{{ gender.gender }}</span>
          <span class="text-white">{{ gender.percentage }}%</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            :class="gender.gender === 'Femmes' ? 'bg-pink-500' : 'bg-blue-500'"
            class="h-full rounded-full"
            :style="{ width: `${gender.percentage}%` }"
          ></div>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'locations'">
      <div v-for="location in demographics.topLocations" :key="location.location" class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="text-gray-400">{{ location.location }}</span>
          <span class="text-white">{{ location.percentage }}%</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
            :style="{ width: `${location.percentage}%` }"
          ></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Demographics } from '../../types/entities'

defineProps<{
  demographics: Demographics
  type: 'age' | 'gender' | 'locations'
}>()
</script> 
<template>
  <div class="flex flex-col items-center">
    <img 
      :src="user.profilePicture" 
      :alt="user.username"
      class="w-16 h-16 rounded-full border-2 border-blue-500/30"
    >
    
    <h2 class="text-base font-semibold text-white mt-2">{{ user.fullName }}</h2>
    <p class="text-xs text-gray-400">@{{ user.username }}</p>
    
    <div class="w-full mt-3 space-y-1">
      <div class="flex justify-between items-center py-1 border-t border-gray-800">
        <span class="text-xs text-gray-400">Abonnés</span>
        <span class="text-xs font-medium text-white">{{ formatNumber(user.followersCount) }}</span>
      </div>
      <div class="flex justify-between items-center py-1 border-t border-gray-800">
        <span class="text-xs text-gray-400">Posts</span>
        <span class="text-xs font-medium text-white">{{ formatNumber(user.postsCount) }}</span>
      </div>
      <div class="flex justify-between items-center py-1 border-t border-gray-800">
        <span class="text-xs text-gray-400">Industrie</span>
        <span class="text-xs font-medium text-white">{{ user.industry }}</span>
      </div>
    </div>

    <div class="w-full mt-2">
      <p class="text-xs text-gray-400 leading-relaxed line-clamp-3">{{ user.bio }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '../../types/entities'

defineProps<{
  user: User
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
</script> 
<template>
  <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
    <h2 class="text-lg text-white font-semibold mb-4">Posts Récents</h2>
    <div class="space-y-4">
      <div v-for="post in recentPosts" :key="post.id" 
           class="flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <img :src="post.thumbnail" :alt="post.caption" class="w-16 h-16 object-cover rounded-lg">
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-300 truncate">{{ post.caption }}</p>
          <div class="mt-2 flex items-center gap-4">
            <div class="flex items-center gap-1">
              <span class="text-red-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </span>
              <span class="text-sm text-gray-400">{{ post.likes }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-blue-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
              <span class="text-sm text-gray-400">{{ post.comments }}</span>
            </div>
            <span class="text-xs text-gray-500">{{ post.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const recentPosts = ref([
  {
    id: 1,
    thumbnail: 'https://picsum.photos/200',
    caption: 'Comment optimiser votre stratégie marketing sur Instagram en 2024 #marketing #socialmedia',
    likes: 245,
    comments: 18,
    date: 'Il y a 2h'
  },
  {
    id: 2,
    thumbnail: 'https://picsum.photos/201',
    caption: 'Les tendances à suivre pour augmenter votre engagement #trends #engagement',
    likes: 189,
    comments: 12,
    date: 'Il y a 5h'
  },
  {
    id: 3,
    thumbnail: 'https://picsum.photos/202',
    caption: 'Découvrez nos derniers conseils pour développer votre communauté #community #growth',
    likes: 321,
    comments: 24,
    date: 'Il y a 8h'
  }
])
</script> 
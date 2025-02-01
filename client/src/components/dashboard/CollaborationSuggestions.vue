<template>
  <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
    <h2 class="text-lg text-white font-semibold mb-4">Suggestions de collaboration</h2>
    <div class="space-y-6">
      <!-- Influenceurs -->
      <div>
        <h3 class="text-sm font-medium text-gray-400 mb-3">Influenceurs similaires</h3>
        <div class="space-y-3">
          <div v-for="influencer in influencers" :key="influencer.id"
               class="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <img :src="influencer.avatar" :alt="influencer.name"
                 class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-white truncate">{{ influencer.name }}</h4>
              <p class="text-xs text-gray-400">{{ influencer.followers }} abonnés</p>
            </div>
            <div class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              {{ influencer.matchScore }}% match
            </div>
          </div>
        </div>
      </div>

      <!-- Marques -->
      <div>
        <h3 class="text-sm font-medium text-gray-400 mb-3">Marques intéressées</h3>
        <div class="space-y-3">
          <div v-for="brand in brands" :key="brand.id"
               class="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <img :src="brand.logo" :alt="brand.name"
                 class="w-10 h-10 rounded-lg object-contain bg-white/10 p-2">
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-white truncate">{{ brand.name }}</h4>
              <p class="text-xs text-gray-400">{{ brand.industry }}</p>
            </div>
            <div class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              {{ brand.budget }}
            </div>
          </div>
        </div>
      </div>

      <!-- Opportunités -->
      <div class="p-4 bg-white/5 rounded-lg">
        <h3 class="text-sm font-medium text-gray-300 mb-2">Opportunités à venir</h3>
        <ul class="space-y-2">
          <li v-for="(opportunity, index) in opportunities" :key="index"
              class="flex items-start gap-2">
            <span class="text-purple-400 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </span>
            <span class="text-sm text-gray-400">{{ opportunity }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const influencers = ref([
  {
    id: 1,
    name: '@lifestyle_paris',
    avatar: 'https://picsum.photos/100/100?random=1',
    followers: '45.2K',
    matchScore: 95
  },
  {
    id: 2,
    name: '@travel_photo',
    avatar: 'https://picsum.photos/100/100?random=2',
    followers: '38.7K',
    matchScore: 88
  },
  {
    id: 3,
    name: '@digital_creator',
    avatar: 'https://picsum.photos/100/100?random=3',
    followers: '52.1K',
    matchScore: 85
  }
])

const brands = ref([
  {
    id: 1,
    name: 'EcoStyle',
    logo: 'https://picsum.photos/100/100?random=4',
    industry: 'Mode durable',
    budget: '500€-1K€'
  },
  {
    id: 2,
    name: 'TechGear',
    logo: 'https://picsum.photos/100/100?random=5',
    industry: 'Technologie',
    budget: '1K€-2K€'
  },
  {
    id: 3,
    name: 'GreenLife',
    logo: 'https://picsum.photos/100/100?random=6',
    industry: 'Bien-être',
    budget: '750€-1.5K€'
  }
])

const opportunities = ref([
  'Campagne de Noël avec EcoStyle (Budget: 1.5K€)',
  'Collaboration photo avec TechGear en décembre',
  'Event influenceurs à Paris le mois prochain'
])
</script> 
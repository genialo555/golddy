<template>
  <div class="grid grid-cols-3 gap-6">
    <!-- Instagram Analytics -->
    <div class="bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-orange-500/5 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 flex items-center justify-center">
          <img src="@/assets/logos/instagram.svg" alt="Instagram" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Instagram Analytics</h3>
          <p class="text-sm text-gray-400">Analyses détaillées de vos performances</p>
        </div>
      </div>
    </div>

    <!-- TikTok Insights -->
    <div class="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
          <img src="@/assets/logos/tiktok.svg" alt="TikTok" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">TikTok Insights</h3>
          <p class="text-sm text-gray-400">Métriques avancées pour vos vidéos</p>
        </div>
      </div>
    </div>

    <!-- Meta Growth -->
    <div class="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Meta Growth</h3>
          <p class="text-sm text-gray-400">Croissance et engagement optimisés</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Le composant est purement présentationnel, pas besoin de logique supplémentaire
</script>

<style scoped>
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}
</style> 
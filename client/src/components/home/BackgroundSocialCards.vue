<template>
  <div class="fixed inset-0 h-[300vh] overflow-visible">
    <div class="sticky top-[15vh] w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4 opacity-0 hover:opacity-100 transition-opacity duration-700">
      <!-- Instagram Card -->
      <div class="group relative">
        <div class="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
        <div class="relative transform hover:scale-105 transition-transform duration-500">
          <SocialCard
            variant="instagram"
            platform="Instagram"
            username="johndoe"
            :stats="[
              { label: 'Abonnés', value: 125600, trend: 12 },
              { label: 'Posts', value: 342 },
              { label: 'Engagement', value: 4.8, trend: 0.5 }
            ]"
          />
        </div>
      </div>

      <!-- TikTok Card -->
      <div class="group relative">
        <div class="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
        <div class="relative transform hover:scale-105 transition-transform duration-500">
          <SocialCard
            variant="tiktok"
            platform="TikTok"
            username="johndoe"
            :stats="[
              { label: 'Abonnés', value: 256000, trend: 25 },
              { label: 'Vidéos', value: 128 },
              { label: 'Vues', value: 1250000, trend: 15 }
            ]"
          />
        </div>
      </div>

      <!-- Facebook Card -->
      <div class="group relative">
        <div class="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
        <div class="relative transform hover:scale-105 transition-transform duration-500">
          <SocialCard
            variant="facebook"
            platform="Facebook"
            username="johndoe"
            :stats="[
              { label: 'Abonnés', value: 85400, trend: 5 },
              { label: 'Posts', value: 256 },
              { label: 'Portée', value: 320000, trend: 8 }
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SocialCard from '../ui/SocialCard.vue'
</script>

<style scoped>
.bg-gradient-radial {
  background-image: radial-gradient(var(--tw-gradient-stops));
}
</style> 
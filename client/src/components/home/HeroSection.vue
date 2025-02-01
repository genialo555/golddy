<template>
  <section class="hero relative h-[1600px] overflow-hidden bg-[#0B0B1B] pt-[84px] px-safe">
    <!-- Effets atmosphériques -->
    <AtmosphericEffects />

    <!-- Faisceau lumineux principal -->
    <MainBeamEffect class="z-20" />

    <!-- Contenu Hero avec layout flex -->
    <div class="container relative mx-auto px-4 z-30">
      <div class="flex justify-between items-start">
        <!-- Titre et Description -->
        <div class="max-w-[500px]">
          <h1 class="text-[80px] leading-[88px] tracking-[-0.02em] font-bold text-white">
            Votre influence,<br/>notre intelligence
          </h1>
          <p class="mt-6 text-[20px] leading-[32px] text-[#8B8B8B]">
            Nos agents IA spécialisés analysent chaque aspect de votre présence Instagram pour révéler votre plein potentiel. Découvrez une nouvelle dimension de l'influence où data et créativité fusionnent.
          </p>
          <div class="mt-10 mb-6">
            <button class="group relative px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all duration-300 overflow-hidden">
              <span class="relative z-10">DÉMARRER GRATUITEMENT</span>
              <div class="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute -right-2 top-1/2 w-8 h-8 bg-gradient-to-r from-orange-500 to-transparent blur-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        <!-- Social Cards Container -->
        <div class="relative">
          <!-- Global Fog Layer -->
          <div class="absolute inset-0 w-[1200px] h-[1200px] pointer-events-none overflow-hidden">
            <!-- Remove duplicate beam effect -->
          </div>
          
          <!-- Cards Grid -->
          <div class="grid grid-cols-2 gap-20 max-w-[800px] relative -mt-8 -ml-16">
            <!-- Connexions entre les cartes -->
            <CardConnections />
            
            <!-- Colonne 1 -->
            <div class="space-y-10 translate-x-8">
              <SocialCard class="animate-glow-1">
                <template #icon>
                  <img src="@/assets/logos/instagram.svg" alt="Instagram" class="w-8 h-8 mb-4 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                </template>
                <template #title>Instagram Analytics</template>
                <template #description>Analyses détaillées de vos performances</template>
              </SocialCard>

              <SocialCard class="animate-glow-2">
                <template #icon>
                  <img src="@/assets/logos/tiktok.svg" alt="TikTok" class="w-8 h-8 mb-4 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                </template>
                <template #title>TikTok Insights</template>
                <template #description>Métriques avancées pour vos vidéos</template>
              </SocialCard>

              <SocialCard class="animate-glow-3">
                <template #icon>
                  <img src="@/assets/logos/meta.svg" alt="Meta" class="w-8 h-8 mb-4 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                </template>
                <template #title>Meta Growth</template>
                <template #description>Croissance et engagement optimisés</template>
              </SocialCard>
            </div>

            <!-- Colonne 2 -->
            <div class="space-y-10 translate-x-12">
              <SocialCard class="animate-glow-4">
                <template #icon>
                  <svg class="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </template>
                <template #title>Intelligence Artificielle</template>
                <template #description>Analyses prédictives avancées</template>
              </SocialCard>

              <SocialCard class="animate-glow-5">
                <template #icon>
                  <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </template>
                <template #title>Agent IA</template>
                <template #description>Assistant intelligent</template>
              </SocialCard>

              <SocialCard class="animate-glow-6">
                <template #icon>
                  <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </template>
                <template #title>Prédictions</template>
                <template #description>Tendances et analyses futures</template>
              </SocialCard>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Preview -->
      <div class="relative mt-4 z-50">
        <div class="relative w-fit mx-auto transform hover:scale-[1.01] transition-transform duration-500">
          <div class="relative bg-gray-900 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl 
            outline outline-[4px] outline-white/40
            before:absolute before:inset-[-2px] before:-z-10 before:rounded-2xl before:blur-md before:bg-white/30
            after:absolute after:inset-[-8px] after:-z-20 after:rounded-2xl after:blur-[30px] after:bg-violet-500/50
            [box-shadow:0_0_40px_5px_rgba(255,255,255,0.3),0_0_100px_20px_rgba(167,139,250,0.4)]">
            <!-- Couche de fond supplémentaire -->
            <div class="absolute inset-0 bg-gray-900/90 rounded-2xl"></div>
            <!-- Dashboard Content -->
            <div class="relative">
              <DemoCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DemoCard from '../public/DemoCard.vue'
import MainBeamEffect from './hero/MainBeamEffect.vue'
import AtmosphericEffects from './hero/AtmosphericEffects.vue'
import CardConnections from './hero/CardConnections.vue'
import SocialCard from './hero/SocialCard.vue'
</script>

<style scoped>
@keyframes linePulse {
  0%, 100% {
    opacity: 0.3;
    transform: scaleX(1);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(80);
  }
}

@keyframes haloPulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1) translateY(0);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.5) translateY(0);
  }
}

.animate-line-pulse {
  animation: linePulse 8s ease-in-out infinite;
  transform-origin: center;
}

.animate-halo-pulse {
  animation: haloPulse 8s ease-in-out infinite;
  transform-origin: center;
}

.animate-glow-1 {
  animation-delay: 0s;
}

.animate-glow-2 {
  animation-delay: 0.3s;
}

.animate-glow-3 {
  animation-delay: 0.6s;
}

.animate-glow-4 {
  animation-delay: 0.9s;
}

.animate-glow-5 {
  animation-delay: 1.2s;
}

.animate-glow-6 {
  animation-delay: 1.5s;
}
</style> 
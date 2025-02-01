<template>
  <section class="hero relative h-[700px] overflow-hidden bg-[#0B0B1B] pt-[84px] px-safe lg:h-[250vh] lg:pt-28 md:h-[200vh] md:pt-24 sm:pt-[92px]">
    <!-- Atmospheric Fog Layers -->
    <div class="absolute inset-0 z-10">
      <!-- Base Fog -->
      <div class="absolute inset-0 bg-gradient-radial from-blue-200/5 via-blue-100/3 to-transparent animate-pulse-slow"></div>
      <!-- Moving Fog Layer 1 -->
      <div class="absolute inset-0 animate-fog-flow-1">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-blue-50/10 to-transparent blur-[140px]"></div>
      </div>
      <!-- Moving Fog Layer 2 -->
      <div class="absolute inset-0 animate-fog-flow-2">
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-50/15 via-blue-100/8 to-transparent blur-[120px]"></div>
      </div>
      <!-- Moving Fog Layer 3 -->
      <div class="absolute inset-0 animate-fog-flow-3">
        <div class="absolute inset-0 bg-gradient-to-t from-blue-100/12 via-blue-50/8 to-transparent blur-[160px]"></div>
      </div>
      <!-- Atmospheric Light -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-blue-200/10 via-blue-100/5 to-transparent transform rotate-45 translate-x-1/4 -translate-y-1/4 animate-pulse-slower blur-[100px]"></div>
    </div>

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

        <!-- Social Cards Container with Fog -->
        <div class="relative">
          <!-- Global Fog Layer -->
          <div class="absolute inset-0 w-[1200px] h-[1200px] pointer-events-none overflow-hidden">
            <!-- Ligne lumineuse centrale -->
            <div class="absolute left-1/2 top-0 bottom-0 w-1 animate-line-pulse">
              <div class="absolute inset-0 bg-gradient-to-b from-white via-blue-200 to-transparent blur-[80px]"></div>
            </div>
            <!-- Halo lumineux qui pulse -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[600px] animate-halo-pulse">
              <div class="absolute inset-0 bg-gradient-radial from-white/30 via-blue-200/20 to-transparent blur-[100px]"></div>
            </div>
          </div>
          
          <!-- Cards Grid -->
          <div class="grid grid-cols-2 gap-20 max-w-[800px] relative -mt-8 -ml-16">
            <!-- Connexions entre les cartes -->
            <div class="absolute inset-0 pointer-events-none">
              <!-- Connexions courbes -->
              <svg class="absolute inset-0 w-full h-full">
                <!-- Courbe horizontale supérieure -->
                <path class="curved-path" d="M300,100 C350,100 400,140 450,100" 
                      fill="none" stroke="url(#gradient1)" stroke-width="2"></path>
                <!-- Courbe horizontale médiane -->      
                <path class="curved-path" d="M300,290 C350,290 400,250 450,290" 
                      fill="none" stroke="url(#gradient1)" stroke-width="2"></path>
                <!-- Courbe horizontale inférieure -->
                <path class="curved-path" d="M300,480 C350,480 400,520 450,480" 
                      fill="none" stroke="url(#gradient1)" stroke-width="2"></path>
                
                <!-- Courbes verticales gauche -->
                <path class="curved-path" d="M160,120 C160,170 120,200 160,250" 
                      fill="none" stroke="url(#gradient2)" stroke-width="2"></path>
                <path class="curved-path" d="M160,310 C160,360 120,390 160,440" 
                      fill="none" stroke="url(#gradient2)" stroke-width="2"></path>
                
                <!-- Courbes verticales droite -->
                <path class="curved-path" d="M590,120 C590,170 630,200 590,250" 
                      fill="none" stroke="url(#gradient2)" stroke-width="2"></path>
                <path class="curved-path" d="M590,310 C590,360 630,390 590,440" 
                      fill="none" stroke="url(#gradient2)" stroke-width="2"></path>

                <!-- Définition des gradients -->
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:rgb(139,92,246);stop-opacity:0" />
                    <stop offset="50%" style="stop-color:rgb(139,92,246);stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:rgb(139,92,246);stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgb(139,92,246);stop-opacity:0" />
                    <stop offset="50%" style="stop-color:rgb(139,92,246);stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:rgb(139,92,246);stop-opacity:0" />
                  </linearGradient>
                </defs>
              </svg>

              <!-- Points de connexion -->
              <div class="absolute top-[85px] left-[145px] w-[15px] h-[15px] rounded-full bg-violet-400/60 blur-[8px] animate-point-pulse"></div>
              <div class="absolute top-[275px] left-[145px] w-[15px] h-[15px] rounded-full bg-violet-400/60 blur-[8px] animate-point-pulse"></div>
              <div class="absolute top-[465px] left-[145px] w-[15px] h-[15px] rounded-full bg-violet-400/60 blur-[8px] animate-point-pulse"></div>
              
              <div class="absolute top-[85px] right-[145px] w-[15px] h-[15px] rounded-full bg-violet-400/60 blur-[8px] animate-point-pulse"></div>
              <div class="absolute top-[275px] right-[145px] w-[15px] h-[15px] rounded-full bg-violet-400/60 blur-[8px] animate-point-pulse"></div>
              <div class="absolute top-[465px] right-[145px] w-[15px] h-[15px] rounded-full bg-violet-400/60 blur-[8px] animate-point-pulse"></div>
            </div>
            
            <!-- Colonne 1 -->
            <div class="space-y-10 translate-x-8">
              <!-- Instagram Analytics -->
              <div class="social-card group relative animate-glow-1 opacity-0">
                <div class="card-wrapper">
                  <div class="card-background"></div>
                  <div class="effects-layer">
                    <div class="spotlight"></div>
                    <div class="fog-effect"></div>
                    <div class="glow-effect"></div>
                  </div>
                  <div class="card-content">
                    <img src="@/assets/logos/instagram.svg" alt="Instagram" class="w-8 h-8 mb-4 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Instagram Analytics</h3>
                    <p class="text-sm text-white transition-colors duration-500">Analyses détaillées de vos performances</p>
                  </div>
                </div>
              </div>

              <!-- TikTok Insights -->
              <div class="social-card group relative animate-glow-2 opacity-0">
                <div class="card-wrapper">
                  <div class="card-background"></div>
                  <div class="effects-layer">
                    <div class="spotlight"></div>
                    <div class="fog-effect"></div>
                    <div class="glow-effect"></div>
                  </div>
                  <div class="card-content">
                    <img src="@/assets/logos/tiktok.svg" alt="TikTok" class="w-8 h-8 mb-4 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">TikTok Insights</h3>
                    <p class="text-sm text-white transition-colors duration-500">Métriques avancées pour vos vidéos</p>
                  </div>
                </div>
              </div>

              <!-- Meta Growth -->
              <div class="social-card group relative animate-glow-3 opacity-0">
                <div class="card-wrapper">
                  <div class="card-background"></div>
                  <div class="effects-layer">
                    <div class="spotlight"></div>
                    <div class="fog-effect"></div>
                    <div class="glow-effect"></div>
                  </div>
                  <div class="card-content">
                    <img src="@/assets/logos/meta.svg" alt="Meta" class="w-8 h-8 mb-4 opacity-100 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Meta Growth</h3>
                    <p class="text-sm text-white transition-colors duration-500">Croissance et engagement optimisés</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colonne 2 -->
            <div class="space-y-10 translate-x-12">
              <!-- Intelligence Artificielle -->
              <div class="social-card group relative animate-glow-4 opacity-0">
                <div class="card-wrapper">
                  <div class="card-background"></div>
                  <div class="effects-layer">
                    <div class="spotlight"></div>
                    <div class="fog-effect"></div>
                    <div class="glow-effect"></div>
                  </div>
                  <div class="card-content">
                    <div class="w-8 h-8 mb-4">
                      <svg class="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Intelligence Artificielle</h3>
                    <p class="text-sm text-white transition-colors duration-500">Analyses prédictives avancées</p>
                  </div>
                </div>
              </div>

              <!-- Agent IA -->
              <div class="social-card group relative animate-glow-5 opacity-0">
                <div class="card-wrapper">
                  <div class="card-background"></div>
                  <div class="effects-layer">
                    <div class="spotlight"></div>
                    <div class="fog-effect"></div>
                    <div class="glow-effect"></div>
                  </div>
                  <div class="card-content">
                    <div class="w-8 h-8 mb-4">
                      <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Agent IA</h3>
                    <p class="text-sm text-white transition-colors duration-500">Assistant intelligent</p>
                  </div>
                </div>
              </div>

              <!-- Prédictions -->
              <div class="social-card group relative animate-glow-6 opacity-0">
                <div class="card-wrapper">
                  <div class="card-background"></div>
                  <div class="effects-layer">
                    <div class="spotlight"></div>
                    <div class="fog-effect"></div>
                    <div class="glow-effect"></div>
                  </div>
                  <div class="card-content">
                    <div class="w-8 h-8 mb-4">
                      <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">Prédictions</h3>
                    <p class="text-sm text-white transition-colors duration-500">Tendances et analyses futures</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Preview -->
      <div class="relative mt-4 mb-[100px] z-50">
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
import MainBeamEffect from './effects/MainBeamEffect.vue'
import BackgroundSocialCards from './BackgroundSocialCards.vue'
import { onMounted } from 'vue'

onMounted(() => {
  const cards = document.querySelectorAll('.social-card')
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      const spotlight = card.querySelector('.spotlight') as HTMLElement
      const glow = card.querySelector('.glow-effect') as HTMLElement
      
      if (spotlight) {
        spotlight.style.setProperty('--mouse-x', `${x}%`)
        spotlight.style.setProperty('--mouse-y', `${y}%`)
      }
      if (glow) {
        glow.style.setProperty('--mouse-x', `${x}%`)
        glow.style.setProperty('--mouse-y', `${y}%`)
      }
    })
  })
})
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulseSlow 4s ease-in-out infinite;
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.social-card {
  @apply w-[340px] h-[180px] transform-gpu transition-all duration-500 relative overflow-visible;
  perspective: 1000px;
  transform-style: preserve-3d;
  opacity: 1;
}

/* Suppression de l'effet de ligne */
/* .social-card::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  transform: translateY(-50%) rotate(35deg);
  z-index: 2;
  opacity: 0;
} */

.card-wrapper {
  @apply relative w-full h-full;
  transform-style: preserve-3d;
  transition: all 0.5s ease-out;
  clip-path: path('M0 90C0 40 20 20 60 20H280C320 20 340 40 340 90C340 140 320 160 280 160H60C20 160 0 140 0 90Z');
  opacity: 0.1;
  backdrop-filter: blur(8px);
}

.card-background {
  @apply absolute inset-0;
  background: linear-gradient(
    135deg,
    rgba(255, 250, 240, 0.08) 0%,
    rgba(255, 248, 220, 0.12) 50%,
    rgba(255, 236, 179, 0.08) 100%
  );
  transition: all 0.5s ease-out;
  clip-path: path('M0 90C0 40 20 20 60 20H280C320 20 340 40 340 90C340 140 320 160 280 160H60C20 160 0 140 0 90Z');
}

.effects-layer {
  @apply absolute inset-0 overflow-hidden;
  transform-style: preserve-3d;
  clip-path: path('M0 90C0 40 20 20 60 20H280C320 20 340 40 340 90C340 140 320 160 280 160H60C20 160 0 140 0 90Z');
}

.spotlight {
  @apply absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.03) 40%,
    transparent 60%
  );
  mix-blend-mode: screen;
  clip-path: path('M0 90C0 40 20 20 60 20H280C320 20 340 40 340 90C340 140 320 160 280 160H60C20 160 0 140 0 90Z');
}

.fog-effect {
  @apply absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500;
  background: linear-gradient(
    125deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    rgba(255, 255, 255, 0.05) 100%
  );
  mix-blend-mode: overlay;
  clip-path: path('M0 90C0 40 20 20 60 20H280C320 20 340 40 340 90C340 140 320 160 280 160H60C20 160 0 140 0 90Z');
}

.glow-effect {
  @apply absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(167, 139, 250, 0.1) 40%,
    transparent 60%
  );
  mix-blend-mode: screen;
  clip-path: path('M0 90C0 40 20 20 60 20H280C320 20 340 40 340 90C340 140 320 160 280 160H60C20 160 0 140 0 90Z');
}

.card-content {
  @apply relative z-10 px-12 py-8;
  transform: translateZ(1px);
  opacity: 1;
  transition: all 0.5s ease-out;
}

.card-content img {
  @apply opacity-100 transition-opacity duration-500;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) 
         drop-shadow(0 0 24px rgba(255, 255, 255, 0.6));
}

.card-content h3 {
  @apply text-lg font-semibold text-white transition-all duration-500 mb-2;
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 0.8),
    0 0 30px rgba(255, 255, 255, 0.6),
    0 0 45px rgba(255, 255, 255, 0.4);
  font-weight: 700;
}

.card-content p {
  @apply text-sm text-white transition-all duration-500;
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.7),
    0 0 24px rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.social-card:hover .card-wrapper {
  transform: translateZ(30px) scale(1.02);
  opacity: 1;
  box-shadow: 
    0 0 30px 5px rgba(255, 248, 220, 0.3),
    0 0 100px 20px rgba(167, 139, 250, 0.4);
}

.social-card:hover .card-background {
  background: linear-gradient(
    135deg,
    rgba(255, 250, 240, 0.15) 0%,
    rgba(255, 248, 220, 0.2) 50%,
    rgba(255, 236, 179, 0.15) 100%
  );
  box-shadow: 
    inset 0 0 30px rgba(255, 248, 220, 0.3),
    0 0 50px rgba(255, 248, 220, 0.2);
}

.social-card:hover {
  opacity: 1;
}

/* Animation */
@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Suppression de l'animation de ligne */
/* @keyframes beamSlide {
  0% {
    transform: translateX(-100%) translateY(-50%) rotate(35deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(200%) translateY(-50%) rotate(35deg);
    opacity: 0;
  }
} */

.animate-glow-1 {
  animation: cardAppear 1.5s ease-out forwards;
}

/* Suppression des animations de ligne */
/* .animate-glow-1::before {
  animation: beamSlide 1.5s ease-out forwards;
}

.animate-glow-2::before {
  animation: beamSlide 1.5s ease-out forwards;
  animation-delay: 0.3s;
}

.animate-glow-3::before {
  animation: beamSlide 1.5s ease-out forwards;
  animation-delay: 0.6s;
} */

.animate-glow-2 {
  animation: cardAppear 1.5s ease-out forwards;
  animation-delay: 0.3s;
}

.animate-glow-3 {
  animation: cardAppear 1.5s ease-out forwards;
  animation-delay: 0.6s;
}

.animate-glow-4 {
  animation: cardAppear 1.5s ease-out forwards;
  animation-delay: 0.9s;
}

.animate-glow-5 {
  animation: cardAppear 1.5s ease-out forwards;
  animation-delay: 1.2s;
}

.animate-glow-6 {
  animation: cardAppear 1.5s ease-out forwards;
  animation-delay: 1.5s;
}

.grid {
  gap: 1.25rem;
}

.social-card {
  margin: 0.25rem;
}

@keyframes fogFadeInOut1 {
  0% {
    opacity: 0;
    transform: translate(-50%, 0) scale(1);
  }
  25% {
    opacity: 0.3;
    transform: translate(-25%, -5%) scale(1.1) rotate(5deg);
  }
  50% {
    opacity: 0.4;
    transform: translate(0%, -8%) scale(1.15) rotate(-5deg);
  }
  75% {
    opacity: 0.3;
    transform: translate(25%, -5%) scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 0;
    transform: translate(50%, 0) scale(1);
  }
}

.animate-fog-fade-1 > div {
  animation: fogFadeInOut1 20s ease-in-out infinite;
}

@keyframes fogFadeInOut2 {
  0% {
    opacity: 0;
    transform: translate(50%, -20%) scale(1);
  }
  25% {
    opacity: 0.25;
    transform: translate(25%, -25%) scale(1.1) rotate(-5deg);
  }
  50% {
    opacity: 0.35;
    transform: translate(0%, -28%) scale(1.15) rotate(5deg);
  }
  75% {
    opacity: 0.25;
    transform: translate(-25%, -25%) scale(1.1) rotate(-5deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -20%) scale(1);
  }
}

.animate-fog-fade-2 > div {
  animation: fogFadeInOut2 25s ease-in-out infinite;
  animation-delay: 5s;
}

@keyframes fogFadeInOut3 {
  0% {
    opacity: 0;
    transform: translate(-30%, -40%) scale(1);
  }
  25% {
    opacity: 0.2;
    transform: translate(-15%, -45%) scale(1.1) rotate(-3deg);
  }
  50% {
    opacity: 0.3;
    transform: translate(0%, -48%) scale(1.15) rotate(3deg);
  }
  75% {
    opacity: 0.2;
    transform: translate(15%, -45%) scale(1.1) rotate(-3deg);
  }
  100% {
    opacity: 0;
    transform: translate(30%, -40%) scale(1);
  }
}

.animate-fog-fade-3 > div {
  animation: fogFadeInOut3 30s ease-in-out infinite;
  animation-delay: 10s;
}

@keyframes fogFlow1 {
  0% {
    opacity: 0.2;
    transform: translate(0, -5%) scale(1.1) rotate(0deg);
  }
  50% {
    opacity: 0.3;
    transform: translate(2%, -8%) scale(1.15) rotate(5deg);
  }
  100% {
    opacity: 0.2;
    transform: translate(0, -5%) scale(1.1) rotate(0deg);
  }
}

@keyframes fogFlow2 {
  0% {
    opacity: 0.15;
    transform: translate(0, -10%) scale(1.15) rotate(0deg);
  }
  50% {
    opacity: 0.25;
    transform: translate(-2%, -15%) scale(1.2) rotate(-5deg);
  }
  100% {
    opacity: 0.15;
    transform: translate(0, -10%) scale(1.15) rotate(0deg);
  }
}

@keyframes fogFlow3 {
  0% {
    opacity: 0.1;
    transform: translate(0, -15%) scale(1.2) rotate(0deg);
  }
  50% {
    opacity: 0.2;
    transform: translate(1%, -20%) scale(1.25) rotate(3deg);
  }
  100% {
    opacity: 0.1;
    transform: translate(0, -15%) scale(1.2) rotate(0deg);
  }
}

.animate-fog-flow-1 {
  animation: fogFlow1 20s ease-in-out infinite;
}

.animate-fog-flow-2 {
  animation: fogFlow2 25s ease-in-out infinite;
}

.animate-fog-flow-3 {
  animation: fogFlow3 30s ease-in-out infinite;
}

.animate-pulse-slower {
  animation: pulseSlow 12s ease-in-out infinite;
}

@keyframes fogSpot1 {
  0% {
    opacity: 0.2;
    transform: translate(0, -10%) scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.3;
    transform: translate(3%, -15%) scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 0.2;
    transform: translate(0, -10%) scale(1) rotate(0deg);
  }
}

@keyframes fogSpot2 {
  0% {
    opacity: 0.15;
    transform: translate(0, -15%) scale(1.1) rotate(0deg);
  }
  50% {
    opacity: 0.25;
    transform: translate(-2%, -20%) scale(1.15) rotate(-3deg);
  }
  100% {
    opacity: 0.15;
    transform: translate(0, -15%) scale(1.1) rotate(0deg);
  }
}

@keyframes fogRise {
  0% {
    opacity: 0.1;
    transform: translate(0, -20%) scale(1.15) rotate(0deg);
  }
  50% {
    opacity: 0.2;
    transform: translate(-1%, -25%) scale(1.2) rotate(2deg);
  }
  100% {
    opacity: 0.1;
    transform: translate(0, -20%) scale(1.15) rotate(0deg);
  }
}

.animate-fog-spot-1 {
  animation: fogSpot1 15s ease-in-out infinite;
}

.animate-fog-spot-2 {
  animation: fogSpot2 18s ease-in-out infinite;
}

.animate-fog-rise {
  animation: fogRise 22s ease-in-out infinite;
}

.social-card:hover .card-content h3 {
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 0.9),
    0 0 30px rgba(255, 255, 255, 0.7),
    0 0 45px rgba(255, 255, 255, 0.5),
    0 0 60px rgba(255, 255, 255, 0.3);
}

.social-card:hover .card-content p {
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.8),
    0 0 24px rgba(255, 255, 255, 0.6),
    0 0 36px rgba(255, 255, 255, 0.4);
}

.social-card:hover .card-content img {
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) 
         drop-shadow(0 0 24px rgba(255, 255, 255, 0.6));
}

@keyframes fogPulse1 {
  0%, 100% {
    opacity: 0;
    transform: scale(1) translateY(0);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.1) translateY(-5%);
  }
}

@keyframes fogPulse2 {
  0%, 100% {
    opacity: 0;
    transform: scale(1) translateY(-20%);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.15) translateY(-25%);
  }
}

@keyframes fogPulse3 {
  0%, 100% {
    opacity: 0;
    transform: scale(1) translateY(-40%);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.2) translateY(-45%);
  }
}

.animate-fog-pulse-1 {
  animation: fogPulse1 8s ease-in-out infinite;
}

.animate-fog-pulse-2 {
  animation: fogPulse2 12s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-fog-pulse-3 {
  animation: fogPulse3 10s ease-in-out infinite;
  animation-delay: 4s;
}

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

/* Suppression des anciennes animations de connexion qui ne sont plus nécessaires */
@keyframes connectionFlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse-slow {
  animation: pulseSlow 4s ease-in-out infinite;
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes connectionPulse {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.05);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.2);
  }
}

.animate-connection-pulse {
  animation: connectionPulse 4s ease-in-out infinite;
}

.animate-glow-pulse {
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes smokeHorizontal1 {
  0% {
    opacity: 0.05;
    transform: translateX(-10%) scale(0.8) skewX(5deg);
  }
  25% {
    opacity: 0.15;
    transform: translateX(5%) scale(1.1) skewX(-5deg);
  }
  50% {
    opacity: 0.2;
    transform: translateX(0%) scale(1.2) skewX(3deg);
  }
  75% {
    opacity: 0.15;
    transform: translateX(-5%) scale(1.1) skewX(-3deg);
  }
  100% {
    opacity: 0.05;
    transform: translateX(-10%) scale(0.8) skewX(5deg);
  }
}

@keyframes smokeHorizontal2 {
  0% {
    opacity: 0.05;
    transform: translateX(10%) scale(0.9) skewX(-5deg);
  }
  25% {
    opacity: 0.1;
    transform: translateX(-5%) scale(1.2) skewX(5deg);
  }
  50% {
    opacity: 0.15;
    transform: translateX(0%) scale(1.3) skewX(-3deg);
  }
  75% {
    opacity: 0.1;
    transform: translateX(5%) scale(1.2) skewX(3deg);
  }
  100% {
    opacity: 0.05;
    transform: translateX(10%) scale(0.9) skewX(-5deg);
  }
}

@keyframes smokeVertical1 {
  0% {
    opacity: 0.05;
    transform: translateY(-10%) scale(0.8) skewY(5deg);
  }
  25% {
    opacity: 0.15;
    transform: translateY(5%) scale(1.1) skewY(-5deg);
  }
  50% {
    opacity: 0.2;
    transform: translateY(0%) scale(1.2) skewY(3deg);
  }
  75% {
    opacity: 0.15;
    transform: translateY(-5%) scale(1.1) skewY(-3deg);
  }
  100% {
    opacity: 0.05;
    transform: translateY(-10%) scale(0.8) skewY(5deg);
  }
}

@keyframes smokeVertical2 {
  0% {
    opacity: 0.05;
    transform: translateY(10%) scale(0.9) skewY(-5deg);
  }
  25% {
    opacity: 0.1;
    transform: translateY(-5%) scale(1.2) skewY(5deg);
  }
  50% {
    opacity: 0.15;
    transform: translateY(0%) scale(1.3) skewY(-3deg);
  }
  75% {
    opacity: 0.1;
    transform: translateY(5%) scale(1.2) skewY(3deg);
  }
  100% {
    opacity: 0.05;
    transform: translateY(10%) scale(0.9) skewY(-5deg);
  }
}

@keyframes glowSoft {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.3);
  }
}

.animate-smoke-1 {
  animation: smokeHorizontal1 8s ease-in-out infinite;
}

.animate-smoke-2 {
  animation: smokeHorizontal2 12s ease-in-out infinite;
}

.animate-smoke-vertical-1 {
  animation: smokeVertical1 10s ease-in-out infinite;
}

.animate-smoke-vertical-2 {
  animation: smokeVertical2 14s ease-in-out infinite;
}

.animate-glow-soft {
  animation: glowSoft 6s ease-in-out infinite;
}

@keyframes smokeDense1 {
  0%, 100% {
    opacity: 0.1;
    transform: translateX(-5%) scaleX(0.9);
  }
  50% {
    opacity: 0.3;
    transform: translateX(5%) scaleX(1.1);
  }
}

@keyframes smokeDense2 {
  0%, 100% {
    opacity: 0.15;
    transform: translateX(5%) scaleX(0.95);
  }
  50% {
    opacity: 0.35;
    transform: translateX(-5%) scaleX(1.05);
  }
}

@keyframes smokeDenseVertical {
  0%, 100% {
    opacity: 0.1;
    transform: translateY(-5%) scaleY(0.9);
  }
  50% {
    opacity: 0.3;
    transform: translateY(5%) scaleY(1.1);
  }
}

.animate-smoke-dense-1 {
  animation: smokeDense1 4s ease-in-out infinite;
}

.animate-smoke-dense-2 {
  animation: smokeDense2 4s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-smoke-dense-3 {
  animation: smokeDense1 4s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-smoke-dense-vertical-1 {
  animation: smokeDenseVertical 4s ease-in-out infinite;
}

.animate-smoke-dense-vertical-2 {
  animation: smokeDenseVertical 4s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes smokeStatic {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

@keyframes pointPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

.animate-smoke-static {
  animation: smokeStatic 4s ease-in-out infinite;
}

.animate-point-pulse {
  animation: pointPulse 3s ease-in-out infinite;
}

.curved-path {
  filter: blur(8px);
  animation: pathPulse 4s ease-in-out infinite;
}

@keyframes pathPulse {
  0%, 100% {
    opacity: 0.2;
    stroke-width: 2;
  }
  50% {
    opacity: 0.4;
    stroke-width: 3;
  }
}

@keyframes pointPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}
</style> 
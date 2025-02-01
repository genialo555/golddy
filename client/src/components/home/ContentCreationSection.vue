<template>
  <section class="relative py-32 min-h-[1000px] bg-white" @mouseleave="handleSectionLeave">
    <CreationBackground />
    
    <div class="max-w-[1400px] mx-auto px-6">
      <!-- Section Header Centré -->
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
          Création 
          <span class="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            intelligente
          </span>
        </h2>
        <p class="text-gray-600 text-xl leading-relaxed">
          Une suite complète d'outils IA pour analyser votre secteur et créer du contenu optimisé qui résonne avec votre audience.
        </p>
      </div>

      <div class="cards-container relative flex items-center justify-center gap-8 min-h-[800px] w-full">
        <!-- Cartes latérales gauches -->
        <div class="cards-group flex gap-4">
          <!-- Analyse Sectorielle -->
          <div class="feature-bar group relative h-[800px] w-20 transition-all duration-300 cursor-pointer overflow-hidden bg-gray-900/95 border border-gray-800 rounded-2xl"
               :class="{'auto-expand': expandedCard === 'analysis'}"
               @mouseenter="handleMouseEnter('analysis')"
               @mouseleave="handleMouseLeave">
            <div class="ai-dialogue left">
              "J'analyse en temps réel les tendances de votre secteur pour identifier les opportunités de croissance 🎯"
            </div>
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Analyse Sectorielle
            </div>
            <div class="content-wrapper">
              <p class="description">Analysez votre marché et identifiez les tendances clés.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">🎯 Engagement: +45%</div>
                <div class="stat-item">📈 Croissance: +32%</div>
                <div class="stat-item">🔍 Insights IA</div>
              </div>
            </div>
          </div>

          <!-- Génération Script -->
          <div class="feature-bar group relative h-[800px] w-20 transition-all duration-300 cursor-pointer overflow-hidden bg-gray-900/95 border border-gray-800 rounded-2xl"
               :class="{'auto-expand': expandedCard === 'script'}"
               @mouseenter="handleMouseEnter('script')"
               @mouseleave="handleMouseLeave">
            <div class="ai-dialogue left">
              "Je génère des scripts optimisés pour maximiser l'engagement de votre audience ✍️"
            </div>
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Génération Script
            </div>
            <div class="content-wrapper">
              <p class="description">Créez des scripts optimisés par notre IA.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">📝 Scripts personnalisés</div>
                <div class="stat-item">⚡️ Conversion: +35%</div>
                <div class="stat-item">🎯 Optimisation continue</div>
              </div>
            </div>
          </div>

          <!-- Analyse Audio -->
          <div class="feature-bar group relative h-[800px] w-20 transition-all duration-300 cursor-pointer overflow-hidden bg-gray-900/95 border border-gray-800 rounded-2xl"
               :class="{'auto-expand': expandedCard === 'audio'}"
               @mouseenter="handleMouseEnter('audio')"
               @mouseleave="handleMouseLeave">
            <div class="ai-dialogue left">
              "J'optimise la qualité sonore pour une expérience audio exceptionnelle 🎧"
            </div>
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Analyse Audio
            </div>
            <div class="content-wrapper">
              <p class="description">Optimisez la qualité de vos contenus audio.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">🎙️ Qualité sonore: +80%</div>
                <div class="stat-item">🔊 Clarté optimale</div>
                <div class="stat-item">📊 Analyse en temps réel</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carte centrale -->
        <div class="central-card-wrapper"
             :class="{'reduced': isCentralCardReduced}"
             @mouseenter="handleMouseEnter('demo')"
             @mouseleave="handleMouseLeave">
          <div class="central-card feature-card relative rounded-2xl border border-gray-800 bg-gray-900/95 overflow-hidden">
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Démo Vidéo
            </div>
            <div class="content-wrapper">
              <p class="description">Visualisez vos performances en temps réel.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">🎥 Qualité vidéo HD</div>
                <div class="stat-item">⚡️ Streaming optimisé</div>
                <div class="stat-item">📊 Analytics en direct</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cartes latérales droites -->
        <div class="cards-group flex gap-4">
          <!-- Optimisation IA -->
          <div class="feature-bar group relative h-[800px] w-20 transition-all duration-300 cursor-pointer overflow-hidden bg-gray-900/95 border border-gray-800 rounded-2xl"
               :class="{'auto-expand': expandedCard === 'optimization'}"
               @mouseenter="handleMouseEnter('optimization')"
               @mouseleave="handleMouseLeave">
            <div class="ai-dialogue right">
              "J'optimise automatiquement vos contenus pour maximiser leur impact 🚀"
            </div>
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Optimisation IA
            </div>
            <div class="content-wrapper">
              <p class="description">Maximisez l'impact de vos contenus.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">🤖 IA avancée</div>
                <div class="stat-item">📈 Performance: +45%</div>
                <div class="stat-item">🎯 Ciblage précis</div>
              </div>
            </div>
          </div>

          <!-- Performance -->
          <div class="feature-bar group relative h-[800px] w-20 transition-all duration-300 cursor-pointer overflow-hidden bg-gray-900/95 border border-gray-800 rounded-2xl"
               :class="{'auto-expand': expandedCard === 'performance'}"
               @mouseenter="handleMouseEnter('performance')"
               @mouseleave="handleMouseLeave">
            <div class="ai-dialogue right">
              "Je surveille et optimise vos performances en temps réel 📈"
            </div>
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Performance
            </div>
            <div class="content-wrapper">
              <p class="description">Suivez et optimisez vos résultats.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">📈 ROI: +60%</div>
                <div class="stat-item">🎯 Conversion x2</div>
                <div class="stat-item">📊 KPIs en temps réel</div>
              </div>
            </div>
          </div>

          <!-- Tendances -->
          <div class="feature-bar group relative h-[800px] w-20 transition-all duration-300 cursor-pointer overflow-hidden bg-gray-900/95 border border-gray-800 rounded-2xl"
               :class="{'auto-expand': expandedCard === 'trends'}"
               @mouseenter="handleMouseEnter('trends')"
               @mouseleave="handleMouseLeave">
            <div class="ai-dialogue right">
              "Je prédis les tendances futures pour vous garder en avance 🔮"
            </div>
            <div class="vertical-text p-6 text-xl font-semibold text-white whitespace-nowrap absolute">
              Tendances
            </div>
            <div class="content-wrapper">
              <p class="description">Anticipez les tendances de votre marché.</p>
              <div class="flex flex-col gap-4">
                <div class="stat-item">🔮 Prédictions IA</div>
                <div class="stat-item">📊 Analyse prédictive</div>
                <div class="stat-item">🎯 Recommandations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-bar {
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width, transform;
  height: 800px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 1;
}

/* Couleurs alternées pour les cartes */
.feature-bar:nth-child(1) {
  background: rgba(56, 189, 248, 0.95); /* Bleu clair */
}

.feature-bar:nth-child(2) {
  background: rgba(99, 102, 241, 0.95); /* Indigo */
}

.feature-bar:nth-child(3) {
  background: rgba(139, 92, 246, 0.95); /* Violet */
}

.feature-bar:not(.auto-expand):hover,
.feature-bar.auto-expand {
  background: rgba(17, 24, 39, 0.98) !important;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-bar.auto-expand {
  width: 500px;
}

.vertical-text {
  position: absolute;
  writing-mode: vertical-rl;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(180deg);
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.9;
}

.feature-bar:hover .vertical-text {
  opacity: 1;
}

.feature-bar.auto-expand .vertical-text {
  writing-mode: horizontal-tb;
  transform: none;
  top: 2rem;
  left: 2rem;
  opacity: 1;
}

.cards-container {
  perspective: none;
  overflow: visible;
  padding: 2rem 0;
}

.cards-group {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 1.5rem;
}

.central-card-wrapper {
  position: relative;
  z-index: 5;
  width: 500px;
  height: 800px;
  margin: 0 3rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  cursor: pointer;
}

.central-card-wrapper.reduced {
  width: 80px;
  opacity: 0.8;
}

.central-card {
  width: 100% !important;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(139, 92, 246, 0.95) !important; /* Violet */
}

.central-card .vertical-text {
  position: absolute;
  writing-mode: vertical-rl;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(180deg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper {
  opacity: 0;
  padding: 6rem 2rem 2rem;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.auto-expand .content-wrapper {
  opacity: 1;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Cartes droites */
.cards-group:last-child .feature-bar:nth-child(1) {
  background: rgba(167, 139, 250, 0.95); /* Violet clair */
}

.cards-group:last-child .feature-bar:nth-child(2) {
  background: rgba(192, 132, 252, 0.95); /* Violet-rose */
}

.cards-group:last-child .feature-bar:nth-child(3) {
  background: rgba(244, 114, 182, 0.95); /* Rose */
}

.central-card-wrapper.reduced .central-card {
  background: rgba(147, 51, 234, 0.95) !important; /* Violet moyen */
}

.central-card-wrapper:not(.reduced) .central-card {
  background: rgba(17, 24, 39, 0.98) !important;
}

.ai-dialogue {
  position: absolute;
  font-size: 0.9rem;
  color: white;
  background: rgba(17, 24, 39, 0.9);
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  max-width: 200px;
  z-index: 20;
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.ai-dialogue.left {
  right: calc(100% + 1rem);
  top: 50%;
  transform: translateY(-50%);
}

.ai-dialogue.right {
  left: calc(100% + 1rem);
  top: 50%;
  transform: translateY(-50%);
}

.feature-bar:hover .ai-dialogue {
  opacity: 1;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CreationBackground from '../backgrounds/CreationBackground.vue'

const expandedCard = ref('demo')
const lastExpandedCard = ref('demo')

const isCentralCardReduced = computed(() => {
  return expandedCard.value !== 'demo'
})

const handleMouseEnter = (cardName: string) => {
  setTimeout(() => {
    if (cardName === 'demo' && expandedCard.value === 'demo') {
      return
    }
    expandedCard.value = cardName
    lastExpandedCard.value = cardName
  }, 50)
}

const handleMouseLeave = () => {
  setTimeout(() => {
    if (lastExpandedCard.value && lastExpandedCard.value !== 'demo') {
      expandedCard.value = lastExpandedCard.value
    } else {
      expandedCard.value = 'demo'
    }
  }, 100)
}

const handleSectionLeave = () => {
  setTimeout(() => {
    expandedCard.value = 'demo'
    lastExpandedCard.value = 'demo'
  }, 200)
}
</script> 
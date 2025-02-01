<template>
  <section class="relative py-32 min-h-[1000px] bg-white">
    <div class="max-w-[1400px] mx-auto px-6">
      <div class="flex flex-col lg:flex-row gap-16">
        <!-- Section Header -->
        <div class="lg:w-1/3 lg:sticky lg:top-32 lg:self-start">
          <h2 class="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
            Analytics 
            <span class="bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
              avancés
            </span>
          </h2>
          <p class="text-gray-600 text-xl leading-relaxed">
            Une plateforme d'analytics sophistiquée qui transforme vos données Instagram en insights actionnables, vous permettant de prendre des décisions éclairées pour votre croissance.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="lg:w-2/3">
          <div class="grid grid-cols-3 gap-8">
            <!-- Analytics Avancés - Petite carte -->
            <div class="feature-card group relative p-8 rounded-2xl border border-gray-800 transition-all duration-700 bg-gray-900 hover:border-violet-500 hover:shadow-lg overflow-hidden cursor-pointer"
                 @click="openModal('analytics')">
              <div class="analytics-bg absolute inset-0 opacity-20">
                <div class="analytics-comments">
                  <div class="comment">❤️ +1.2k likes aujourd'hui</div>
                  <div class="comment">📈 +532 nouveaux followers</div>
                  <div class="comment">💫 892 stories mentions</div>
                </div>
              </div>
              <div class="relative z-10">
                <div class="w-14 h-14 rounded-xl bg-transparent group-hover:bg-violet-500/20 flex items-center justify-center mb-6 transition-colors duration-700">
                  <svg class="w-7 h-7 text-violet-400 group-hover:text-violet-300 transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-semibold mb-3 text-white group-hover:text-white/90 transition-colors duration-700">
                  Analytics Avancés
                </h3>
                <p class="text-gray-400 text-lg group-hover:text-gray-300 transition-colors duration-700">
                  Transformez vos données brutes en insights actionnables.
                </p>
              </div>
            </div>

            <!-- Prédictions de Croissance - Grande carte -->
            <div class="col-span-2 feature-card group relative p-8 rounded-2xl border border-gray-800 transition-all duration-700 bg-gray-900 hover:border-blue-500 hover:shadow-lg overflow-hidden cursor-pointer"
                 @click="openModal('growth')">
              <div class="prediction-bg absolute inset-0 opacity-20">
                <div class="prediction-text">
                  <div class="text">📊 Croissance prévue: +28%</div>
                  <div class="text">🚀 Tendance: Forte hausse</div>
                  <div class="text">✨ Confiance IA: 92%</div>
                </div>
              </div>
              <div class="relative z-10 max-w-2xl">
                <div class="w-16 h-16 rounded-xl bg-transparent group-hover:bg-blue-500/20 flex items-center justify-center mb-6 transition-colors duration-700">
                  <svg class="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 class="text-3xl font-semibold mb-4 text-white group-hover:text-white/90 transition-colors duration-700">
                  Prédictions IA
                </h3>
                <p class="text-gray-400 text-xl group-hover:text-gray-300 transition-colors duration-700">
                  Anticipez votre croissance grâce à nos modèles prédictifs basés sur l'IA.
                </p>
              </div>
            </div>

            <!-- Affinité Marques - Grande carte -->
            <div class="col-span-2 feature-card group relative p-8 rounded-2xl border border-gray-800 transition-all duration-700 bg-gray-900 hover:border-green-500 hover:shadow-lg overflow-hidden cursor-pointer"
                 @click="openModal('affinity')">
              <div class="affinity-bg absolute inset-0 opacity-20">
                <div class="hashtag-suggestions">
                  <div class="suggestion">🎯 #TechInnovation +45%</div>
                  <div class="suggestion">💡 #DigitalFuture +38%</div>
                  <div class="suggestion">🚀 #FutureTech trending</div>
                </div>
              </div>
              <div class="relative z-10 max-w-2xl">
                <div class="w-16 h-16 rounded-xl bg-transparent group-hover:bg-green-500/20 flex items-center justify-center mb-6 transition-colors duration-700">
                  <svg class="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 class="text-3xl font-semibold mb-4 text-white group-hover:text-white/90 transition-colors duration-700">
                  Affinité Marques
                </h3>
                <p class="text-gray-400 text-xl group-hover:text-gray-300 transition-colors duration-700">
                  Identifiez les marques qui correspondent le mieux à votre profil.
                </p>
              </div>
            </div>

            <!-- Qualité d'Audience - Petite carte -->
            <div class="feature-card group relative p-8 rounded-2xl border border-gray-800 transition-all duration-700 bg-gray-900 hover:border-orange-500 hover:shadow-lg overflow-hidden cursor-pointer"
                 @click="openModal('audience')">
              <div class="audience-bg absolute inset-0 opacity-20">
                <div class="engagement-stats">
                  <div class="stat">👥 Audience: 92% active</div>
                  <div class="stat">💫 Engagement: 78%</div>
                  <div class="stat">🎯 Rétention: 85%</div>
                </div>
              </div>
              <div class="relative z-10">
                <div class="w-14 h-14 rounded-xl bg-transparent group-hover:bg-orange-500/20 flex items-center justify-center mb-6 transition-colors duration-700">
                  <svg class="w-7 h-7 text-orange-400 group-hover:text-orange-300 transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-semibold mb-3 text-white group-hover:text-white/90 transition-colors duration-700">
                  Qualité d'Audience
                </h3>
                <p class="text-gray-400 text-lg group-hover:text-gray-300 transition-colors duration-700">
                  Analysez la qualité de votre audience pour maximiser votre impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-2xl font-bold leading-6 text-gray-900 mb-4">
                  {{ modalContent.title }}
                </DialogTitle>

                <div class="mt-4">
                  <div class="prose prose-lg">
                    <h4 class="text-xl font-semibold text-gray-800 mb-4">{{ modalContent.subtitle }}</h4>
                    <p class="text-gray-600 mb-6">{{ modalContent.description }}</p>
                    
                    <div class="space-y-4">
                      <h5 class="text-lg font-semibold text-gray-800">Fonctionnalités principales :</h5>
                      <ul class="list-disc pl-5 space-y-2">
                        <li v-for="feature in modalContent.features" :key="feature" class="text-gray-600">
                          {{ feature }}
                        </li>
                      </ul>
                    </div>

                    <div class="mt-8">
                      <h5 class="text-lg font-semibold text-gray-800 mb-4">Avantages :</h5>
                      <div class="grid grid-cols-2 gap-4">
                        <div v-for="benefit in modalContent.benefits" :key="benefit.title" 
                             class="p-4 rounded-lg bg-gray-50">
                          <h6 class="font-semibold text-gray-800">{{ benefit.title }}</h6>
                          <p class="text-sm text-gray-600">{{ benefit.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-8 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-violet-100 px-4 py-2 text-sm font-medium text-violet-900 hover:bg-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                    @click="closeModal"
                  >
                    Fermer
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

const isModalOpen = ref(false)
const currentFeature = ref('')

const modalContents = {
  analytics: {
    title: 'Analytics Avancés',
    subtitle: 'Transformez vos données en insights actionnables',
    description: 'Notre plateforme analyse en profondeur vos données Instagram pour vous fournir des insights précis et actionnables qui vous permettront d\'optimiser votre stratégie de contenu.',
    features: [
      'Analyse détaillée de l\'engagement par type de contenu',
      'Métriques d\'audience avancées',
      'Suivi des performances dans le temps',
      'Benchmarking avec des comptes similaires',
      'Rapports personnalisés exportables'
    ],
    benefits: [
      {
        title: 'Décisions Data-Driven',
        description: 'Prenez des décisions basées sur des données concrètes plutôt que sur l\'intuition'
      },
      {
        title: 'Optimisation Continue',
        description: 'Identifiez les opportunités d\'amélioration et ajustez votre stratégie en temps réel'
      },
      {
        title: 'ROI Mesurable',
        description: 'Mesurez précisément le retour sur investissement de vos actions'
      },
      {
        title: 'Insights Actionnables',
        description: 'Recevez des recommandations concrètes pour améliorer vos performances'
      }
    ]
  },
  growth: {
    title: 'Prédictions de Croissance',
    subtitle: 'Anticipez votre croissance avec l\'IA',
    description: 'Nos modèles d\'intelligence artificielle analysent vos données historiques et les tendances du marché pour prédire votre croissance future et vous aider à l\'optimiser.',
    features: [
      'Prévisions de croissance basées sur l\'IA',
      'Analyse des tendances de votre niche',
      'Identification des facteurs de croissance',
      'Recommandations personnalisées',
      'Alertes d\'opportunités'
    ],
    benefits: [
      {
        title: 'Planification Stratégique',
        description: 'Planifiez votre stratégie en fonction des prévisions de croissance'
      },
      {
        title: 'Optimisation Proactive',
        description: 'Anticipez les tendances et adaptez votre contenu en conséquence'
      },
      {
        title: 'Objectifs Réalistes',
        description: 'Fixez des objectifs atteignables basés sur des données concrètes'
      },
      {
        title: 'Croissance Accélérée',
        description: 'Maximisez votre potentiel de croissance grâce à des insights prédictifs'
      }
    ]
  },
  affinity: {
    title: 'Affinité Marques',
    subtitle: 'Trouvez les partenariats parfaits',
    description: 'Notre système analyse votre profil, votre contenu et votre audience pour identifier les marques qui correspondent le mieux à votre image et à vos valeurs.',
    features: [
      'Scoring d\'affinité avec les marques',
      'Analyse des mentions et hashtags',
      'Évaluation du potentiel de collaboration',
      'Suggestions de marques pertinentes',
      'Historique des performances par marque'
    ],
    benefits: [
      {
        title: 'Partenariats Pertinents',
        description: 'Collaborez avec des marques qui correspondent à votre image'
      },
      {
        title: 'Négociations Facilitées',
        description: 'Utilisez des données concrètes pour négocier vos partenariats'
      },
      {
        title: 'ROI Optimisé',
        description: 'Maximisez le retour sur investissement de vos collaborations'
      },
      {
        title: 'Image de Marque',
        description: 'Préservez l\'authenticité de votre personal branding'
      }
    ]
  },
  audience: {
    title: 'Qualité d\'Audience',
    subtitle: 'Analysez et optimisez votre communauté',
    description: 'Évaluez la qualité de votre audience grâce à des métriques avancées et des analyses comportementales pour maximiser l\'impact de votre contenu.',
    features: [
      'Analyse démographique détaillée',
      'Mesure de l\'engagement réel',
      'Détection des followers authentiques',
      'Analyse des interactions',
      'Segmentation avancée'
    ],
    benefits: [
      {
        title: 'Engagement Authentique',
        description: 'Assurez-vous de la qualité de vos interactions'
      },
      {
        title: 'Ciblage Précis',
        description: 'Adaptez votre contenu à votre audience réelle'
      },
      {
        title: 'Crédibilité Renforcée',
        description: 'Démontrez la valeur de votre communauté aux marques'
      },
      {
        title: 'Croissance Qualitative',
        description: 'Attirez une audience plus engagée et pertinente'
      }
    ]
  }
}

const modalContent = ref(modalContents.analytics)

const openModal = (feature: string) => {
  currentFeature.value = feature
  modalContent.value = modalContents[feature]
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Ajout de l'effet de suivi de la souris
onMounted(() => {
  const cards = document.querySelectorAll('.feature-card')
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      ;(card as HTMLElement).style.setProperty('--mouse-x', `${x}%`)
      ;(card as HTMLElement).style.setProperty('--mouse-y', `${y}%`)
    })
  })
})
</script>

<style scoped>
.feature-card {
  min-height: 280px;
  position: relative;
  background: rgb(31, 41, 55);  /* Fond plus clair */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Animation d'apparition séquentielle */
@keyframes cardAppear {
  0% { 
    opacity: 0;
    transform: translateY(20px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: cardAppear 0.5s ease-out forwards;
  opacity: 0;
}

.feature-card:nth-child(1) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(2) {
  animation-delay: 0.4s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.6s;
}

.feature-card:nth-child(4) {
  animation-delay: 0.8s;
}

/* Transition des contenus au hover */
.feature-card .relative.z-10 h3,
.feature-card .relative.z-10 p {
  transition: opacity 0.3s ease-out;
}

.feature-card:hover .relative.z-10 h3,
.feature-card:hover .relative.z-10 p {
  opacity: 0;
}

/* Styles des animations de background */
.analytics-comments,
.prediction-text,
.hashtag-suggestions,
.engagement-stats {
  font-family: 'SF Mono', monospace;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 2rem;
  font-size: 1.3rem;
  opacity: 0.4;  /* Opacité de base augmentée */
  transition: all 0.5s ease-out;
  letter-spacing: 0.02em;
  font-weight: 600;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);  /* Léger fond clair */
}

.analytics-comments {
  color: rgba(255, 255, 255, 1);
  background: linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(167, 139, 250, 0.25));
  text-shadow: 0 0 30px rgba(139, 92, 246, 1);
}

.prediction-text {
  color: rgba(255, 255, 255, 1);
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.25));
  text-shadow: 0 0 30px rgba(59, 130, 246, 1);
}

.hashtag-suggestions {
  color: rgba(255, 255, 255, 1);
  background: linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.25));
  text-shadow: 0 0 30px rgba(34, 197, 94, 1);
}

.engagement-stats {
  color: rgba(255, 255, 255, 1);
  background: linear-gradient(45deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.25));
  text-shadow: 0 0 30px rgba(249, 115, 22, 1);
}

.feature-card:hover .analytics-comments,
.feature-card:hover .prediction-text,
.feature-card:hover .hashtag-suggestions,
.feature-card:hover .engagement-stats {
  opacity: 1;
  transform: scale(1.05);
  background: linear-gradient(45deg, 
    rgba(31, 41, 55, 1),  /* Opacité à 100% */
    rgba(31, 41, 55, 1)   /* Opacité à 100% */
  );
  backdrop-filter: blur(8px);
}

.comment, .text, .suggestion, .stat {
  animation: float 6s ease-in-out infinite;
  text-shadow: 0 0 30px currentColor;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  background: rgba(31, 41, 55, 1);  /* Opacité à 100% */
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.7);  /* Bordure plus visible */
  transform-origin: center;
  opacity: 0.6;  /* Opacité de base augmentée */
  transition: all 0.3s ease-out;
  font-weight: 700;
  letter-spacing: 0.02em;
  width: 90%;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.feature-card:hover .comment,
.feature-card:hover .text,
.feature-card:hover .suggestion,
.feature-card:hover .stat {
  opacity: 1;
  transition-delay: 0.1s;
  border-color: rgba(255, 255, 255, 1);  /* Bordure totalement visible */
  box-shadow: 
    0 0 40px rgba(255, 255, 255, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
  background: rgba(31, 41, 55, 1);  /* Opacité à 100% */
  transform: scale(1.05);
}

/* Augmentation de la visibilité des textes */
.comment, .text, .suggestion, .stat {
  color: rgba(255, 255, 255, 1);  /* Texte totalement opaque */
  font-size: 1.1rem;  /* Taille de police légèrement augmentée */
}

/* Renforcement des effets lumineux */
.feature-card:hover {
  transform: translateY(-5px);
  background: rgb(31, 41, 55);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(255, 255, 255, 0.25);  /* Glow plus intense */
}

/* Animation plus visible */
@keyframes float {
  0% { transform: translateY(0px) scale(1); filter: brightness(1); }
  50% { transform: translateY(-15px) scale(1.05); filter: brightness(1.2); }
  100% { transform: translateY(0px) scale(1); filter: brightness(1); }
}

/* Effet de pulse plus prononcé */
@keyframes pulse {
  0% { opacity: 1; transform: scale(1); filter: brightness(1.4); }
  50% { opacity: 1; transform: scale(1.4); filter: brightness(1.8); }
  100% { opacity: 1; transform: scale(1); filter: brightness(1.4); }
}

.comment::first-letter,
.text::first-letter,
.suggestion::first-letter,
.stat::first-letter {
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
  margin-right: 0.8rem;
  filter: drop-shadow(0 0 15px currentColor);
  font-size: 1.4em;
}

/* Effet de glow sur les valeurs numériques */
.comment strong,
.text strong,
.suggestion strong,
.stat strong {
  color: rgba(255, 255, 255, 1);
  font-weight: 800;
  text-shadow: 0 0 25px currentColor;
  padding: 0 0.3rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.3rem;
}

/* Ajout d'un effet de transition plus prononcé */
.feature-card {
  transition: all 0.5s ease-out;
}

/* Ajustement des couleurs de texte pour un meilleur contraste */
.feature-card .text-gray-400 {
  color: rgba(209, 213, 219, 0.9);
}

.feature-card:hover .text-gray-300 {
  color: rgba(229, 231, 235, 1);
}
</style> 
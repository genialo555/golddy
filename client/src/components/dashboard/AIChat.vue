<template>
  <div class="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg text-white font-semibold">Assistants IA</h2>
      <div class="flex gap-2">
        <button 
          v-for="agent in agents" 
          :key="agent.id"
          @click="selectAgent(agent)"
          :class="[
            'px-3 py-1 rounded-full text-sm transition-colors',
            currentAgent?.id === agent.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          ]"
        >
          {{ agent.name }}
        </button>
      </div>
    </div>

    <div class="h-[400px] flex flex-col">
      <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        <div v-for="message in messages" :key="message.id" 
             :class="['flex', message.isBot ? 'justify-start' : 'justify-end']">
          <div :class="[
            'max-w-[80%] rounded-lg p-3',
            message.isBot ? 'bg-gray-800/50' : 'bg-blue-500/50'
          ]">
            <div v-if="message.isBot" class="flex items-center gap-2 mb-1">
              <span class="text-xs font-medium" :style="{ color: message.agentColor }">
                {{ message.agentName }}
              </span>
            </div>
            <p class="text-sm text-gray-200">{{ message.content }}</p>
            <span class="text-xs text-gray-400 mt-1 block">{{ message.time }}</span>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <input 
          v-model="newMessage"
          type="text"
          :placeholder="getPlaceholder"
          class="flex-1 bg-white/5 border border-gray-800 rounded-lg px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="sendMessage"
        >
        <button 
          @click="sendMessage"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { fetchScraperInsights, fetchAIAnalysis } from '../../services/api.service'

interface Message {
  id: number
  content: string
  isBot: boolean
  time: string
  agentName?: string
  agentColor?: string
}

interface Agent {
  id: string
  name: string
  color: string
  role: string
  greeting: string
  placeholder: string
  getResponse: (message: string) => Promise<string>
}

const agents: Agent[] = [
  {
    id: 'meta',
    name: 'Meta Agent',
    color: '#ef4444',
    role: 'Coordinateur IA',
    greeting: "Je suis le Meta Agent, capable de coordonner les conversations entre les différents experts pour vous apporter une analyse complète.",
    placeholder: "Ex: Analyse complète de mon profil avec tous les experts...",
    getResponse: async (message: string) => {
      try {
        // 1. Vérifier d'abord les données existantes
        const existingData = await fetchExistingData(message)
        let insights = []

        if (existingData && existingData.hasData) {
          insights.push("Analyse basée sur les données existantes :")
          insights.push(existingData.analysis)
        } else {
          // 2. Si pas de données existantes, déclencher le scraper
          const scrapedData = await triggerScraping(message)
          if (scrapedData.success) {
            insights.push("Nouvelles données collectées :")
            insights.push(scrapedData.insights)
          }
        }

        // 3. Obtenir l'analyse IA sur les données disponibles
        const aiAnalysis = await fetchAIAnalysis(message)
        insights.push("\nRecommandations IA :")
        insights.push(aiAnalysis)

        return insights.join('\n')
      } catch (error) {
        console.error('Error in meta agent:', error)
        return "Désolé, une erreur est survenue lors de l'analyse."
      }
    }
  },
  {
    id: 'scraper',
    name: 'Scraper',
    color: '#0ea5e9',
    role: 'Expert en Scraping',
    greeting: "Je suis votre expert en scraping. Je peux analyser les données de vos concurrents et du marché pour vous donner des insights précieux.",
    placeholder: "Ex: Analyse les tendances de mes concurrents...",
    getResponse: async (message: string) => {
      try {
        // Utiliser le service avec priorité
        const insights = await fetchScraperInsights(message)
        return insights
      } catch (error) {
        console.error('Error fetching scraper insights:', error)
        return "Désolé, une erreur est survenue lors de l'analyse des données."
      }
    }
  },
  {
    id: 'ai',
    name: 'IA Avancée',
    color: '#6366f1',
    role: 'Expert IA',
    greeting: "Je suis votre expert en intelligence artificielle. Je peux analyser vos données en profondeur et générer des recommandations personnalisées.",
    placeholder: "Ex: Analyse approfondie de ma stratégie...",
    getResponse: async (message: string) => {
      return "Analyse IA en cours... Voici les recommandations basées sur les modèles avancés..."
    }
  },
  {
    id: 'content',
    name: 'Rédacteur',
    color: '#3b82f6',
    role: 'Rédacteur de contenu',
    greeting: "Je suis votre assistant rédactionnel. Je peux vous aider à créer des légendes captivantes, optimiser vos hashtags et améliorer votre storytelling.",
    placeholder: "Ex: Aide-moi à rédiger une légende pour ma prochaine publication...",
    getResponse: async (message: string) => {
      return "Je vais vous aider à créer un contenu engageant qui résonne avec votre audience. Voici quelques suggestions..."
    }
  },
  {
    id: 'analytics',
    name: 'Analyste',
    color: '#10b981',
    role: 'Analyste de performance',
    greeting: "Je suis votre analyste de données. Je peux interpréter vos statistiques et vous donner des recommandations basées sur vos performances.",
    placeholder: "Ex: Analyse mes statistiques du dernier mois...",
    getResponse: async (message: string) => {
      return "D'après l'analyse de vos données, voici les points clés à retenir..."
    }
  },
  {
    id: 'strategy',
    name: 'Stratège',
    color: '#8b5cf6',
    role: 'Stratège marketing',
    greeting: "Je suis votre stratège marketing. Je peux vous aider à développer votre présence et maximiser votre impact sur Instagram.",
    placeholder: "Ex: Comment puis-je augmenter mon engagement...",
    getResponse: async (message: string) => {
      return "Voici une stratégie personnalisée basée sur votre profil et vos objectifs..."
    }
  },
  {
    id: 'collab',
    name: 'Networking',
    color: '#f59e0b',
    role: 'Expert en collaborations',
    greeting: "Je suis votre expert en networking. Je peux vous conseiller sur les collaborations et les partenariats potentiels.",
    placeholder: "Ex: Trouve-moi des marques qui correspondent à mon profil...",
    getResponse: async (message: string) => {
      return "Basé sur votre niche et votre audience, voici les opportunités de collaboration à considérer..."
    }
  },
  {
    id: 'trends',
    name: 'Tendances',
    color: '#ec4899',
    role: 'Expert en tendances',
    greeting: "Je suis votre expert en tendances. Je peux vous informer des dernières tendances et vous aider à les adapter à votre contenu.",
    placeholder: "Ex: Quelles sont les tendances actuelles dans ma niche...",
    getResponse: async (message: string) => {
      return "Voici les tendances émergentes dans votre domaine et comment les utiliser..."
    }
  }
]

const currentAgent = ref<Agent>(agents[0])
const messages = ref<Message[]>([
  {
    id: 1,
    content: currentAgent.value.greeting,
    isBot: true,
    time: new Date().toLocaleTimeString().slice(0, 5),
    agentName: currentAgent.value.role,
    agentColor: currentAgent.value.color
  }
])

const newMessage = ref('')

const getPlaceholder = computed(() => currentAgent.value.placeholder)

const selectAgent = (agent: Agent) => {
  currentAgent.value = agent
  messages.value.push({
    id: Date.now(),
    content: agent.greeting,
    isBot: true,
    time: new Date().toLocaleTimeString().slice(0, 5),
    agentName: agent.role,
    agentColor: agent.color
  })
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userMessage = newMessage.value
  newMessage.value = ''

  // Ajouter le message de l'utilisateur
  messages.value.push({
    id: Date.now(),
    content: userMessage,
    isBot: false,
    time: new Date().toLocaleTimeString().slice(0, 5)
  })

  try {
    if (currentAgent.value.id === 'meta') {
      // Gérer la réponse du Meta Agent de manière asynchrone
      const response = await currentAgent.value.getResponse(userMessage)
      messages.value.push({
        id: Date.now() + 1,
        content: response,
        isBot: true,
        time: new Date().toLocaleTimeString().slice(0, 5),
        agentName: currentAgent.value.role,
        agentColor: currentAgent.value.color
      })
    } else {
      // Gérer la réponse des autres agents
      const response = await currentAgent.value.getResponse(userMessage)
      messages.value.push({
        id: Date.now() + 1,
        content: response,
        isBot: true,
        time: new Date().toLocaleTimeString().slice(0, 5),
        agentName: currentAgent.value.role,
        agentColor: currentAgent.value.color
      })
    }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    messages.value.push({
      id: Date.now() + 1,
      content: "Désolé, une erreur est survenue lors du traitement de votre demande.",
      isBot: true,
      time: new Date().toLocaleTimeString().slice(0, 5),
      agentName: currentAgent.value.role,
      agentColor: currentAgent.value.color
    })
  }
}
</script> 
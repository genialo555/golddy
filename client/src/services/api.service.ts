import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour gérer les tokens d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Service pour les données existantes (priorité 1)
export const fetchExistingData = async (query: string): Promise<any> => {
  try {
    const response = await api.post('/data/existing', { query })
    return response.data
  } catch (error) {
    console.error('Error fetching existing data:', error)
    throw error
  }
}

// Service pour le scraping (priorité 2)
export const triggerScraping = async (query: string): Promise<any> => {
  try {
    const response = await api.post('/scraper/trigger', { query })
    return response.data
  } catch (error) {
    console.error('Error triggering scraper:', error)
    throw error
  }
}

// Service pour les insights du scraper avec vérification préalable
export const fetchScraperInsights = async (query: string): Promise<string> => {
  try {
    // 1. D'abord, chercher dans les données existantes
    const existingData = await fetchExistingData(query)
    if (existingData && existingData.hasData) {
      return existingData.insights
    }

    // 2. Si pas de données, déclencher le scraper
    const scrapedData = await triggerScraping(query)
    return scrapedData.insights
  } catch (error) {
    console.error('Error in scraper insights pipeline:', error)
    throw error
  }
}

// Service pour l'analyse IA avec données existantes
export const fetchAIAnalysis = async (query: string): Promise<string> => {
  try {
    // 1. Vérifier les données existantes
    const existingAnalysis = await api.post('/ai/existing-analysis', { query })
    if (existingAnalysis.data.hasAnalysis) {
      return existingAnalysis.data.analysis
    }

    // 2. Si pas d'analyse existante, en créer une nouvelle
    const response = await api.post('/ai/analyze', { 
      query,
      useExistingData: true // Indique au backend d'utiliser d'abord les données existantes
    })
    return response.data.analysis
  } catch (error) {
    console.error('Error fetching AI analysis:', error)
    throw error
  }
}

// Service pour les données Instagram avec priorité
export const fetchInstagramData = async (userId: string) => {
  try {
    // 1. Vérifier les données en cache/DB
    const cachedData = await api.get(`/instagram/cached/${userId}`)
    if (cachedData.data.hasData) {
      return cachedData.data
    }

    // 2. Si pas de données en cache, utiliser le scraper
    const scrapedData = await api.post(`/instagram/scrape/${userId}`)
    if (scrapedData.data.success) {
      return scrapedData.data
    }

    // 3. En dernier recours, utiliser l'API Instagram
    const response = await api.get(`/instagram/data/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching Instagram data:', error)
    throw error
  }
}

export default api 

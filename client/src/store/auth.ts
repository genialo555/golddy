import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

interface LoginCredentials {
  email: string
  password: string
}

interface ApiError {
  message: string
  status: number
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  function login(credentials: { email: string; password: string }) {
    // Pour le dev, on simule une connexion réussie
    isAuthenticated.value = true
    return Promise.resolve()
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
  }

  async function checkAuth() {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      })
      user.value = response.data
      return response.data
    } catch (error) {
      user.value = null
      localStorage.removeItem('user')
      throw error
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth
  }
}) 
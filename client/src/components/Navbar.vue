<template>
  <nav :class="[
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
    scrolled ? 'backdrop-blur-sm bg-black/5' : ''
  ]">
    <div class="max-w-[1536px] mx-auto">
      <div class="flex justify-between items-center h-16">
        <!-- Logo et Navigation -->
        <div class="flex items-center gap-12">
          <!-- Logo -->
          <router-link to="/" class="text-xl font-bold text-white">LOGO</router-link>
          
          <!-- Navigation Links -->
          <div class="flex items-center space-x-8">
            <router-link to="/" class="text-white/70 hover:text-white transition-colors">Accueil</router-link>
            <router-link to="/features" class="text-white/70 hover:text-white transition-colors">Fonctionnalités</router-link>
            <router-link to="/pricing" class="text-white/70 hover:text-white transition-colors">Tarifs</router-link>
            <router-link to="/about" class="text-white/70 hover:text-white transition-colors">À propos</router-link>
          </div>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center gap-4">
          <router-link 
            to="/login"
            class="px-4 py-1.5 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            Se connecter
          </router-link>
          <router-link 
            to="/register"
            class="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
          >
            S'inscrire
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script> 
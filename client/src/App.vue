<script setup lang="ts">
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen">
    <Navbar />
    <router-view></router-view>
  </div>
</template>

<style>
:root {
  --primary-bg: #0f172a;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background-color: var(--primary-bg);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animations de transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-active {
  position: absolute;
}

/* Animation pour les cartes */
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Animation pour les graphiques */
.chart-enter-active {
  transition: all 0.6s ease-out;
}

.chart-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

/* Animation pour les métriques */
.metric-enter-active {
  transition: all 0.4s ease-out;
}

.metric-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

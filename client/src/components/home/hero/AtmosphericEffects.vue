<template>
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
</template>

<script setup lang="ts">
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulseSlow 4s ease-in-out infinite;
}

.animate-pulse-slower {
  animation: pulseSlow 12s ease-in-out infinite;
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
</style> 
<template>
  <div class="social-card group relative opacity-0">
    <div class="card-wrapper">
      <div class="card-background"></div>
      <div class="effects-layer">
        <div class="spotlight"></div>
        <div class="fog-effect"></div>
        <div class="glow-effect"></div>
      </div>
      <div class="card-content">
        <slot name="icon"></slot>
        <h3 class="text-lg font-semibold text-white transition-colors duration-500 mb-2">
          <slot name="title"></slot>
        </h3>
        <p class="text-sm text-white transition-colors duration-500">
          <slot name="description"></slot>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const card = document.querySelector('.social-card') as HTMLElement
  
  if (card) {
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
  }
})
</script>

<style scoped>
.social-card {
  @apply w-[240px] h-[180px] transform-gpu transition-all duration-500 relative overflow-visible;
  perspective: 1000px;
  transform-style: preserve-3d;
  opacity: 1;
}

.card-wrapper {
  @apply relative w-full h-full;
  transform-style: preserve-3d;
  transition: all 0.5s ease-out;
  clip-path: path('M0 20C0 8.954 8.954 0 20 0H220C231.046 0 240 8.954 240 20V160C240 171.046 231.046 180 220 180H20C8.954 180 0 171.046 0 160V20Z');
  opacity: 0.1;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 0 2px rgba(255, 255, 255, 0.05),
    0 0 20px -5px rgba(255, 255, 255, 0.1);
}

/* Cloud connection effect */
.social-card::before {
  content: '';
  @apply absolute -inset-20 opacity-0 transition-opacity duration-700;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.03) 40%,
    transparent 70%
  );
  filter: blur(30px);
  pointer-events: none;
  z-index: -1;
}

.social-card::after {
  content: '';
  @apply absolute -inset-24 opacity-0 transition-opacity duration-1000;
  background: radial-gradient(
    1000px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(167, 139, 250, 0.08) 0%,
    rgba(167, 139, 250, 0.05) 30%,
    rgba(167, 139, 250, 0.03) 50%,
    transparent 80%
  );
  filter: blur(40px);
  pointer-events: none;
  z-index: -2;
}

.social-card:hover::before,
.social-card:hover::after {
  opacity: 1;
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
  clip-path: path('M0 20C0 8.954 8.954 0 20 0H220C231.046 0 240 8.954 240 20V160C240 171.046 231.046 180 220 180H20C8.954 180 0 171.046 0 160V20Z');
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.effects-layer {
  @apply absolute inset-0 overflow-hidden;
  transform-style: preserve-3d;
  clip-path: path('M0 20C0 8.954 8.954 0 20 0H220C231.046 0 240 8.954 240 20V160C240 171.046 231.046 180 220 180H20C8.954 180 0 171.046 0 160V20Z');
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
  clip-path: path('M0 20C0 8.954 8.954 0 20 0H220C231.046 0 240 8.954 240 20V160C240 171.046 231.046 180 220 180H20C8.954 180 0 171.046 0 160V20Z');
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
  clip-path: path('M0 20C0 8.954 8.954 0 20 0H220C231.046 0 240 8.954 240 20V160C240 171.046 231.046 180 220 180H20C8.954 180 0 171.046 0 160V20Z');
}

.glow-effect {
  @apply absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500;
  background: radial-gradient(
    1000px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(167, 139, 250, 0.15) 40%,
    transparent 70%
  );
  mix-blend-mode: screen;
  clip-path: path('M0 20C0 8.954 8.954 0 20 0H220C231.046 0 240 8.954 240 20V160C240 171.046 231.046 180 220 180H20C8.954 180 0 171.046 0 160V20Z');
}

.card-content {
  @apply relative z-10 px-6 py-5;
  transform: translateZ(1px);
  opacity: 1;
  transition: all 0.5s ease-out;
}

.card-content :deep(img) {
  @apply opacity-100 transition-opacity duration-500;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) 
         drop-shadow(0 0 24px rgba(255, 255, 255, 0.6));
}

.card-content h3 {
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 0.8),
    0 0 30px rgba(255, 255, 255, 0.6),
    0 0 45px rgba(255, 255, 255, 0.4);
  font-weight: 700;
}

.card-content p {
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.7),
    0 0 24px rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.social-card:hover .card-wrapper {
  transform: translateZ(30px) scale(1.02);
  opacity: 1;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 0 0 2px rgba(255, 255, 255, 0.08),
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
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 0 30px rgba(255, 248, 220, 0.3),
    0 0 50px rgba(255, 248, 220, 0.2);
}

.social-card:hover {
  opacity: 1;
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

.social-card:hover .card-content :deep(img) {
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) 
         drop-shadow(0 0 24px rgba(255, 255, 255, 0.6));
}

/* Add connection lines between cards */
.social-card:hover::before {
  opacity: 0.8;
  transition-duration: 1000ms;
}

.social-card:hover::after {
  opacity: 0.9;
  transition-duration: 1200ms;
}

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
</style> 
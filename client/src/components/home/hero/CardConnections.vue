<template>
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
</template>

<script setup lang="ts">
</script>

<style scoped>
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

.animate-point-pulse {
  animation: pointPulse 3s ease-in-out infinite;
}
</style> 
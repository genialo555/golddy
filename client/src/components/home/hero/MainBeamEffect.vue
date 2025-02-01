<template>
  <!-- Main container -->
  <div class="absolute inset-0 z-20">
    <!-- Core beam - sharp purple line -->
    <div class="absolute left-1/2 top-0 h-[900px] w-[2px] bg-violet-500">
      <!-- Widening bottom effect -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] h-[100px]">
        <div class="absolute inset-0 bg-gradient-to-t from-violet-500 to-transparent" 
             style="clip-path: path('M50,0 C50,0 100,15 100,50 C100,85 0,85 0,50 C0,15 50,0 50,0');">
        </div>
      </div>
    </div>
    
    <!-- White outline glow -->
    <div class="absolute left-1/2 top-0 h-[900px] w-[2px] transform-gpu animate-line-pulse">
      <div class="absolute inset-0 bg-white blur-[2px]"></div>
      <div class="absolute inset-0 bg-white blur-[4px]"></div>
      <!-- Widening bottom glow -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] h-[100px]">
        <div class="absolute inset-0 bg-gradient-to-t from-white to-transparent blur-[4px]"
             style="clip-path: path('M50,0 C50,0 100,15 100,50 C100,85 0,85 0,50 C0,15 50,0 50,0');">
        </div>
      </div>
    </div>

    <!-- Outer glow -->
    <div class="absolute left-1/2 top-0 h-[900px] w-[4px] transform-gpu">
      <div class="absolute inset-0 bg-gradient-to-b from-violet-400 via-violet-500 to-transparent blur-[20px]"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-violet-300 via-violet-400 to-transparent blur-[40px]"></div>
      <!-- Widening bottom outer glow -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150px] h-[150px]">
        <div class="absolute inset-0 bg-gradient-to-t from-violet-500/80 to-transparent blur-[60px]"
             style="clip-path: path('M75,0 C75,0 150,20 150,75 C150,130 0,130 0,75 C0,20 75,0 75,0');">
        </div>
      </div>
    </div>

    <!-- Wide glow effect -->
    <div class="absolute left-1/2 top-0 h-[900px] w-[400px] -translate-x-1/2 animate-halo-pulse">
      <div class="absolute inset-0 bg-gradient-radial from-violet-400/50 via-violet-500/30 to-transparent blur-[80px]"></div>
    </div>

    <!-- Primary glow -->
    <div class="absolute left-1/2 top-0 h-[900px] w-[400px] -translate-x-1/2 animate-halo-pulse">
      <div class="absolute inset-0 bg-gradient-radial from-violet-400/80 via-violet-500/50 to-transparent blur-[80px]"></div>
      <div class="absolute inset-0 bg-gradient-radial from-violet-300/60 via-violet-400/40 to-transparent blur-[100px]"></div>
    </div>

    <!-- Wide glow -->
    <div class="absolute left-1/2 top-0 h-[900px] w-[600px] -translate-x-1/2 animate-glow">
      <div class="absolute inset-0 bg-gradient-radial from-violet-500/30 via-purple-500/20 to-transparent blur-[120px]"></div>
    </div>

    <!-- Bottom door glow -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[150px]">
      <div class="absolute inset-0 bg-gradient-to-t from-violet-500/40 to-transparent blur-[100px]"
           style="clip-path: path('M100,0 C100,0 200,25 200,75 C200,125 0,125 0,75 C0,25 100,0 100,0');">
      </div>
    </div>

    <!-- Ambient light -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-radial from-violet-500/10 via-purple-500/5 to-transparent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@keyframes linePulse {
  0%, 100% {
    opacity: 0.5;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes haloPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.3);
  }
}

.animate-line-pulse {
  animation: linePulse 2s ease-in-out infinite;
  transform-origin: center;
  will-change: opacity;
}

.animate-halo-pulse {
  animation: haloPulse 4s ease-in-out infinite;
  transform-origin: center;
  will-change: transform, opacity;
}

.animate-glow {
  animation: glow 10s ease-in-out infinite;
  transform-origin: center;
  will-change: transform, opacity;
}
</style> 


<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Content Creation Section -->
    <section class="relative py-32 min-h-[1000px] bg-white">
      <CreationBackground />
      <ContentCreationSection />
    </section>

    <!-- Other sections... -->
  </div>
</template>

<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import ContentCreationSection from '@/components/home/ContentCreationSection.vue'
import CreationBackground from '@/components/backgrounds/CreationBackground.vue'
</script> 
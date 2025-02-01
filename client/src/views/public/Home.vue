<template>
  <div class="min-h-screen bg-[#0f172a] text-white">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Features Section -->
    <FeaturesSection />

    <!-- Content Creation Section -->
    <ContentCreationSection />

    <!-- CTA Section -->
    <CTASection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '../../components/home/HeroSection.vue'
import FeaturesSection from '../../components/home/FeaturesSection.vue'
import ContentCreationSection from '../../components/home/ContentCreationSection.vue'
import CTASection from '../../components/home/CTASection.vue'
</script>

<style scoped>
@import '../../styles/animations.css';
</style>
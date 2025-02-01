<template>
  <div class="bg-white/5 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-white">Aperçu Financier</h3>
      <div class="text-sm text-gray-400 font-medium">Ce mois-ci</div>
    </div>

    <div class="space-y-6">
      <!-- Sponsored Posts -->
      <div class="space-y-4">
        <div class="flex justify-between items-baseline">
          <h4 class="text-gray-300">Posts Sponsorisés</h4>
          <span class="text-2xl font-bold text-white">{{ formatCurrency(kpis.revenue.sponsoredPosts) }}</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            :style="{ width: getRevenuePercentage('sponsoredPosts') + '%' }"
          ></div>
        </div>
      </div>

      <!-- Affiliate Marketing -->
      <div class="space-y-4">
        <div class="flex justify-between items-baseline">
          <h4 class="text-gray-300">Marketing d'Affiliation</h4>
          <span class="text-2xl font-bold text-white">{{ formatCurrency(kpis.revenue.affiliateMarketing) }}</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            :style="{ width: getRevenuePercentage('affiliateMarketing') + '%' }"
          ></div>
        </div>
      </div>

      <!-- Product Sales -->
      <div class="space-y-4">
        <div class="flex justify-between items-baseline">
          <h4 class="text-gray-300">Ventes de Produits</h4>
          <span class="text-2xl font-bold text-white">{{ formatCurrency(kpis.revenue.productSales) }}</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            :style="{ width: getRevenuePercentage('productSales') + '%' }"
          ></div>
        </div>
      </div>

      <!-- Coaching -->
      <div class="space-y-4">
        <div class="flex justify-between items-baseline">
          <h4 class="text-gray-300">Coaching</h4>
          <span class="text-2xl font-bold text-white">{{ formatCurrency(kpis.revenue.coaching) }}</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            :style="{ width: getRevenuePercentage('coaching') + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-6 border-t border-gray-800">
      <div class="flex justify-between items-baseline">
        <span class="text-gray-300">Revenu Total</span>
        <span class="text-3xl font-bold text-white">{{ formatCurrency(totalRevenue) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KPIFinancier } from '../../types/entities'

const props = defineProps<{
  kpis: KPIFinancier
}>()

const totalRevenue = computed(() => {
  const { sponsoredPosts, affiliateMarketing, productSales, coaching } = props.kpis.revenue
  return sponsoredPosts + affiliateMarketing + productSales + coaching
})

const getRevenuePercentage = (source: keyof KPIFinancier['revenue']) => {
  return (props.kpis.revenue[source] / totalRevenue.value) * 100
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value)
}
</script> 
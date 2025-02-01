<template>
  <Transition name="modal">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/80" @click="$emit('update:modelValue', false)"></div>
      
      <!-- Modal -->
      <div class="relative bg-[#0f172a] rounded-xl border border-gray-800 w-[90vw] h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm border-b border-gray-800">
          <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
          <button @click="$emit('update:modelValue', false)" 
                  class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 pt-16 h-full relative">
          <slot></slot>
          <!-- Contrôles de zoom -->
          <div class="absolute bottom-4 right-4 flex gap-2">
            <button @click="$emit('reset-zoom')" 
                    class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button @click="$emit('download')"
                    class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'reset-zoom': []
  'download': []
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 
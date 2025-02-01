<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div class="h-full" ref="container">
      <div v-for="(dialogue, index) in dialogues" 
           :key="index"
           class="dialogue-text"
           :class="{ 
             'right': dialogue.right,
             'typing-complete': !dialogue.isTyping && dialogue.displayText === dialogue.text
           }"
           :style="{
             top: `${dialogue.top}vh`,
             opacity: isVisible(dialogue.top) ? 1 : 0
           }">
        <span class="typing-text">{{ dialogue.displayText }}</span>
        <span class="cursor" v-if="dialogue.isTyping">|</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const dialogues = ref([
  // Groupe du haut (0-25%)
  { text: "Initialisation de l'IA...", top: 5, right: false, displayText: "", isTyping: false },
  { text: "Chargement des modèles...", top: 10, right: true, displayText: "", isTyping: false },
  { text: "Analyse des données utilisateur...", top: 15, right: false, displayText: "", isTyping: false },
  { text: "Optimisation des paramètres", top: 20, right: true, displayText: "", isTyping: false },
  { text: "Configuration en cours...", top: 25, right: false, displayText: "", isTyping: false },

  // Groupe milieu-haut (25-50%)
  { text: "Analyse du marché en cours...", top: 30, right: true, displayText: "", isTyping: false },
  { text: "Détection des tendances mode", top: 35, right: false, displayText: "", isTyping: false },
  { text: "Calcul de l'engagement : +32%", top: 40, right: true, displayText: "", isTyping: false },
  { text: "Analyse sémantique avancée...", top: 45, right: false, displayText: "", isTyping: false },
  { text: "Adaptation du ton éditorial", top: 50, right: true, displayText: "", isTyping: false },

  // Groupe milieu (50-75%)
  { text: "Génération contenu durable...", top: 55, right: false, displayText: "", isTyping: false },
  { text: "Optimisation SEO : +45% ✨", top: 60, right: true, displayText: "", isTyping: false },
  { text: "Analyse des retours utilisateurs", top: 65, right: false, displayText: "", isTyping: false },
  { text: "Satisfaction client : 98% 🌟", top: 70, right: true, displayText: "", isTyping: false },
  { text: "Vérification cohérence...", top: 75, right: false, displayText: "", isTyping: false },

  // Groupe milieu-bas (75-90%)
  { text: "Tests performance : +45% ✨", top: 80, right: true, displayText: "", isTyping: false },
  { text: "Calibrage des algorithmes...", top: 85, right: false, displayText: "", isTyping: false },
  { text: "Intelligence augmentée : OK", top: 90, right: true, displayText: "", isTyping: false },

  // Groupe du bas (90-100%)
  { text: "Optimisation finale...", top: 93, right: false, displayText: "", isTyping: false },
  { text: "Déploiement réussi ! 🚀", top: 96, right: true, displayText: "", isTyping: false },
  { text: "Système prêt à 100% ✅", top: 98, right: false, displayText: "", isTyping: false },
  { text: "Activation des protocoles IA", top: 115, right: true, displayText: "", isTyping: false }
])

const scrollPosition = ref(0)
const isTyping = ref(false)
const currentDialogueIndex = ref(-1)

const typeText = async (dialogue) => {
  if (isTyping.value) return
  isTyping.value = true
  dialogue.isTyping = true
  const text = dialogue.text
  for (let i = 0; i <= text.length; i++) {
    if (!dialogue.isTyping) break
    dialogue.displayText = text.slice(0, i)
    await new Promise(resolve => setTimeout(resolve, 70))
  }
  await new Promise(resolve => setTimeout(resolve, 500)) // Pause après la frappe
  dialogue.isTyping = false
  isTyping.value = false
  typeNextDialogue()
}

const typeNextDialogue = () => {
  currentDialogueIndex.value++
  if (currentDialogueIndex.value < dialogues.value.length) {
    const nextDialogue = dialogues.value[currentDialogueIndex.value]
    if (isVisible(nextDialogue.top) && nextDialogue.displayText === "") {
      setTimeout(() => typeText(nextDialogue), 1000)
    } else {
      typeNextDialogue()
    }
  }
}

const isVisible = (top) => {
  const threshold = 60
  return (scrollPosition.value + threshold) > top
}

const handleScroll = () => {
  scrollPosition.value = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
  
  // Démarrer l'animation si ce n'est pas déjà fait
  if (currentDialogueIndex.value === -1 && !isTyping.value) {
    typeNextDialogue()
  }
}

const resetTyping = () => {
  isTyping.value = false
  currentDialogueIndex.value = -1
  dialogues.value.forEach(dialogue => {
    dialogue.displayText = ""
    dialogue.isTyping = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  resetTyping()
})
</script>

<style scoped>
.dialogue-text {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(147, 51, 234, 0.5);
  opacity: 0;
  transition: all 0.5s ease-out;
  padding: 0.5rem 1rem;
  left: 2rem;
  text-shadow: 0 0 10px rgba(147, 51, 234, 0.2);
  border-radius: 4px;
  letter-spacing: 0.5px;
  position: relative;
}

.dialogue-text::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(147, 51, 234, 0.2),
    rgba(147, 51, 234, 0.4),
    rgba(147, 51, 234, 0.2),
    transparent
  );
  transform: translateY(-50%);
  filter: blur(4px);
  opacity: 0;
  transition: all 0.5s ease-out;
}

.dialogue-text.typing-complete::before {
  opacity: 1;
  height: 2px;
}

.dialogue-text.typing-complete {
  color: rgba(147, 51, 234, 0.8);
  text-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
}

.dialogue-text.right {
  left: auto;
  right: 2rem;
  text-align: right;
  color: rgba(236, 72, 153, 0.5);
}

.dialogue-text.right::before {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(236, 72, 153, 0.2),
    rgba(236, 72, 153, 0.4),
    rgba(236, 72, 153, 0.2),
    transparent
  );
}

.dialogue-text.right.typing-complete {
  color: rgba(236, 72, 153, 0.8);
  text-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
}

.cursor {
  animation: blink 1s infinite;
  font-weight: bold;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.typing-text {
  white-space: pre;
}
</style> 
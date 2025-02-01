<template>
  <div 
    :class="[
      'hulySplitButton-container',
      size,
      variant,
      { 
        'disabled': disabled,
        'separate': separate,
        'no-focus': noFocus
      }
    ]"
  >
    <button
      class="hulySplitButton-main"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot name="icon" v-if="$slots.icon" />
      <span><slot /></span>
    </button>
    <button
      class="hulySplitButton-second"
      :disabled="disabled"
      @click="$emit('second-click')"
    >
      <slot name="second-icon">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['large', 'medium', 'small', 'extra-small', 'min'].includes(value)
  },
  variant: {
    type: String,
    default: 'secondary',
    validator: (value: string) => ['primary', 'secondary'].includes(value)
  },
  disabled: Boolean,
  separate: Boolean,
  noFocus: Boolean
})

defineEmits(['click', 'second-click'])
</script>

<style lang="scss">
.hulySplitButton-container {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
  border: 1px solid transparent;

  button {
    font-weight: 500;
    font-size: 0.875rem;
    border: none;

    .btn-icon {
      width: var(--spacing-2_5);
      height: var(--spacing-2_5);
    }
  }
  &.no-focus button {
    outline: none;
  }
  &:not(.no-focus) button:focus {
    box-shadow: 0 0 0 2px var(--theme-button-contrast-color);
    outline: 2px solid var(--global-focus-BorderColor);
    outline-offset: 2px;
  }
  button:focus,
  button.pressed {
    z-index: 1;
  }
  .hulySplitButton-main {
    display: flex;
    align-items: center;
    gap: var(--spacing-1);
    min-width: 0;
  }
  .hulySplitButton-second {
    margin: 0;
    padding: 0;

    .btn-icon {
      width: var(--global-min-Size);
      height: var(--global-min-Size);
    }
  }

  &.large {
    height: var(--global-large-Size);

    .hulySplitButton-main {
      padding: 0 var(--spacing-1) 0 var(--spacing-2);
    }
    .hulySplitButton-second {
      width: var(--global-small-Size);
    }
    &.separate .hulySplitButton-main {
      padding: 0 var(--spacing-1_25) 0 var(--spacing-2);
    }
  }
  &.medium {
    height: var(--global-medium-Size);

    .hulySplitButton-main {
      padding: 0 var(--spacing-0_75) 0 var(--spacing-1_5);
    }
    .hulySplitButton-second {
      width: var(--global-small-Size);
    }
    &.separate .hulySplitButton-main {
      padding: 0 var(--spacing-1_25) 0 var(--spacing-1_5);
    }
  }
  &.large,
  &.medium {
    border-radius: var(--medium-BorderRadius);

    button:first-child {
      border-top-left-radius: var(--medium-BorderRadius);
      border-bottom-left-radius: var(--medium-BorderRadius);
    }
    button:last-child {
      border-top-right-radius: var(--medium-BorderRadius);
      border-bottom-right-radius: var(--medium-BorderRadius);
    }
  }
  &.small {
    height: var(--global-small-Size);
    border-radius: var(--small-BorderRadius);

    button:first-child {
      border-top-left-radius: var(--small-BorderRadius);
      border-bottom-left-radius: var(--small-BorderRadius);
    }
    button:last-child {
      border-top-right-radius: var(--small-BorderRadius);
      border-bottom-right-radius: var(--small-BorderRadius);
    }
    .hulySplitButton-main {
      padding: 0 var(--spacing-0_5) 0 var(--spacing-1);
    }
    .hulySplitButton-second {
      width: var(--global-extra-small-Size);
    }
    &.separate .hulySplitButton-main {
      padding: 0 var(--spacing-0_75) 0 var(--spacing-1);
    }
  }
  &.extra-small {
    height: var(--global-extra-small-Size);
    border-radius: var(--extra-small-BorderRadius);

    button:first-child {
      border-top-left-radius: var(--extra-small-BorderRadius);
      border-bottom-left-radius: var(--extra-small-BorderRadius);
    }
    button:last-child {
      border-top-right-radius: var(--extra-small-BorderRadius);
      border-bottom-right-radius: var(--extra-small-BorderRadius);
    }
    button .btn-icon {
      width: var(--spacing-1_5);
      height: var(--spacing-1_5);
    }
    .hulySplitButton-main {
      padding: 0 var(--spacing-0_75);
    }
    .hulySplitButton-second {
      width: var(--global-min-Size);
    }
  }
  &.min {
    height: var(--global-min-Size);
    border-radius: var(--min-BorderRadius);

    button:first-child {
      border-top-left-radius: var(--min-BorderRadius);
      border-bottom-left-radius: var(--min-BorderRadius);
    }
    button:last-child {
      border-top-right-radius: var(--min-BorderRadius);
      border-bottom-right-radius: var(--min-BorderRadius);
    }
    button {
      font-size: .75rem;

      .btn-icon {
        width: var(--spacing-1_25);
        height: var(--spacing-1_25);
      }
    }
    .hulySplitButton-main {
      padding: 0 var(--spacing-0_5);
    }
    .hulySplitButton-second {
      width: var(--global-min-Size);
    }
  }
  &.small .hulySplitButton-main,
  &.extra-small .hulySplitButton-main,
  &.min .hulySplitButton-main {
    gap: var(--spacing-0_5);
  }

  &.secondary {
    background-color: var(--button-secondary-BackgroundColor);
    border-color: var(--button-secondary-BorderColor);

    button {
      color: var(--button-subtle-LabelColor);

      &:enabled {
        &:hover {
          background-color: var(--button-secondary-hover-BackgroundColor);
        }
        &:active,
        &.pressed,
        &.pressed:hover {
          background-color: var(--button-secondary-active-BackgroundColor);
        }
      }
    }
    &:not(.disabled):focus-within {
      border-color: var(--theme-button-focused-border);
    }
    &.disabled {
      background-color: var(--button-disabled-BackgroundColor);
      
      button {
        color: var(--button-disabled-LabelColor);
        background-color: transparent;
      }
    }
  }

  &.primary {
    color: var(--button-accent-LabelColor);
    background-color: var(--button-primary-BackgroundColor);
    border-color: var(--button-primary-BorderColor);

    button {
      color: var(--button-accent-LabelColor);
      
      &:enabled {
        &:hover {
          background-color: var(--button-primary-hover-BackgroundColor);
        }
        &:active,
        &.pressed,
        &.pressed:hover {
          background-color: var(--button-primary-active-BackgroundColor);
        }
      }
    }
    &:not(.disabled):focus-within {
      border-color: var(--theme-button-focused-border);
    }
    &.disabled {
      background-color: var(--button-disabled-BackgroundColor);
      
      button {
        color: var(--button-disabled-LabelColor);
        background-color: transparent;
      }
    }
  }

  &.disabled {
    border-color: transparent;
    
    button {
      cursor: not-allowed;

      .btn-icon {
        color: var(--button-disabled-IconColor);
      }
    }
  }

  &.separate {
    .hulySplitButton-second {
      position: relative;

      &::after {
        position: absolute;
        content: '';
        top: 20%;
        left: -0.5px;
        width: 1px;
        height: 60%;
        opacity: 0.2;
      }
    }
    &.secondary .hulySplitButton-second::after {
      background-color: var(--button-subtle-LabelColor);
    }
    &.primary .hulySplitButton-second::after {
      background-color: var(--button-accent-LabelColor);
    }
    &:focus-within .hulySplitButton-second::after {
      content: none;
    }
  }
}
</style> 
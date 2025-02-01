<template>
  <button 
    :class="[
      'hulyButton',
      size,
      variant,
      {
        'round': round,
        'iconOnly': iconOnly,
        'disabled': disabled,
        'loading': loading,
        'pressed': pressed,
        'inheritFont': inheritFont,
        'type-button': !iconOnly,
        'type-button-icon': iconOnly
      }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="$slots.icon" class="icon">
      <slot name="icon" />
    </span>
    <span v-if="!iconOnly">
      <slot />
    </span>
  </button>
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
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'tertiary', 'negative'].includes(value)
  },
  round: Boolean,
  iconOnly: Boolean,
  disabled: Boolean,
  loading: Boolean,
  pressed: Boolean,
  inheritFont: Boolean
})

defineEmits(['click'])
</script>

<style lang="scss">
.hulyButton {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  gap: var(--spacing-1);
  border: 1px solid transparent;

  &:not(:disabled, .disabled, .loading) { cursor: pointer; }
  &.inheritFont { font: inherit; }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--spacing-2_5);
    height: var(--spacing-2_5);
  }
  span { white-space: nowrap; }

  &:focus {
    outline: 2px solid var(--global-focus-BorderColor);
    outline-offset: 2px;
  }

  &.type-button-icon { padding: 0; }

  &.large {
    height: var(--global-large-Size);
    border-radius: var(--medium-BorderRadius);

    &.round { border-radius: var(--large-BorderRadius); }
    &.type-button:not(.iconOnly) { padding: 0 var(--spacing-2); }
    &.iconOnly,
    &.type-button-icon { width: var(--global-large-Size); }
  }

  &.medium {
    height: var(--global-medium-Size);
    border-radius: var(--medium-BorderRadius);

    &.round { border-radius: var(--large-BorderRadius); }
    &.type-button:not(.iconOnly) { padding: 0 var(--spacing-2); }
    &.iconOnly,
    &.type-button-icon { width: var(--global-medium-Size); }
  }

  &.small {
    height: var(--global-small-Size);
    gap: var(--spacing-0_5);
    border-radius: var(--small-BorderRadius);

    &.round { border-radius: var(--large-BorderRadius); }
    &.type-button:not(.iconOnly) { padding: 0 var(--spacing-1); }
    &.iconOnly,
    &.type-button-icon { width: var(--global-small-Size); }
  }

  &.extra-small {
    height: var(--global-extra-small-Size);
    border-radius: var(--extra-small-BorderRadius);

    &.round { border-radius: var(--large-BorderRadius); }
    &.type-button:not(.iconOnly) { padding: 0 var(--spacing-1); }
    &.iconOnly,
    &.type-button-icon { width: var(--global-extra-small-Size); }
  }

  &.min {
    height: var(--global-min-Size);
    border: 0;
    border-radius: var(--min-BorderRadius);
  }

  &:disabled:not(.loading),
  &.disabled:not(.loading) {
    border-color: transparent;
    cursor: not-allowed;

    .icon { color: var(--button-disabled-IconColor); }
    span { color: var(--button-disabled-LabelColor); }
  }

  &.primary {
    border-color: var(--button-primary-BorderColor);
    background-color: var(--button-primary-BackgroundColor);

    .icon { color: var(--button-accent-IconColor); }
    span { color: var(--button-accent-LabelColor); }

    &:not(.disabled, :disabled):hover { background-color: var(--button-primary-hover-BackgroundColor); }
    &:not(.disabled, :disabled):active,
    &.pressed:not(.disabled, :disabled) { background-color: var(--button-primary-active-BackgroundColor); }
    &:disabled:not(.loading),
    &.disabled:not(.loading) { background-color: var(--button-disabled-BackgroundColor); }
    &.loading {
      background-color: var(--button-primary-active-BackgroundColor);
      span { color: var(--button-primary-loading-LabelColor); }
    }
  }

  &.secondary {
    border-color: var(--button-secondary-BorderColor);
    background-color: var(--button-secondary-BackgroundColor);

    .icon { color: var(--button-subtle-IconColor); }
    span { color: var(--button-subtle-LabelColor); }

    &:not(.disabled, :disabled):hover { background-color: var(--button-secondary-hover-BackgroundColor); }
    &:not(.disabled, :disabled):active,
    &.pressed:not(.disabled, :disabled) { background-color: var(--button-secondary-active-BackgroundColor); }
    &:disabled:not(.loading),
    &.disabled:not(.loading) { background-color: var(--button-disabled-BackgroundColor); }
    &.loading {
      background-color: var(--button-secondary-active-BackgroundColor);
      span { color: var(--button-disabled-LabelColor); }
    }
  }

  &.tertiary {
    border-color: transparent;
    background-color: transparent;

    &:not(.inheritColor) .icon { color: var(--button-subtle-IconColor); }
    &.inheritColor {
      color: inherit;
      .icon { color: currentColor; }
    }
    span { color: var(--button-subtle-LabelColor); }

    &:not(.disabled, :disabled):hover { background-color: var(--button-tertiary-hover-BackgroundColor); }
    &:not(.disabled, :disabled):active,
    &.pressed:not(.disabled, :disabled) { background-color: var(--button-tertiary-active-BackgroundColor); }
    &.loading {
      background-color: var(--button-tertiary-active-BackgroundColor);
      span { color: var(--button-disabled-LabelColor); }
    }
  }

  &.negative {
    border-color: var(--button-negative-BorderColor);
    background-color: var(--button-negative-BackgroundColor);

    .icon { color: var(--button-accent-IconColor); }
    span { color: var(--button-accent-LabelColor); }

    &:not(.disabled, :disabled):hover { background-color: var(--button-negative-hover-BackgroundColor); }
    &:not(.disabled, :disabled):active,
    &.pressed:not(.disabled, :disabled) { background-color: var(--button-negative-active-BackgroundColor); }
    &:disabled:not(.loading),
    &.disabled:not(.loading) { background-color: var(--button-disabled-BackgroundColor); }
    &.loading {
      background-color: var(--button-negative-active-BackgroundColor);
      span { color: var(--button-negative-loading-LabelColor); }
    }
  }
}
</style> 
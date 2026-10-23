<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    variant?: 'solid' | 'beige' | 'outline' | 'ghost'
    size?: 'md' | 'sm'
    block?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { to: '', variant: 'solid', size: 'md', block: false, type: 'button', disabled: false },
)

const isLink = computed(() => props.to !== '')
</script>

<template>
  <NuxtLink
    v-if="isLink"
    :to="to"
    :class="[$style.button, $style[size], $style[variant], { [$style.block]: block }]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="[$style.button, $style[size], $style[variant], { [$style.block]: block }]"
  >
    <slot />
  </button>
</template>

<style module lang="scss">
@use 'tools' as *;

.button {
  display: inline-flex;
  gap: var(--fs-space-1);
  align-items: center;
  justify-content: center;
  border: rem(1) solid transparent;
  border-radius: var(--fs-radius-pill);
  font-family: var(--fs-font-sans);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    @include fs-focus-ring;
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      transform: translateY(rem(-1));
    }
  }
}

.md {
  min-height: rem(48);
  padding: var(--fs-space-1) var(--fs-space-3);
  @include fs-text;

  @include from-desktop {
    min-height: rem(52);
    padding: var(--fs-space-2) var(--fs-space-4);
  }
}

.sm {
  min-height: rem(38);
  padding: rem(6) var(--fs-space-2);
  @include fs-text-sm;
}

.solid {
  color: var(--fs-color-white);
  background-color: var(--fs-color-black);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: #1f1f1f;
    }
  }
}

.beige {
  color: var(--fs-color-black);
  background-color: var(--fs-color-beige);

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: #c8b98f;
    }
  }
}

.outline {
  border-color: var(--fs-color-black);
  color: var(--fs-color-black);
  background-color: transparent;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      color: var(--fs-color-white);
      background-color: var(--fs-color-black);
    }
  }
}

.ghost {
  color: inherit;
  background-color: transparent;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: var(--fs-color-light);
    }
  }
}

.block {
  width: 100%;
}
</style>

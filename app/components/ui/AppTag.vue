<script setup lang="ts">
withDefaults(
  defineProps<{
    accent?: 'pink' | 'orange' | 'cyan' | 'beige' | 'light' | 'outline'
    size?: 'md' | 'sm'
  }>(),
  { accent: 'light', size: 'md' },
)
</script>

<template>
  <span :class="[$style.tag, $style[size]]" :data-accent="accent">
    <slot />
  </span>
</template>

<style module lang="scss">
@use 'tools' as *;

.tag {
  display: inline-flex;
  flex-shrink: 0;
  gap: rem(6);
  align-items: center;
  justify-content: center;
  border-radius: var(--fs-radius-pill);
  font-family: var(--fs-font-sans);
  font-weight: 500;
  white-space: nowrap;
  background-color: var(--fs-color-light);

  &[data-accent='pink'] {
    background-color: var(--fs-color-pink);
  }

  &[data-accent='orange'] {
    background-color: var(--fs-color-orange);
  }

  &[data-accent='cyan'] {
    background-color: var(--fs-color-cyan);
  }

  &[data-accent='beige'] {
    background-color: var(--fs-color-beige);
  }

  &[data-accent='outline'] {
    background-color: transparent;
    box-shadow: inset 0 0 0 rem(1) var(--fs-color-line);
  }
}

.md {
  min-height: rem(28);
  padding: rem(4) rem(12);
  @include fs-text-sm;
}

.sm {
  min-height: rem(24);
  padding: rem(2) rem(10);
  @include fs-text-xs;
}
</style>

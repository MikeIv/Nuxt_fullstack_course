<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'

const progress = useProgressStore()

onMounted(() => {
  progress.load()
})
</script>

<template>
  <div :class="$style.root">
    <a :class="$style.skip" href="#content">Перейти к содержанию</a>
    <LayoutAppHeader />
    <main id="content" :class="$style.main" tabindex="-1">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.main {
  position: relative;
  z-index: 0;
  flex: 1 1 auto;
  padding-bottom: var(--fs-space-section);

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.skip {
  position: absolute;
  top: rem(-100);
  left: var(--fs-space-2);
  z-index: z('toast');
  padding: var(--fs-space-1) var(--fs-space-2);
  border-radius: var(--fs-radius-pill);
  @include fs-text-sm;
  color: var(--fs-color-white);
  background-color: var(--fs-color-black);
  transition: top 0.15s ease;

  &:focus-visible {
    top: var(--fs-space-2);
    @include fs-focus-ring;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skip {
    transition: none;
  }
}
</style>

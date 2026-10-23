<script setup lang="ts">
withDefaults(
  defineProps<{
    side?: 'left' | 'right'
    tone?: 'ornament' | 'beige'
  }>(),
  { side: 'right', tone: 'ornament' },
)
</script>

<template>
  <div :class="$style.frame" :data-side="side" aria-hidden="true">
    <div :class="$style.pattern" :data-tone="tone" />
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.frame {
  position: absolute;
  left: 0;
  z-index: z('pattern');
  width: 100%;
  height: rem(520);
  overflow: hidden;
  pointer-events: none;
  inset-block-start: rem(-160);

  @include from-desktop {
    height: rem(760);
    inset-block-start: rem(-220);
  }
}

.pattern {
  position: absolute;
  right: rem(-180);
  width: rem(420);
  height: rem(420);
  background-color: var(--fs-color-ornament);
  inset-block-start: 0;
  mask: url('/images/pattern.svg') center / contain no-repeat;

  &[data-tone='beige'] {
    background-color: var(--fs-color-beige);
  }

  @include from-tablet {
    right: rem(-120);
    width: rem(720);
    height: rem(720);
  }

  @include from-desktop {
    right: rem(-40);
    width: rem(1000);
    height: rem(1000);
  }
}

.frame[data-side='left'] .pattern {
  right: auto;
  left: rem(-180);

  @include from-tablet {
    left: rem(-120);
  }

  @include from-desktop {
    left: rem(-40);
  }
}
</style>

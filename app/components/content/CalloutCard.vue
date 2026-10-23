<script setup lang="ts">
export type CalloutVariant = 'idea' | 'note' | 'warning'

const props = withDefaults(
  defineProps<{
    variant?: CalloutVariant
    html?: string
    title?: string
  }>(),
  { variant: 'note', html: '', title: '' },
)

const LABEL: Record<CalloutVariant, string> = {
  idea: 'Идея',
  note: 'Заметка',
  warning: 'Где ломается',
}
</script>

<template>
  <aside :class="$style.callout" :data-variant="variant">
    <p :class="$style.label">{{ title || LABEL[props.variant] }}</p>
    <div v-if="html" :class="$style.body" v-html="html" />
    <div v-else :class="$style.body">
      <slot />
    </div>
  </aside>
</template>

<style module lang="scss">
@use 'tools' as *;

.callout {
  margin: 0 0 var(--fs-space-3);
  padding: var(--fs-space-3);
  border-radius: var(--fs-radius-xl);
  background-color: var(--fs-color-surface-muted);

  &[data-variant='idea'] {
    color: var(--fs-color-light);
    background-color: var(--fs-color-black);
  }

  &[data-variant='warning'] {
    border-left: rem(3) solid var(--fs-color-coral);
  }

  &[data-variant='note'] {
    border-left: rem(3) solid var(--fs-color-beige);
  }
}

.label {
  margin: 0 0 var(--fs-space-1);
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.callout[data-variant='idea'] .label {
  color: var(--fs-color-beige);
}

.body {
  @include fs-text;
  line-height: var(--fs-text-read-line);

  :deep(p),
  p {
    margin: 0 0 var(--fs-space-1);

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(code),
  code {
    padding: rem(1) rem(5);
    border-radius: var(--fs-radius-sm);
    font-family: var(--fs-font-mono);
    font-size: 0.9em;
    background-color: rgb(1 1 1 / 6%);
  }
}
</style>

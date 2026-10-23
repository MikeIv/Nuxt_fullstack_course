<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text: string
    label?: string
    /** Тёмная кнопка — для блока кода на тёмном фоне. */
    variant?: 'light' | 'dark'
  }>(),
  { label: 'Скопировать', variant: 'light' },
)

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
  } catch {
    return
  }

  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <button
    :class="[$style.button, $style[variant]]"
    type="button"
    :aria-label="copied ? 'Скопировано' : label"
    @click="copy"
  >
    <UiAppIcon :name="copied ? 'check' : 'copy'" :size="14" />
    <span :class="$style.text">{{ copied ? 'Скопировано' : label }}</span>
  </button>
</template>

<style module lang="scss">
@use 'tools' as *;

.button {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
  padding: rem(5) rem(10);
  border: 0;
  border-radius: var(--fs-radius-pill);
  @include fs-text-xs;
  font-weight: 500;
  cursor: pointer;

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.light {
  color: var(--fs-color-black);
  background-color: rgb(255 255 255 / 8%);

  @media (hover: hover) {
    &:hover {
      background-color: rgb(255 255 255 / 16%);
    }
  }
}

.dark {
  color: var(--fs-color-white);
  background-color: rgb(0 0 0 / 6%);
}

.text {
  @include from-mobile {
    display: inline;
  }
}
</style>

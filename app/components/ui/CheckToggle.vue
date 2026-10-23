<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function onChange(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return

  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label :class="$style.row" :data-checked="props.modelValue || undefined">
    <input
      :class="$style.input"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span :class="$style.box" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
        <path d="M4 12.5 9.5 18 20 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span :class="$style.text">
      <span :class="$style.label">{{ label }}</span>
      <span v-if="description" :class="$style.description">{{ description }}</span>
    </span>
  </label>
</template>

<style module lang="scss">
@use 'tools' as *;

.row {
  display: flex;
  gap: var(--fs-space-2);
  align-items: flex-start;
  padding: var(--fs-space-2);
  border: rem(1) solid var(--fs-color-line);
  border-radius: var(--fs-radius-xl);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      border-color: var(--fs-color-black);
    }
  }

  &:focus-within {
    @include fs-focus-ring;
  }

  &[data-checked] {
    border-color: var(--fs-color-black);
    background-color: var(--fs-color-surface-muted);
  }
}

.input {
  @include fs-visually-hidden;
}

.box {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: rem(24);
  height: rem(24);
  margin-top: rem(2);
  border: rem(1) solid var(--fs-color-black);
  border-radius: rem(7);
  color: transparent;
  background-color: transparent;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  svg {
    width: rem(16);
    height: rem(16);
  }
}

.row[data-checked] .box {
  color: var(--fs-color-white);
  background-color: var(--fs-color-black);
}

.text {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  min-width: 0;
}

.label {
  @include fs-text-sm;
  font-weight: 500;
}

.description {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}
</style>

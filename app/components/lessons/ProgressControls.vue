<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'

const props = defineProps<{ slug: string }>()

const progress = useProgressStore()

const entry = computed(() => progress.lessons[props.slug])

const items = computed(() => [
  {
    field: 'read' as const,
    label: 'Прочитан',
    description: 'Идея и схема понятны без возврата к тексту',
    value: entry.value?.read ?? false,
  },
  {
    field: 'practice' as const,
    label: 'Практика сделана',
    description: 'Шаги урока выполнены в проекте',
    value: entry.value?.practice ?? false,
  },
  {
    field: 'rule' as const,
    label: 'Правило в работе',
    description: 'Проверил, что правило соблюдается в коде',
    value: entry.value?.rule ?? false,
  },
])

function onToggle(field: 'read' | 'practice' | 'rule', value: boolean) {
  progress.mark(props.slug, field, value)
}
</script>

<template>
  <section :class="$style.block" aria-label="Отметки урока">
    <h2 :class="$style.title">Мой прогресс</h2>
    <div :class="$style.list">
      <UiCheckToggle
        v-for="item in items"
        :key="item.field"
        :model-value="item.value"
        :label="item.label"
        :description="item.description"
        @update:model-value="onToggle(item.field, $event)"
      />
    </div>
  </section>
</template>

<style module lang="scss">
@use 'tools' as *;

.block {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.title {
  margin: 0;
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}
</style>

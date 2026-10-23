<script setup lang="ts">
import type { LessonSource } from '#shared/types/lesson'

defineProps<{ sources: LessonSource[] }>()
</script>

<template>
  <section id="sources" :class="$style.block" aria-labelledby="sources-title">
    <h2 id="sources-title" :class="$style.title">Источники</h2>
    <p :class="$style.note">
      Проверены при подготовке курса: ссылки открывались, а не подбирались по памяти.
    </p>

    <ul :class="$style.list">
      <li v-for="source in sources" :key="source.url" :class="$style.item">
        <a :href="source.url" :class="$style.link" target="_blank" rel="noopener noreferrer">
          <span :class="$style.label">{{ source.label }}</span>
          <UiAppIcon name="external" :size="13" />
        </a>
        <UiStatusPill v-if="source.verified" status="done" label="проверен" :class="$style.badge" />
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
@use 'tools' as *;

.block {
  padding-top: var(--fs-space-3);
  border-top: rem(1) solid var(--fs-color-line);
}

.title {
  margin: 0 0 rem(4);
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.note {
  margin: 0 0 var(--fs-space-2);
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.list {
  display: flex;
  flex-direction: column;
  gap: rem(4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  gap: var(--fs-space-1);
  align-items: center;
  justify-content: space-between;
}

.label {
  color: var(--fs-color-gray);
}

.link {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
  @include fs-text-sm;
  font-weight: 400;
  overflow-wrap: anywhere;

  &:hover .label {
    text-decoration: underline;
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.badge {
  flex-shrink: 0;
}
</style>

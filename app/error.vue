<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error.statusCode ?? 500)
const title = computed(() =>
  statusCode.value === 404 ? 'Страница не найдена' : 'Что-то сломалось на сервере',
)
const description = computed(() =>
  statusCode.value === 404
    ? 'Такого урока или раздела нет. Возможно, ссылка устарела.'
    : 'Ошибка пришла с сервера: подробности — в логах или в консоли браузера.',
)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div :class="$style.page">
    <LayoutOrnamentPattern side="right" tone="beige" />

    <div :class="$style.inner">
      <p :class="$style.code">{{ statusCode }}</p>
      <h1 :class="$style.title">{{ title }}</h1>
      <p :class="$style.description">{{ description }}</p>

      <div :class="$style.actions">
        <UiAppButton variant="beige" type="button" @click="goHome">На главную</UiAppButton>
        <UiAppButton to="/lessons" variant="outline" :class="$style.ghost">К урокам</UiAppButton>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.page {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  padding: var(--fs-space-6) var(--fs-grid-margin);
  overflow: clip;
}

.inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  max-width: rem(560);
}

.code {
  margin: 0;
  font-family: var(--fs-font-display);
  font-size: rem(72);
  line-height: 1;
  color: var(--fs-color-beige);
}

.title {
  margin: 0;
  @include fs-h2;
}

.description {
  margin: 0;
  @include fs-text;
  color: var(--fs-color-gray);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  margin-top: var(--fs-space-1);
}

.ghost {
  border-color: var(--fs-color-line);
}
</style>

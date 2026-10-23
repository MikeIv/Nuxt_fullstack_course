<script setup lang="ts">
import { arcAccent, formatNumber } from '~/utils/course'
import type { Arc } from '#shared/types/lesson'

const props = defineProps<{
  arc: Arc
  /** Сколько уроков арки закрыто (прочитано). */
  done: number
}>()

const accent = computed(() => arcAccent(props.arc.id))
const total = computed(() => props.arc.lessons.length)
const start = computed(() => props.arc.lessons[0])
</script>

<template>
  <article :class="$style.card">
    <div :class="$style.head">
      <UiAppTag :accent="accent" size="sm">Арка {{ props.arc.id }}</UiAppTag>
      <span :class="$style.counter">{{ formatNumber(done) }} / {{ formatNumber(total) }}</span>
    </div>

    <h3 :class="$style.title">{{ props.arc.title }}</h3>
    <p :class="$style.subtitle">{{ props.arc.subtitle }}</p>

    <ol :class="$style.list">
      <li v-for="lesson in props.arc.lessons" :key="lesson.slug" :class="$style.item">
        <NuxtLink :to="`/lessons/${lesson.slug}`" :class="$style.link">
          <span :class="$style.number">{{ formatNumber(lesson.number) }}</span>
          <span :class="$style.lessonTitle">{{ lesson.title }}</span>
        </NuxtLink>
      </li>
    </ol>

    <div :class="$style.foot">
      <UiProgressBar
        :value="done"
        :max="total"
        :label="`Арка ${props.arc.id}: прочитано ${done} из ${total}`"
      />
      <UiAppButton
        v-if="start"
        :to="`/lessons/${start.slug}`"
        variant="ghost"
        size="sm"
        :class="$style.cta"
      >
        Начать арку
        <UiAppIcon name="arrow-right" :size="14" />
      </UiAppButton>
    </div>
  </article>
</template>

<style module lang="scss">
@use 'tools' as *;

.card {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  height: 100%;
  padding: var(--fs-space-3);
  border-radius: var(--fs-radius-2xl);
  background-color: var(--fs-color-surface);

  @include from-desktop {
    padding: var(--fs-space-4);
  }
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.counter {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.title {
  margin: 0;
  @include fs-h3;
}

.subtitle {
  margin: 0;
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);
}

.list {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  border-bottom: rem(1) solid rgb(1 1 1 / 8%);

  &:last-child {
    border-bottom: 0;
  }
}

.lessonTitle {
  min-width: 0;
}

.link {
  display: flex;
  gap: var(--fs-space-2);
  align-items: baseline;
  padding: rem(7) 0;
  @include fs-text-sm;
  font-weight: 400;

  &:hover .lessonTitle {
    text-decoration: underline;
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.number {
  flex-shrink: 0;
  width: rem(22);
  font-family: var(--fs-font-display);
  color: var(--fs-color-gray);
}

.foot {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin-top: auto;
  padding-top: var(--fs-space-2);
}

.cta {
  align-self: flex-start;
  color: var(--fs-color-black);
}
</style>

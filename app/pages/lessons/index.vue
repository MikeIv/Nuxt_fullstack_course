<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
import { formatDuration } from '~/utils/course'

const progress = useProgressStore()
const { data: index } = await useLessonIndex()

const arcs = computed(() => index.value?.arcs ?? [])
const lessons = computed(() => index.value?.lessons ?? [])
const total = computed(() => lessons.value.length)
const done = computed(() => progress.stats.done)
const next = computed(() => progress.nextLesson(lessons.value))
const totalTime = computed(() => formatDuration(index.value?.totalMinutes ?? 0))

const statusOf = (slug: string) => progress.statusOf(slug)

useSeoMeta({
  title: 'Все уроки',
  description:
    'Двенадцать уроков курса по аркам: сервер внутри Nuxt, данные и доверие, прод-поведение.',
})
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.intro">
      <p :class="$style.eyebrow">Курс · {{ total }} уроков · {{ totalTime }}</p>
      <h1 :class="$style.title">Все уроки</h1>
      <p :class="$style.lead">
        Уроки самостоятельны, но идут по аркам: первая объясняет модель, вторая применяет её к
        данным, третья — к проду. Пропущенный урок ничего не ломает.
      </p>

      <div :class="$style.summary">
        <div :class="$style.summaryText">
          <span :class="$style.summaryValue">{{ done }} / {{ total }}</span>
          <span :class="$style.summaryLabel">закрыто полностью</span>
        </div>
        <UiProgressBar
          :value="done"
          :max="total || 1"
          :label="`Закрыто ${done} из ${total}`"
          :class="$style.summaryBar"
        />
        <UiAppButton v-if="next" :to="`/lessons/${next.slug}`" variant="solid" size="sm">
          Продолжить: {{ next.title }}
          <UiAppIcon name="arrow-right" :size="14" />
        </UiAppButton>
      </div>
    </header>

    <section
      v-for="arc in arcs"
      :key="arc.id"
      :class="$style.arc"
      :aria-labelledby="`arc-${arc.id}`"
    >
      <div :class="$style.arcHead">
        <span :class="$style.arcNumber">Арка {{ arc.id }}</span>
        <h2 :id="`arc-${arc.id}`" :class="$style.arcTitle">{{ arc.title }}</h2>
        <p :class="$style.arcSubtitle">{{ arc.subtitle }}</p>
      </div>

      <div :class="$style.grid">
        <LessonsLessonCard
          v-for="lesson in arc.lessons"
          :key="lesson.slug"
          :lesson="lesson"
          :status="statusOf(lesson.slug)"
        />
      </div>
    </section>
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.page {
  max-width: var(--fs-grid-content-max);
  margin-inline: auto;
  padding: var(--fs-space-5) var(--fs-grid-margin) 0;

  @include from-desktop {
    padding-top: var(--fs-space-6);
  }
}

.intro {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  max-width: rem(760);
}

.eyebrow {
  margin: 0;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.title {
  margin: 0;
  @include fs-h1;
  font-size: rem(36);

  @include from-desktop {
    font-size: rem(64);
  }
}

.lead {
  margin: 0;
  @include fs-text;
  color: var(--fs-color-gray);
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  margin-top: var(--fs-space-2);
  padding-top: var(--fs-space-2);
  border-top: rem(1) solid var(--fs-color-line);
}

.summaryText {
  display: flex;
  flex-direction: column;
  gap: rem(2);
}

.summaryValue {
  font-family: var(--fs-font-display);
  font-size: rem(22);
  line-height: 1;
}

.summaryLabel {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.summaryBar {
  flex: 1 1 rem(160);
  max-width: rem(240);
}

.arc {
  padding-top: var(--fs-space-section);
}

.arcHead {
  display: flex;
  flex-direction: column;
  gap: rem(4);
  margin-bottom: var(--fs-space-3);
}

.arcNumber {
  @include fs-text-xs;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.arcTitle {
  margin: 0;
  @include fs-h2;
  font-size: rem(26);

  @include from-desktop {
    font-size: rem(38);
  }
}

.arcSubtitle {
  margin: 0;
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);
}

.grid {
  display: grid;
  gap: var(--fs-space-2);

  @include from-tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include from-desktop {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--fs-space-3);
  }
}
</style>

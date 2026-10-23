<script setup lang="ts">
import { practiceChecksFor } from '#shared/data/practiceMap'
import { useProgressStore } from '~/stores/progress'
import { formatNumber } from '~/utils/course'
import { checkStatusLabel, checkStatusTone } from '#shared/utils/practiceCheck'
import type { PracticeCheckResult } from '#shared/types/practice'

const progress = useProgressStore()
const { data: index } = await useLessonIndex()
const { payload, pending, failed, refresh } = usePracticeAudit()

const lessons = computed(() => index.value?.lessons ?? [])

onMounted(() => {
  if (!payload.value) void refresh()
})

const auditBySlug = computed(() => {
  const map = new Map<string, Map<string, PracticeCheckResult>>()

  for (const audit of payload.value?.audits ?? []) {
    const results = new Map<string, PracticeCheckResult>()
    for (const result of audit.results) results.set(result.checkId, result)
    map.set(audit.slug, results)
  }

  return map
})

const resultOf = (slug: string, checkId: string) => auditBySlug.value.get(slug)?.get(checkId)

const checksOf = (slug: string) => practiceChecksFor(slug)

const totalChecks = computed(
  () => payload.value?.audits.reduce((sum, audit) => sum + audit.results.length, 0) ?? 0,
)

const doneChecks = computed(() => {
  let done = 0
  for (const audit of payload.value?.audits ?? []) {
    for (const result of audit.results) {
      if (result.status === 'done') done += 1
    }
  }

  return done
})

const isComplete = (slug: string) => {
  const results = auditBySlug.value.get(slug)

  return Boolean(
    results && results.size > 0 && [...results.values()].every((r) => r.status === 'done'),
  )
}

const checkedAt = computed(() => {
  const raw = payload.value?.checkedAt
  if (!raw) return ''

  return new Date(raw).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
})

useSeoMeta({
  title: 'Практика в проекте',
  description: 'Аудит боевого Nuxt-проекта по темам курса: что уже сделано, а что осталось.',
})
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.intro">
      <p :class="$style.eyebrow">Синхронизация с проектом</p>
      <h1 :class="$style.title">Практика в проекте</h1>
      <p :class="$style.lead">
        Курс проверяет реальный код, а не галочки: приложение читает файлы проекта из
        <code>NUXT_PRACTICE_PROJECT_ROOT</code> и показывает, какие темы уже применены. Аудит
        работает только в dev и не отдаёт содержимое файлов — только факты.
      </p>

      <div :class="$style.controls">
        <UiAppButton variant="outline" size="sm" :disabled="pending" type="button" @click="refresh">
          <UiAppIcon name="refresh" :size="14" />
          {{ pending ? 'Сканирую…' : 'Обновить' }}
        </UiAppButton>
        <span v-if="checkedAt" :class="$style.checked">Проверено в {{ checkedAt }}</span>
      </div>
    </header>

    <div v-if="failed" :class="$style.notice" role="status">
      <p :class="$style.noticeTitle">Аудит недоступен</p>
      <p :class="$style.noticeText">
        Ручка есть только в dev-режиме. Проверьте, что приложение запущено через
        <code>pnpm dev</code>, а в <code>.env</code> задан путь к проекту практики.
      </p>
    </div>

    <div v-else-if="payload && !payload.available" :class="$style.notice" role="status">
      <p :class="$style.noticeTitle">Путь к проекту не найден</p>
      <p :class="$style.noticeText">
        Каталог <code>{{ payload.root || 'не задан' }}</code> не читается. Укажите существующий путь
        в <code>NUXT_PRACTICE_PROJECT_ROOT</code>.
      </p>
    </div>

    <template v-else>
      <div :class="$style.summary">
        <div :class="$style.summaryItem">
          <span :class="$style.summaryValue">{{ doneChecks }} / {{ totalChecks }}</span>
          <span :class="$style.summaryLabel">проверок пройдено</span>
        </div>
        <div :class="$style.summaryItem">
          <span :class="$style.summaryValue">{{ payload?.root || '—' }}</span>
          <span :class="$style.summaryLabel">проект практики</span>
        </div>
      </div>

      <ul :class="$style.list">
        <li v-for="lesson in lessons" :key="lesson.slug" :class="$style.item">
          <div :class="$style.itemHead">
            <NuxtLink :to="`/lessons/${lesson.slug}`" :class="$style.itemTitle">
              <span :class="$style.itemNumber">{{ formatNumber(lesson.number) }}</span>
              {{ lesson.title }}
            </NuxtLink>
            <div :class="$style.itemMeta">
              <UiStatusPill :status="progress.statusOf(lesson.slug)" />
              <UiAppTag accent="outline" size="sm">
                {{ isComplete(lesson.slug) ? 'в проекте есть' : 'в проекте частично' }}
              </UiAppTag>
            </div>
          </div>

          <ul v-if="payload" :class="$style.checks">
            <li v-for="check in checksOf(lesson.slug)" :key="check.id" :class="$style.check">
              <span :class="$style.checkTitle">{{ check.title }}</span>
              <UiStatusPill v-if="check.kind === 'manual'" status="none" label="вручную" />
              <UiStatusPill
                v-else
                :status="checkStatusTone(check, resultOf(lesson.slug, check.id)?.status)"
                :label="checkStatusLabel(check, resultOf(lesson.slug, check.id)?.status)"
              />
            </li>
          </ul>
        </li>
      </ul>
    </template>
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

  code {
    padding: rem(1) rem(5);
    border-radius: var(--fs-radius-sm);
    font-family: var(--fs-font-mono);
    font-size: 0.9em;
    background-color: var(--fs-color-surface);
  }
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  margin-top: var(--fs-space-1);
}

.checked {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.notice {
  margin-top: var(--fs-space-4);
  padding: var(--fs-space-3);
  border-radius: var(--fs-radius-xl);
  background-color: var(--fs-color-surface);
}

.noticeTitle {
  margin: 0 0 rem(4);
  @include fs-text-md;
}

.noticeText {
  margin: 0;
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);

  code {
    font-family: var(--fs-font-mono);
    font-size: 0.92em;
  }
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-4);
  margin-top: var(--fs-space-4);
  padding: var(--fs-space-3) 0;
  border-top: rem(1) solid var(--fs-color-line);
  border-bottom: rem(1) solid var(--fs-color-line);
}

.summaryItem {
  display: flex;
  flex-direction: column;
  gap: rem(2);
}

.summaryValue {
  font-family: var(--fs-font-display);
  font-size: rem(20);
  overflow-wrap: anywhere;
}

.summaryLabel {
  @include fs-text-xs;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.list {
  display: flex;
  flex-direction: column;
  margin: var(--fs-space-3) 0 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  padding: var(--fs-space-3) 0;
  border-bottom: rem(1) solid var(--fs-color-line);
}

.itemHead {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
}

.itemTitle {
  display: inline-flex;
  gap: var(--fs-space-1);
  align-items: baseline;
  @include fs-text-md;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.itemNumber {
  font-family: var(--fs-font-display);
  color: var(--fs-color-gray);
}

.itemMeta {
  display: flex;
  gap: var(--fs-space-1);
  align-items: center;
}

.checks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1) var(--fs-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.check {
  display: inline-flex;
  gap: var(--fs-space-1);
  align-items: center;
}

.checkTitle {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}
</style>

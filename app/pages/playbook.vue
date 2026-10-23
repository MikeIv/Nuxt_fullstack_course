<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
import type { ProgressField } from '~/stores/progress'
import { formatNumber } from '~/utils/course'
import type { LessonSummary } from '#shared/types/lesson'

/** Колонки учёта: ключ прогресса и подпись для таблицы и aria-label. */
const FIELDS: { key: ProgressField; label: string }[] = [
  { key: 'read', label: 'Прочитан' },
  { key: 'practice', label: 'Практика' },
  { key: 'rule', label: 'Правило' },
]

const progress = useProgressStore()
const { data: playbook } = await usePlaybook()
const { data: index } = await useLessonIndex()

const rules = computed(() => playbook.value?.rules ?? [])
const lessons = computed(() => index.value?.lessons ?? [])

const lessonByNumber = computed(() => {
  const map = new Map<number, LessonSummary>()
  for (const lesson of lessons.value) map.set(lesson.number, lesson)

  return map
})

const statusOf = (number: number) => {
  const lesson = lessonByNumber.value.get(number)

  return lesson ? progress.statusOf(lesson.slug) : 'none'
}

function toggle(number: number, field: ProgressField, value: boolean) {
  const lesson = lessonByNumber.value.get(number)
  if (!lesson) return

  progress.mark(lesson.slug, field, value)
}

function valueOf(number: number, field: ProgressField) {
  const lesson = lessonByNumber.value.get(number)

  return lesson ? Boolean(progress.lessons[lesson.slug]?.[field]) : false
}

useSeoMeta({
  title: 'Playbook',
  description: 'Двенадцать правил бэкенда Nuxt — то, что стоит перечитать через месяц.',
})
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.intro">
      <p :class="$style.eyebrow">Один файл, ради которого всё остальное</p>
      <h1 :class="$style.title">Playbook</h1>
      <p :class="$style.lead">
        Каждый урок даёт одно правило, и правило работает после того, как сам урок забылся.
        Пропущенный урок ничего не ломает — пропущенное правило обычно ломает прод.
      </p>
      <div :class="$style.actions" data-print="hide">
        <UiAppButton to="/cards" variant="outline" size="sm">Карточки-конспекты</UiAppButton>
        <UiAppButton to="/lessons" variant="ghost" size="sm">
          Все уроки
          <UiAppIcon name="arrow-right" :size="14" />
        </UiAppButton>
      </div>
    </header>

    <ol :class="$style.rules">
      <li v-for="rule in rules" :key="rule.key" :class="$style.rule">
        <div :class="$style.ruleHead">
          <span :class="$style.ruleNumber">{{ formatNumber(rule.number) }}</span>
          <h2 :class="$style.ruleTitle">{{ rule.title }}</h2>
          <UiStatusPill :status="statusOf(rule.number)" />
        </div>

        <p :class="$style.ruleText" v-html="rule.ruleHtml || rule.rule" />

        <NuxtLink
          v-if="lessonByNumber.get(rule.number)"
          :to="`/lessons/${lessonByNumber.get(rule.number)?.slug}`"
          :class="$style.ruleLink"
        >
          Урок {{ formatNumber(rule.number) }}
          <UiAppIcon name="arrow-right" :size="13" />
        </NuxtLink>
      </li>
    </ol>

    <section :class="$style.effort" aria-labelledby="effort-title">
      <h2 id="effort-title" :class="$style.effortTitle">Учёт усилий</h2>
      <p :class="$style.effortLead">
        Три галочки на урок: прочитан, практика сделана, правило в работе. Прогресс хранится
        локально в браузере.
      </p>

      <div :class="$style.tableWrap">
        <table :class="$style.table">
          <caption :class="$style.caption">
            Уроки и отметки
          </caption>
          <thead>
            <tr>
              <th scope="col">Урок</th>
              <th v-for="field in FIELDS" :key="field.key" scope="col">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lesson in lessons" :key="lesson.slug">
              <th scope="row" :class="$style.rowTitle">
                <NuxtLink :to="`/lessons/${lesson.slug}`" :class="$style.rowLink">
                  {{ formatNumber(lesson.number) }} · {{ lesson.title }}
                </NuxtLink>
              </th>
              <td v-for="field in FIELDS" :key="field.key">
                <label :class="$style.cell">
                  <input
                    :class="$style.cellInput"
                    type="checkbox"
                    :checked="valueOf(lesson.number, field.key)"
                    :aria-label="`${lesson.title}: ${field.label}`"
                    @change="
                      toggle(lesson.number, field.key, ($event.target as HTMLInputElement).checked)
                    "
                  />
                  <span :class="$style.cellBox" aria-hidden="true">
                    <UiAppIcon name="check" :size="12" />
                  </span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
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
  font-size: rem(40);

  @include from-desktop {
    font-size: rem(72);
  }
}

.lead {
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

.rules {
  display: flex;
  flex-direction: column;
  margin: var(--fs-space-section) 0 0;
  padding: 0;
  border-top: rem(1) solid var(--fs-color-line);
  list-style: none;
}

.rule {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  padding: var(--fs-space-3) 0;
  border-bottom: rem(1) solid var(--fs-color-line);
}

.ruleHead {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: baseline;
}

.ruleNumber {
  font-family: var(--fs-font-display);
  font-size: rem(20);
  color: var(--fs-color-gray);
}

.ruleTitle {
  flex: 1 1 auto;
  margin: 0;
  @include fs-h3;
  font-size: rem(20);

  @include from-desktop {
    font-size: rem(26);
  }
}

.ruleText {
  max-width: rem(900);
  margin: 0;
  @include fs-text;
  line-height: var(--fs-text-read-line);

  :deep(code) {
    padding: rem(1) rem(5);
    border-radius: var(--fs-radius-sm);
    font-family: var(--fs-font-mono);
    font-size: 0.9em;
    background-color: var(--fs-color-surface);
  }
}

.ruleLink {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
  align-self: flex-start;
  @include fs-text-xs;
  color: var(--fs-color-gray);

  &:hover {
    color: var(--fs-color-black);
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.effort {
  margin-top: var(--fs-space-section);
}

.effortTitle {
  margin: 0 0 rem(4);
  @include fs-h2;
  font-size: rem(28);

  @include from-desktop {
    font-size: rem(40);
  }
}

.effortLead {
  max-width: rem(600);
  margin: 0 0 var(--fs-space-3);
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);
}

.tableWrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  @include fs-text-sm;
}

.caption {
  @include fs-visually-hidden;
}

.table th,
.table td {
  padding: var(--fs-space-1) var(--fs-space-2);
  border-bottom: rem(1) solid var(--fs-color-line);
  text-align: left;
  vertical-align: middle;
}

.table thead th {
  @include fs-text-xs;
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.rowTitle {
  font-weight: 400;
}

.rowLink {
  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.cell {
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:focus-within .cellBox {
    @include fs-focus-ring;
  }
}

.cellInput {
  @include fs-visually-hidden;
}

.cellBox {
  display: grid;
  place-items: center;
  width: rem(22);
  height: rem(22);
  border: rem(1) solid var(--fs-color-line);
  border-radius: rem(6);
  color: transparent;
}

.cellInput:checked + .cellBox {
  border-color: var(--fs-color-black);
  color: var(--fs-color-white);
  background-color: var(--fs-color-black);
}
</style>

<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
import { formatMinutes, practiceLabel } from '~/utils/course'
import { checkStatusLabel, checkStatusTone } from '#shared/utils/practiceCheck'
import type { PracticeCheck, PracticeCheckResult } from '#shared/types/practice'
import type { LessonPractice } from '#shared/types/lesson'

const props = withDefaults(
  defineProps<{
    slug: string
    practice: LessonPractice
    checks?: PracticeCheck[]
    results?: PracticeCheckResult[]
  }>(),
  { checks: () => [], results: () => [] },
)

const progress = useProgressStore()

const entry = computed(() => progress.lessons[props.slug])
const doneSteps = computed(
  () => props.practice.steps.filter((step) => entry.value?.steps?.[String(step.index)]).length,
)
const totalSteps = computed(() => props.practice.steps.length)

const statusById = computed(() => {
  const map = new Map<string, PracticeCheckResult['status']>()
  for (const result of props.results) map.set(result.checkId, result.status)

  return map
})

function toggleStep(index: number, value: boolean) {
  const current = entry.value?.steps?.[String(index)] ?? false
  if (current !== value) progress.toggleStep(props.slug, index)
}
</script>

<template>
  <section id="practice" :class="$style.block" aria-labelledby="practice-title">
    <div :class="$style.head">
      <div>
        <p :class="$style.eyebrow">Практика</p>
        <h2 id="practice-title" :class="$style.title">Попробуй</h2>
      </div>
      <div :class="$style.meta">
        <UiAppTag :accent="'beige'" size="sm">{{ practiceLabel(practice.kind) }}</UiAppTag>
        <span :class="$style.minutes">{{ formatMinutes(practice.minutes) }}</span>
      </div>
    </div>

    <p v-if="totalSteps" :class="$style.counter">
      Отмечено {{ doneSteps }} из {{ totalSteps }} шагов
    </p>

    <ol :class="$style.steps">
      <li
        v-for="step in practice.steps"
        :key="step.index"
        :class="$style.step"
        :data-done="entry?.steps?.[String(step.index)] || undefined"
      >
        <div :class="$style.stepHead">
          <label :class="$style.check">
            <input
              :class="$style.checkInput"
              type="checkbox"
              :checked="Boolean(entry?.steps?.[String(step.index)])"
              :aria-label="`Шаг ${step.index}: ${step.title}`"
              @change="toggleStep(step.index, ($event.target as HTMLInputElement).checked)"
            />
            <span :class="$style.checkBox" aria-hidden="true">
              <UiAppIcon name="check" :size="14" />
            </span>
          </label>
          <p :class="$style.stepTitle">{{ step.title }}</p>
        </div>
        <div class="fs-prose" :class="$style.stepBody" v-html="step.html" />
      </li>
    </ol>

    <div v-if="checks.length" :class="$style.checks">
      <h3 :class="$style.checksTitle">Проверка по проекту</h3>
      <ul :class="$style.checkList">
        <li v-for="check in checks" :key="check.id" :class="$style.checkItem">
          <div :class="$style.checkText">
            <p :class="$style.checkTitle">{{ check.title }}</p>
            <code v-if="check.path" :class="$style.checkPath">{{ check.path }}</code>
            <p v-if="check.note" :class="$style.checkNote">{{ check.note }}</p>
          </div>
          <UiStatusPill
            :status="checkStatusTone(check, statusById.get(check.id))"
            :label="checkStatusLabel(check, statusById.get(check.id))"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<style module lang="scss">
@use 'tools' as *;

.block {
  padding: var(--fs-space-3);
  border-radius: var(--fs-radius-2xl);
  background-color: var(--fs-color-surface);

  @include from-desktop {
    padding: var(--fs-space-4);
  }
}

.head {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
}

.eyebrow {
  margin: 0 0 rem(4);
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.title {
  margin: 0;
  @include fs-h3;
}

.meta {
  display: flex;
  gap: var(--fs-space-1);
  align-items: center;
}

.minutes {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.counter {
  margin: var(--fs-space-1) 0 0;
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  margin: var(--fs-space-3) 0 0;
  padding: 0;
  list-style: none;
}

.step {
  padding: var(--fs-space-2);
  border: rem(1) solid var(--fs-color-line);
  border-radius: var(--fs-radius-xl);
  background-color: var(--fs-color-white);
  transition: border-color 0.15s ease;

  &[data-done] {
    border-color: var(--fs-color-beige);
  }
}

.stepHead {
  display: flex;
  gap: var(--fs-space-1);
  align-items: flex-start;
}

.check {
  display: grid;
  flex-shrink: 0;
  margin-top: rem(1);
  cursor: pointer;

  &:focus-within .checkBox {
    @include fs-focus-ring;
  }
}

.checkInput {
  @include fs-visually-hidden;
}

.checkBox {
  display: grid;
  place-items: center;
  width: rem(24);
  height: rem(24);
  border: rem(1) solid var(--fs-color-black);
  border-radius: rem(7);
  color: transparent;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.checkInput:checked + .checkBox {
  color: var(--fs-color-white);
  background-color: var(--fs-color-black);
}

.stepTitle {
  margin: 0;
  @include fs-text-sm;
  font-weight: 500;
  line-height: 1.4;
}

.stepBody {
  margin-top: var(--fs-space-1);
  padding-left: rem(32);
  font-weight: 400;
  line-height: 1.6;
  @include fs-text-sm;

  :deep(> :last-child) {
    margin-bottom: 0;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: var(--fs-space-1);
  }
}

.checks {
  margin-top: var(--fs-space-4);
  padding-top: var(--fs-space-3);
  border-top: rem(1) solid rgb(1 1 1 / 8%);
}

.checksTitle {
  margin: 0 0 var(--fs-space-2);
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.checkList {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.checkItem {
  display: flex;
  gap: var(--fs-space-2);
  align-items: flex-start;
  justify-content: space-between;
}

.checkText {
  min-width: 0;
}

.checkTitle {
  margin: 0 0 rem(2);
  @include fs-text-sm;
  font-weight: 500;
}

.checkPath {
  display: inline-block;
  padding: rem(1) rem(6);
  border-radius: var(--fs-radius-sm);
  font-family: var(--fs-font-mono);
  font-size: rem(12);
  overflow-wrap: anywhere;
  background-color: rgb(1 1 1 / 6%);
}

.checkNote {
  margin: rem(4) 0 0;
  @include fs-text-xs;
  color: var(--fs-color-gray);
}
</style>

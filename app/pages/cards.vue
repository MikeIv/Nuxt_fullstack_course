<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
import { formatNumber } from '~/utils/course'

const progress = useProgressStore()
const { data: payload } = await useCards()

const cards = computed(() => payload.value?.cards ?? [])

useSeoMeta({
  title: 'Карточки-конспекты',
  description: 'Двенадцать карточек: идея, правило и практика каждого урока на одном экране.',
})
</script>

<template>
  <div :class="$style.page">
    <header :class="$style.intro">
      <p :class="$style.eyebrow">Повторение через месяц</p>
      <h1 :class="$style.title">Карточки</h1>
      <p :class="$style.lead">
        Одна карточка на урок: три строки идеи, правило, тип практики. Если после месяца чтения всё
        вспоминается — курс сделал свою работу.
      </p>
      <UiAppButton to="/playbook" variant="outline" size="sm">Только правила</UiAppButton>
    </header>

    <ul :class="$style.grid">
      <li v-for="card in cards" :key="card.slug" :class="$style.item">
        <NuxtLink :to="`/lessons/${card.slug}`" :class="$style.card">
          <div :class="$style.cardHead">
            <span :class="$style.number">{{ formatNumber(card.number) }}</span>
            <UiStatusPill :status="progress.statusOf(card.slug)" />
          </div>

          <h2 :class="$style.cardTitle">{{ card.title }}</h2>

          <ul :class="$style.bullets">
            <li v-for="bullet in card.bullets" :key="bullet" :class="$style.bullet">
              {{ bullet }}
            </li>
          </ul>

          <p v-if="card.ruleHtml" :class="$style.rule" v-html="card.ruleHtml" />

          <p v-if="card.practice" :class="$style.practice">{{ card.practice }}</p>
        </NuxtLink>
      </li>
    </ul>
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
  align-items: flex-start;
  max-width: rem(720);
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

.grid {
  display: grid;
  gap: var(--fs-space-2);
  margin: var(--fs-space-section) 0 0;
  padding: 0;
  list-style: none;

  @include from-tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include from-desktop {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--fs-space-3);
  }
}

.item {
  display: flex;
}

.card {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--fs-space-2);
  padding: var(--fs-space-3);
  border: rem(1) solid var(--fs-color-line);
  border-radius: var(--fs-radius-2xl);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  @media (hover: hover) {
    &:hover {
      border-color: var(--fs-color-black);
      transform: translateY(rem(-2));
    }
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.number {
  font-family: var(--fs-font-display);
  font-size: rem(22);
  line-height: 1;
  color: var(--fs-color-gray);
}

.cardTitle {
  margin: 0;
  @include fs-h3;
  font-size: rem(19);

  @include from-desktop {
    font-size: rem(22);
  }
}

.bullets {
  display: flex;
  flex-direction: column;
  gap: rem(6);
  margin: 0;
  padding: 0;
  list-style: none;
}

.bullet {
  position: relative;
  padding-left: var(--fs-space-2);
  @include fs-text-xs;
  font-weight: 400;
  line-height: 1.5;
  color: var(--fs-color-gray);

  &::before {
    position: absolute;
    top: rem(7);
    left: 0;
    width: rem(6);
    height: rem(6);
    border-radius: 50%;
    background-color: var(--fs-color-beige);
    content: '';
  }
}

.rule {
  margin: 0;
  padding-top: var(--fs-space-2);
  border-top: rem(1) solid var(--fs-color-line);
  @include fs-text-xs;
  line-height: 1.5;

  :deep(code) {
    padding: 0 rem(4);
    border-radius: var(--fs-radius-sm);
    font-family: var(--fs-font-mono);
    background-color: var(--fs-color-surface);
  }
}

.practice {
  margin: 0;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include fs-text-xs;
}
</style>

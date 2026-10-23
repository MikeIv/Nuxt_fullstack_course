<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
import { formatNumber } from '~/utils/course'

const route = useRoute()
const progress = useProgressStore()
const { data: index } = await useLessonIndex()

const total = computed(() => index.value?.lessons.length ?? 0)
const done = computed(() => progress.stats.done)

const menuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

const links = [
  { to: '/lessons', label: 'Курс' },
  { to: '/playbook', label: 'Playbook' },
  { to: '/cards', label: 'Карточки' },
  { to: '/project', label: 'Проект' },
]

const progressText = computed(() => `${formatNumber(done.value)} / ${formatNumber(total.value)}`)

/** «Курс» активен и на странице урока: раздел — это префикс пути, а не точное совпадение. */
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <header :class="$style.header" data-print="hide">
    <div :class="$style.inner">
      <NuxtLink to="/" :class="$style.logo" aria-label="Бэкенд Nuxt fullstack — на главную">
        <span :class="$style.mark" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="17" fill="none" stroke="currentColor" stroke-width="3" />
            <circle cx="32" cy="32" r="6" fill="currentColor" />
          </svg>
        </span>
        <span :class="$style.wordmark">
          <span :class="$style.wordmarkTop">Бэкенд</span>
          <span :class="$style.wordmarkBottom">Nuxt fullstack</span>
        </span>
      </NuxtLink>

      <nav :class="$style.nav" aria-label="Разделы курса">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="$style.link"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div :class="$style.aside">
        <NuxtLink v-if="total" to="/lessons" :class="$style.progress" title="Прогресс курса">
          <UiProgressBar :value="done" :max="total" :label="`Пройдено ${done} из ${total}`" />
          <span :class="$style.progressText">{{ progressText }}</span>
        </NuxtLink>

        <button
          :class="$style.menuButton"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="course-menu"
          :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'"
          @click="menuOpen = !menuOpen"
        >
          <UiAppIcon :name="menuOpen ? 'close' : 'menu'" :size="20" />
        </button>
      </div>
    </div>

    <div v-if="menuOpen" id="course-menu" :class="$style.panel">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="$style.panelLink"
        :aria-current="isActive(link.to) ? 'page' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
      <p v-if="total" :class="$style.panelProgress">Пройдено {{ done }} из {{ total }}</p>
    </div>
  </header>
</template>

<style module lang="scss">
@use 'tools' as *;

.header {
  position: sticky;
  top: 0;
  z-index: z('header');
  border-bottom: rem(1) solid var(--fs-color-line);
  background-color: var(--fs-color-bg);
}

.inner {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
  max-width: var(--fs-grid-content-max);
  min-height: var(--fs-header-height);
  margin-inline: auto;
  padding-inline: var(--fs-grid-margin);
}

.logo {
  display: inline-flex;
  gap: rem(10);
  align-items: center;

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.mark {
  display: grid;
  place-items: center;
  width: rem(36);
  height: rem(36);
  border-radius: rem(11);
  color: var(--fs-color-beige);
  background-color: var(--fs-color-black);

  svg {
    width: rem(24);
    height: rem(24);
  }
}

.wordmark {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.wordmarkTop {
  @include fs-text-xs;
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.wordmarkBottom {
  font-family: var(--fs-font-display);
  font-size: rem(16);
  white-space: nowrap;
}

.nav {
  display: none;

  @include from-tablet {
    display: flex;
    gap: var(--fs-space-3);
    align-items: center;
  }
}

.link {
  position: relative;
  padding-block: rem(4);
  @include fs-text-sm;

  &::after {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: rem(2);
    background-color: var(--fs-color-black);
    transition: transform 0.15s ease;
    content: '';
    transform: scaleX(0);
    transform-origin: left;
  }

  &:hover::after,
  &.router-link-active::after {
    transform: scaleX(1);
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.aside {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
}

.progress {
  display: none;
  gap: var(--fs-space-1);
  align-items: center;
  min-width: rem(120);

  @include from-mobile {
    display: flex;
  }
}

.progressText {
  @include fs-text-xs;
  color: var(--fs-color-gray);
  white-space: nowrap;
}

.menuButton {
  display: grid;
  place-items: center;
  width: rem(40);
  height: rem(40);
  border: rem(1) solid var(--fs-color-line);
  border-radius: 50%;
  color: var(--fs-color-black);
  background-color: transparent;
  cursor: pointer;

  &:focus-visible {
    @include fs-focus-ring;
  }

  @include from-tablet {
    display: none;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: rem(4);
  padding: var(--fs-space-2) var(--fs-grid-margin) var(--fs-space-3);
  border-top: rem(1) solid var(--fs-color-line);

  @include from-tablet {
    display: none;
  }
}

.panelLink {
  padding: rem(10) 0;
  border-bottom: rem(1) solid var(--fs-color-line);
  @include fs-text;

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.panelProgress {
  margin: var(--fs-space-1) 0 0;
  @include fs-text-xs;
  color: var(--fs-color-gray);
}
</style>

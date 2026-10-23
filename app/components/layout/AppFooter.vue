<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer :class="$style.footer" data-print="hide">
    <div :class="$style.inner">
      <div :class="$style.brand">
        <p :class="$style.title">Бэкенд Nuxt fullstack</p>
        <p :class="$style.about">
          12 уроков про сервер внутри Nuxt: два рантайма, event, данные, кеш и деплой. Прогресс
          хранится локально в браузере.
        </p>
      </div>

      <nav :class="$style.columns" aria-label="Материалы курса">
        <div :class="$style.column">
          <p :class="$style.columnTitle">Курс</p>
          <NuxtLink to="/lessons" :class="$style.link">Все уроки</NuxtLink>
          <NuxtLink to="/project" :class="$style.link">Практика в проекте</NuxtLink>
        </div>
        <div :class="$style.column">
          <p :class="$style.columnTitle">Повторение</p>
          <NuxtLink to="/playbook" :class="$style.link">Playbook</NuxtLink>
          <NuxtLink to="/cards" :class="$style.link">Карточки</NuxtLink>
        </div>
      </nav>
    </div>

    <div :class="$style.bottom">
      <span>{{ year }} · текстовый курс</span>
      <span>Источники — официальная документация Nuxt, Nitro и h3</span>
    </div>
  </footer>
</template>

<style module lang="scss">
@use 'tools' as *;

.footer {
  margin-top: var(--fs-space-section);
  color: var(--fs-color-light);
  background-color: var(--fs-color-black);
  border-start-start-radius: var(--fs-radius-3xl);
  border-start-end-radius: var(--fs-radius-3xl);

  @include from-desktop {
    border-start-start-radius: var(--fs-radius-4xl);
    border-start-end-radius: var(--fs-radius-4xl);
  }
}

.inner {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-4);
  max-width: var(--fs-grid-content-max);
  margin-inline: auto;
  padding: var(--fs-space-6) var(--fs-grid-margin) var(--fs-space-5);

  @include from-desktop {
    flex-direction: row;
    justify-content: space-between;
    padding-block: var(--fs-space-8) var(--fs-space-6);
  }
}

.brand {
  max-width: rem(460);
}

.title {
  margin: 0 0 var(--fs-space-2);
  @include fs-h3;
  color: var(--fs-color-white);
}

.about {
  margin: 0;
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);
}

.columns {
  display: flex;
  gap: var(--fs-space-6);
}

.column {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.columnTitle {
  margin: 0 0 rem(2);
  font-weight: 500;
  color: var(--fs-color-beige);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.link {
  @include fs-text-sm;
  color: var(--fs-color-light);

  &:hover {
    color: var(--fs-color-white);
  }

  &:focus-visible {
    @include fs-focus-ring(var(--fs-color-beige));
  }
}

.bottom {
  display: flex;
  flex-direction: column;
  gap: rem(4);
  max-width: var(--fs-grid-content-max);
  margin-inline: auto;
  padding: var(--fs-space-2) var(--fs-grid-margin) var(--fs-space-4);
  border-top: rem(1) solid rgb(255 255 255 / 12%);
  @include fs-text-xs;
  color: var(--fs-color-gray);

  @include from-tablet {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>

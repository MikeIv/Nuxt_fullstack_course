<script setup lang="ts">
defineProps<{
  code: string
  lang: string
  /** Подсвеченный HTML от shiki; пусто — рендерим исходный код. */
  html: string
}>()
</script>

<template>
  <figure :class="$style.figure">
    <div :class="$style.bar">
      <span :class="$style.lang">
        <UiAppIcon name="terminal" :size="13" />
        {{ lang || 'text' }}
      </span>
      <UiCopyButton :text="code" variant="light" label="Копировать код" />
    </div>
    <div v-if="html" class="fs-codeblock" :class="$style.body" v-html="html" />
    <div v-else class="fs-codeblock" :class="$style.body">
      <pre><code>{{ code }}</code></pre>
    </div>
  </figure>
</template>

<style module lang="scss">
@use 'tools' as *;

.figure {
  margin: 0 0 var(--fs-space-3);
  border-radius: var(--fs-radius-lg);
  background-color: var(--fs-color-code-bg);
  overflow: hidden;
}

.bar {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
  padding: rem(8) rem(10) rem(8) var(--fs-space-2);
  border-bottom: rem(1) solid rgb(255 255 255 / 8%);
  font-weight: 500;
  color: rgb(255 255 255 / 60%);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  @include fs-text-xs;
}

.lang {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
}

.body {
  /* Тема shiki приходит со своим фоном; здесь только скругление снизу. */
  color: var(--fs-color-code-text);
}
</style>

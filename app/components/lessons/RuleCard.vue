<script setup lang="ts">
defineProps<{
  /** Правило с inline-кодом (HTML с сервера). */
  ruleHtml: string
  rule: string
}>()
</script>

<template>
  <section id="rule" :class="$style.card" aria-labelledby="rule-title">
    <div :class="$style.head">
      <p :class="$style.eyebrow">Правило в playbook</p>
      <NuxtLink to="/playbook" :class="$style.all">
        Все правила
        <UiAppIcon name="arrow-right" :size="14" />
      </NuxtLink>
    </div>

    <h2 id="rule-title" :class="$style.srOnly">Правило урока</h2>
    <p :class="$style.rule" v-html="ruleHtml || rule" />
  </section>
</template>

<style module lang="scss">
@use 'tools' as *;

.card {
  padding: var(--fs-space-3);
  border-radius: var(--fs-radius-2xl);
  color: var(--fs-color-light);
  background-color: var(--fs-color-black);

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
  margin-bottom: var(--fs-space-2);
}

.eyebrow {
  margin: 0;
  color: var(--fs-color-beige);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.all {
  display: inline-flex;
  gap: rem(6);
  align-items: center;
  @include fs-text-xs;
  color: var(--fs-color-light);

  &:hover {
    color: var(--fs-color-white);
  }

  &:focus-visible {
    @include fs-focus-ring(var(--fs-color-beige));
  }
}

.rule {
  margin: 0;
  font-family: var(--fs-font-display);
  font-size: rem(20);
  line-height: 1.35;

  @include from-desktop {
    font-size: rem(28);
  }

  :deep(code) {
    padding: rem(2) rem(6);
    border-radius: var(--fs-radius-sm);
    font-family: var(--fs-font-mono);
    font-size: 0.82em;
    color: var(--fs-color-black);
    background-color: var(--fs-color-beige);
  }
}

.srOnly {
  @include fs-visually-hidden;
}
</style>

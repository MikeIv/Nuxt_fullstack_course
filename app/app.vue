<script setup lang="ts">
const { public: runtimePublic } = useRuntimeConfig()

/** Дублируем публичное имя приложения в `<title>`-шаблон и OG: страницы задают только свои части. */
useHead({
  titleTemplate: (title?: string) =>
    title ? `${title} — ${runtimePublic.appName}` : runtimePublic.appName,
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

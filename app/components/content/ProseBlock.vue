<script setup lang="ts">
const props = defineProps<{ html: string }>()

/** Содержимое — HTML, собранный на сервере из собственных markdown-файлов курса. */
const content = computed(() => props.html)
</script>

<template>
  <div class="fs-prose" v-html="content" />
</template>

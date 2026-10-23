<script setup lang="ts">
const props = defineProps<{ code: string }>()

/** SSR-разметку схемы не рендерим: mermaid живёт только в браузере. */
const root = ref<HTMLElement | null>(null)
const markup = ref('')
const failed = ref(false)
const uid = computed(() => `diagram-${useId().replace(/[^\w-]/g, '')}`)

let observer: IntersectionObserver | null = null
let started = false

async function renderDiagram() {
  if (started) return
  started = true

  try {
    const mermaid = (await import('mermaid')).default

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Roboto, system-ui, sans-serif',
      themeVariables: {
        background: '#ffffff',
        primaryColor: '#f3f2ed',
        primaryBorderColor: '#010101',
        primaryTextColor: '#010101',
        lineColor: '#767676',
        secondaryColor: '#d3c59f',
        tertiaryColor: '#fbfaf9',
        fontSize: '14px',
      },
    })

    const { svg } = await mermaid.render(uid.value, props.code)
    markup.value = svg
  } catch {
    failed.value = true
  }
}

onMounted(() => {
  if (!root.value) return

  if (typeof IntersectionObserver === 'undefined') {
    void renderDiagram()

    return
  }

  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer?.disconnect()
      observer = null
      void renderDiagram()
    }
  })

  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <figure ref="root" :class="$style.figure">
    <div :class="$style.body">
      <div v-if="markup" :class="$style.canvas" v-html="markup" />
      <p v-else-if="failed" :class="$style.failure">Схема не отрисовалась — ниже её исходник.</p>
      <pre v-if="!markup" :class="$style.source"><code>{{ code }}</code></pre>
    </div>
    <figcaption :class="$style.caption">
      <span>Схема из урока</span>
      <UiCopyButton :text="code" label="Копировать mermaid" />
    </figcaption>
  </figure>
</template>

<style module lang="scss">
@use 'tools' as *;

.figure {
  margin: 0 0 var(--fs-space-3);
  border: rem(1) solid var(--fs-color-line);
  border-radius: var(--fs-radius-xl);
  background-color: var(--fs-color-surface-muted);
  overflow: hidden;
}

.body {
  display: grid;
  place-items: center;
  padding: var(--fs-space-2);
  overflow-x: auto;

  @include from-tablet {
    padding: var(--fs-space-3);
  }
}

.canvas {
  width: 100%;
  max-width: rem(900);
  text-align: center;

  :deep(svg) {
    width: 100%;
    max-width: 100%;
    height: auto;
  }
}

.failure {
  margin: 0 0 var(--fs-space-1);
  @include fs-text-sm;
  color: var(--fs-color-status-partial);
}

.source {
  width: 100%;
  margin: 0;
  color: var(--fs-color-gray);
  white-space: pre-wrap;
  @include fs-mono;
}

.caption {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
  padding: rem(8) rem(10) rem(8) var(--fs-space-2);
  border-top: rem(1) solid var(--fs-color-line);
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background-color: var(--fs-color-white);
  @include fs-text-xs;
}
</style>

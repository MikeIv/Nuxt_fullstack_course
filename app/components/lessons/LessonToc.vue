<script setup lang="ts">
import type { TocItem } from '#shared/types/lesson'

const props = defineProps<{ toc: TocItem[] }>()

const activeId = ref('')
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (typeof IntersectionObserver === 'undefined') return

  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      const first = visible[0]
      if (first?.target.id) activeId.value = first.target.id
    },
    { rootMargin: '-96px 0px -70% 0px', threshold: [0, 1] },
  )

  for (const item of props.toc) {
    const element = document.getElementById(item.id)
    if (element) observer.observe(element)
  }
}

onMounted(() => {
  setupObserver()
})

/** Оглавление приходит вместе с уроком: следим за ссылкой на массив, а не за глубиной. */
watch(
  () => props.toc,
  () => {
    nextTick(setupObserver)
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <nav :class="$style.toc" aria-label="Содержание урока">
    <details :class="$style.details" open>
      <summary :class="$style.summary">
        Содержание
        <UiAppIcon name="arrow-up" :size="14" :class="$style.summaryIcon" />
      </summary>

      <ol :class="$style.list">
        <li v-for="item in toc" :key="item.id" :class="$style.item" :data-level="item.level">
          <a
            :href="`#${item.id}`"
            :class="[$style.link, { [$style.active]: activeId === item.id }]"
          >
            {{ item.title }}
          </a>
        </li>
      </ol>
    </details>
  </nav>
</template>

<style module lang="scss">
@use 'tools' as *;

.toc {
  @include from-desktop {
    position: sticky;
    top: calc(var(--fs-header-height) + var(--fs-space-3));
  }
}

.summaryIcon {
  transition: transform 0.15s ease;

  @include from-desktop {
    display: none;
  }
}

.details {
  border-top: rem(1) solid var(--fs-color-line);
  border-bottom: rem(1) solid var(--fs-color-line);

  &[open] .summaryIcon {
    transform: rotate(180deg);
  }

  @include from-desktop {
    border-bottom: 0;
  }
}

.summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fs-space-2) 0;
  font-weight: 500;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  list-style: none;
  @include fs-text-sm;

  &::-webkit-details-marker {
    display: none;
  }

  &:focus-visible {
    @include fs-focus-ring;
  }

  @include from-desktop {
    padding-top: 0;
    pointer-events: none;
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  margin: 0;
  padding: 0 0 var(--fs-space-2);
  list-style: none;

  @include from-desktop {
    padding-bottom: 0;
  }
}

.link {
  display: block;
  padding: rem(4) 0 rem(4) var(--fs-space-2);
  border-left: rem(2) solid transparent;
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: var(--fs-color-black);
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.item[data-level='3'] .link {
  padding-left: var(--fs-space-3);
  @include fs-text-xs;
}

.active {
  font-weight: 500;
  color: var(--fs-color-black);
  border-left-color: var(--fs-color-black);
}
</style>

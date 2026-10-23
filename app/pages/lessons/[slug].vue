<script setup lang="ts">
import { practiceChecksFor } from '#shared/data/practiceMap'
import type { LessonDetail } from '#shared/types/lesson'

import { useProgressStore } from '~/stores/progress'
import { formatMinutes, formatNumber, practiceLabel } from '~/utils/course'

const route = useRoute()
const slug = String(route.params.slug ?? '')

const requested = await useLessonDetail(slug)

if (!requested.data.value) {
  throw createError({
    statusCode: requested.error.value?.statusCode ?? 404,
    statusText: 'Урок не найден',
    fatal: true,
  })
}

const lesson = computed<LessonDetail>(() => requested.data.value as LessonDetail)

const { data: index } = await useLessonIndex()
const progress = useProgressStore()

const allLessons = computed(() => index.value?.lessons ?? [])
const prev = computed(
  () => allLessons.value.find((item) => item.number === lesson.value.number - 1) ?? null,
)
const next = computed(
  () => allLessons.value.find((item) => item.number === lesson.value.number + 1) ?? null,
)
const status = computed(() => progress.statusOf(slug))

const checks = computed(() => practiceChecksFor(slug))
const { payload: audit, refresh: refreshAudit } = usePracticeAudit()
const auditResults = computed(
  () => audit.value?.audits.find((item) => item.slug === slug)?.results ?? [],
)

onMounted(() => {
  if (!audit.value) void refreshAudit()
})

useSeoMeta({
  title: `${formatNumber(lesson.value.number)}. ${lesson.value.title}`,
  description: lesson.value.idea[0] ?? lesson.value.rule,
})
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.breadcrumb">
      <NuxtLink to="/lessons" :class="$style.crumb">Курс</NuxtLink>
      <span :class="$style.crumbSep" aria-hidden="true">/</span>
      <span :class="$style.crumbCurrent">Урок {{ formatNumber(lesson.number) }}</span>
    </div>

    <div :class="$style.layout">
      <aside :class="$style.aside" data-print="hide">
        <LessonsLessonToc :toc="lesson.toc" />

        <div :class="$style.asideMeta">
          <dl :class="$style.metaList">
            <div>
              <dt :class="$style.metaKey">Арка</dt>
              <dd :class="$style.metaValue">{{ lesson.arc }} из 3</dd>
            </div>
            <div>
              <dt :class="$style.metaKey">Практика</dt>
              <dd :class="$style.metaValue">
                {{ practiceLabel(lesson.practiceKind) }} · {{ formatMinutes(lesson.minutes) }}
              </dd>
            </div>
            <div>
              <dt :class="$style.metaKey">Статус</dt>
              <dd :class="$style.metaValue">
                <UiStatusPill :status="status" />
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      <article :class="$style.article">
        <header :class="$style.header">
          <div :class="$style.headerTags">
            <UiAppTag
              :accent="lesson.arc === 1 ? 'pink' : lesson.arc === 2 ? 'orange' : 'cyan'"
              size="sm"
            >
              Арка {{ lesson.arc }}
            </UiAppTag>
            <UiAppTag accent="beige" size="sm">{{ practiceLabel(lesson.practiceKind) }}</UiAppTag>
            <span :class="$style.headerMeta">{{ formatMinutes(lesson.minutes) }}</span>
          </div>

          <h1 :class="$style.title">{{ lesson.title }}</h1>
          <p :class="$style.lessonNumber">Урок {{ formatNumber(lesson.number) }} из 12</p>
        </header>

        <ContentCalloutCard v-if="lesson.idea.length" variant="idea" title="Идея в трёх строках">
          <ul :class="$style.ideaList">
            <li v-for="line in lesson.idea" :key="line">{{ line }}</li>
          </ul>
        </ContentCalloutCard>

        <div class="fs-prose" :class="$style.body">
          <template v-for="(block, position) in lesson.blocks" :key="position">
            <ContentProseBlock v-if="block.type === 'prose'" :html="block.html" />
            <component :is="`h${block.level}`" v-else-if="block.type === 'heading'" :id="block.id">
              {{ block.title }}
            </component>
            <ContentCodeBlock
              v-else-if="block.type === 'code'"
              :code="block.code"
              :lang="block.lang"
              :html="block.html"
            />
            <ContentMermaidDiagram v-else-if="block.type === 'diagram'" :code="block.code" />
            <ContentCalloutCard
              v-else-if="block.type === 'callout'"
              :variant="block.variant"
              :html="block.html"
            />
            <div v-else-if="block.type === 'table'" class="fs-prose" v-html="block.html" />
          </template>
        </div>

        <div :class="$style.midGrid">
          <LessonsPracticeBlock
            :slug="slug"
            :practice="lesson.practice"
            :checks="checks"
            :results="auditResults"
          />
          <LessonsProgressControls :slug="slug" />
        </div>

        <LessonsRuleCard v-if="lesson.rule" :rule="lesson.rule" :rule-html="lesson.ruleHtml" />

        <LessonsSourcesList v-if="lesson.sources.length" :sources="lesson.sources" />

        <div data-print="hide">
          <LessonsLessonNav :prev="prev" :next="next" />
        </div>
      </article>
    </div>
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.page {
  max-width: var(--fs-grid-content-max);
  margin-inline: auto;
  padding: var(--fs-space-3) var(--fs-grid-margin) 0;

  @include from-desktop {
    padding-top: var(--fs-space-4);
  }
}

.breadcrumb {
  display: flex;
  gap: rem(6);
  align-items: center;
  margin-bottom: var(--fs-space-3);
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include fs-text-xs;
}

.crumb {
  &:hover {
    color: var(--fs-color-black);
  }

  &:focus-visible {
    @include fs-focus-ring;
  }
}

.crumbSep {
  color: var(--fs-color-line);
}

.crumbCurrent {
  color: var(--fs-color-black);
}

.layout {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);

  @include from-desktop {
    display: grid;
    grid-template-columns: rem(260) minmax(0, 1fr);
    gap: var(--fs-space-6);
    align-items: start;
  }
}

.aside {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);

  @include from-desktop {
    grid-row: 1;
  }
}

.asideMeta {
  display: none;

  @include from-desktop {
    display: block;
    padding-top: var(--fs-space-2);
    border-top: rem(1) solid var(--fs-color-line);
  }
}

.metaList {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
}

.metaKey {
  @include fs-text-xs;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metaValue {
  margin: 0;
  @include fs-text-sm;
}

.article {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-4);
  min-width: 0;
  max-width: rem(820);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.headerTags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  align-items: center;
}

.headerMeta {
  @include fs-text-xs;
  color: var(--fs-color-gray);
}

.title {
  margin: 0;
  @include fs-h1;
  font-size: rem(32);
  line-height: 1.02;

  @include from-tablet {
    font-size: rem(44);
  }

  @include from-desktop {
    font-size: rem(56);
  }
}

.lessonNumber {
  margin: 0;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.ideaList {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.body {
  display: flex;
  flex-direction: column;

  :deep(> h2:first-child),
  :deep(> h3:first-child) {
    margin-top: 0;
  }
}

.midGrid {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}
</style>

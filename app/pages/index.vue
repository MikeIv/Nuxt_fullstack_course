<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
import { formatDuration } from '~/utils/course'

const progress = useProgressStore()
const { data: index } = await useLessonIndex()

const lessons = computed(() => index.value?.lessons ?? [])
const arcs = computed(() => index.value?.arcs ?? [])
const total = computed(() => lessons.value.length)
const done = computed(() => progress.stats.done)
const next = computed(() => progress.nextLesson(lessons.value))
const startTo = computed(() => (next.value ? `/lessons/${next.value.slug}` : '/lessons'))
const startLabel = computed(() =>
  progress.stats.read > 0 || done.value > 0 ? 'Продолжить курс' : 'Начать курс',
)
const totalTime = computed(() => formatDuration(index.value?.totalMinutes ?? 0))

const arcDone = (arcId: number) =>
  lessons.value.filter((lesson) => lesson.arc === arcId && progress.lessons[lesson.slug]?.read)
    .length

useSeoMeta({
  title: 'Курс: серверная часть Nuxt',
  description:
    'Двенадцать уроков про бэкенд Nuxt: два рантайма, event, слои fetch, ошибки, валидация, база, сессия, кеш, storage, задачи и деплой.',
})
</script>

<template>
  <div :class="$style.page">
    <section :class="$style.hero">
      <LayoutOrnamentPattern tone="beige" side="right" />

      <div :class="$style.heroInner">
        <UiAppTag accent="outline" size="sm">Текстовый курс · {{ total }} уроков</UiAppTag>

        <h1 :class="$style.title">
          Бэкенд<br />
          Nuxt fullstack
        </h1>

        <p :class="$style.lead">
          Не про «как сделать API за пять минут», а про то, что происходит под капотом: где
          исполняется код, кто владеет контекстом запроса, как не отдать чужие данные через кеш и
          что меняется при деплое на другой рантайм.
        </p>

        <div :class="$style.actions">
          <UiAppButton :to="startTo" variant="beige">
            {{ startLabel }}
            <UiAppIcon name="arrow-right" :size="16" />
          </UiAppButton>
          <UiAppButton to="/playbook" variant="outline" :class="$style.ghostButton">
            Все правила
          </UiAppButton>
        </div>

        <dl :class="$style.stats">
          <div :class="$style.stat">
            <dt :class="$style.statLabel">Три арки</dt>
            <dd :class="$style.statValue">модель · данные · прод</dd>
          </div>
          <div :class="$style.stat">
            <dt :class="$style.statLabel">Чтение</dt>
            <dd :class="$style.statValue">{{ totalTime }}</dd>
          </div>
          <div :class="$style.stat">
            <dt :class="$style.statLabel">Прогресс</dt>
            <dd :class="$style.statValue">{{ done }} из {{ total }}</dd>
          </div>
        </dl>

        <div :class="$style.progress">
          <UiProgressBar
            :value="done"
            :max="total || 1"
            variant="dark"
            :label="`Пройдено ${done} из ${total}`"
          />
        </div>
      </div>
    </section>

    <section :class="$style.section" aria-labelledby="arcs-title">
      <div :class="$style.sectionHead">
        <h2 id="arcs-title" :class="$style.h2">Три арки</h2>
        <p :class="$style.sectionLead">
          Сервер Nuxt понимается в три слоя: сначала <em>где</em> исполняется код, потом
          <em>чем</em> управляем, потом <em>как</em> он себя ведёт в проде. Прыжок сразу в кеш без
          слоя рантаймов даёт рецепты без модели.
        </p>
      </div>

      <div :class="$style.arcs">
        <LessonsArcCard v-for="arc in arcs" :key="arc.id" :arc="arc" :done="arcDone(arc.id)" />
      </div>
    </section>

    <section :class="$style.section" aria-labelledby="how-title">
      <div :class="$style.howCard">
        <div :class="$style.howIntro">
          <h2 id="how-title" :class="$style.h2">Как читать</h2>
          <p :class="$style.sectionLead">
            Один урок — 10–20 минут чтения и 10–15 минут практики. Практика делается в вашем
            проекте: отдельный репозиторий не нужен.
          </p>
        </div>

        <ol :class="$style.howList">
          <li :class="$style.howItem">
            <span :class="$style.howNumber">01</span>
            <div>
              <p :class="$style.howTitle">Идея, схема, код</p>
              <p :class="$style.howText">
                Каждый урок открывается тремя строками: если они понятны, остальное — детали.
              </p>
            </div>
          </li>
          <li :class="$style.howItem">
            <span :class="$style.howNumber">02</span>
            <div>
              <p :class="$style.howTitle">Практика в своём проекте</p>
              <p :class="$style.howText">
                Шаги урока отмечаются галочками, а часть проверок приложение смотрит по файлам
                проекта напрямую.
              </p>
            </div>
          </li>
          <li :class="$style.howItem">
            <span :class="$style.howNumber">03</span>
            <div>
              <p :class="$style.howTitle">Одно правило в playbook</p>
              <p :class="$style.howText">
                То, что стоит перечитать через месяц, когда уроки уже забылись.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section :class="$style.section" aria-labelledby="project-title">
      <div :class="$style.projectCard">
        <div>
          <h2 id="project-title" :class="$style.h3">Практика — в живом проекте</h2>
          <p :class="$style.projectText">
            Курс синхронизирован с фулстек-проектом на Nuxt: приложение проверяет, что из тем уже
            сделано в коде, и показывает, где смотреть.
          </p>
        </div>
        <UiAppButton to="/project" variant="solid">
          Открыть синхронизацию
          <UiAppIcon name="arrow-right" :size="16" />
        </UiAppButton>
      </div>
    </section>
  </div>
</template>

<style module lang="scss">
@use 'tools' as *;

.page {
  padding-top: var(--fs-space-2);
}

/* Hero — чёрная карточка с крупным радиусом снизу, как в дизайн-системе SC. */
.hero {
  position: relative;
  max-width: var(--fs-grid-content-max);
  margin-inline: auto;
  padding: var(--fs-space-6) var(--fs-grid-margin);
  color: var(--fs-color-white);
  background-color: var(--fs-color-black);
  overflow: clip;
  border-end-start-radius: var(--fs-radius-3xl);
  border-end-end-radius: var(--fs-radius-3xl);

  @include from-tablet {
    padding-block: var(--fs-space-7);
  }

  @include from-desktop {
    padding-block: rem(96) rem(88);
    border-end-start-radius: var(--fs-radius-4xl);
    border-end-end-radius: var(--fs-radius-4xl);
  }
}

.heroInner {
  position: relative;
  z-index: z('default');
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
  align-items: flex-start;
  max-width: rem(900);
}

.title {
  margin: 0;
  @include fs-h1;
  font-size: rem(40);

  @include from-mobile {
    font-size: rem(52);
  }

  @include from-tablet {
    font-size: rem(64);
  }

  @include from-desktop {
    font-size: rem(92);
  }
}

.lead {
  max-width: rem(640);
  margin: 0;
  @include fs-text;
  color: var(--fs-color-light-hover);

  @include from-desktop {
    @include fs-text-lg;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  margin-top: var(--fs-space-1);
}

.ghostButton {
  border-color: rgb(255 255 255 / 32%);
  color: var(--fs-color-white);

  @media (hover: hover) {
    &:hover {
      color: var(--fs-color-black);
      background-color: var(--fs-color-white);
    }
  }
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-3) var(--fs-space-5);
  margin: var(--fs-space-2) 0 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: rem(2);
}

.statLabel {
  order: 2;
  color: var(--fs-color-gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  @include fs-text-xs;
}

.statValue {
  order: 1;
  margin: 0;
  font-family: var(--fs-font-display);
  font-size: rem(18);
  color: var(--fs-color-beige);
}

.progress {
  width: 100%;
  max-width: rem(420);
  margin-top: var(--fs-space-2);
}

.section {
  max-width: var(--fs-grid-content-max);
  margin-inline: auto;
  padding: var(--fs-space-section) var(--fs-grid-margin) 0;

  @include from-desktop {
    padding-top: rem(96);
  }
}

.sectionHead {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  max-width: rem(760);
  margin-bottom: var(--fs-space-4);
}

.h2 {
  margin: 0;
  @include fs-h2;
}

.h3 {
  margin: 0 0 var(--fs-space-1);
  @include fs-h3;
}

.sectionLead {
  margin: 0;
  @include fs-text;
  color: var(--fs-color-gray);

  em {
    font-style: normal;
    color: var(--fs-color-black);
  }
}

.arcs {
  display: grid;
  gap: var(--fs-space-2);

  @include from-tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include from-desktop {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--fs-space-3);
  }
}

.howCard {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-4);
  padding: var(--fs-space-4);
  border-radius: var(--fs-radius-3xl);
  background-color: var(--fs-color-surface);

  @include from-desktop {
    flex-direction: row;
    gap: var(--fs-space-6);
    padding: var(--fs-space-6);
  }
}

.howIntro {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);

  @include from-desktop {
    flex: 0 1 rem(420);
  }
}

.howList {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--fs-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.howItem {
  display: flex;
  gap: var(--fs-space-2);
  align-items: flex-start;
  padding-bottom: var(--fs-space-3);
  border-bottom: rem(1) solid rgb(1 1 1 / 8%);

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
}

.howNumber {
  flex-shrink: 0;
  font-family: var(--fs-font-display);
  font-size: rem(22);
  line-height: 1;
  color: var(--fs-color-beige);
}

.howTitle {
  margin: 0 0 rem(4);
  @include fs-text-md;
}

.howText {
  margin: 0;
  @include fs-text-sm;
  font-weight: 400;
  color: var(--fs-color-gray);
}

.projectCard {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
  align-items: flex-start;
  padding: var(--fs-space-4);
  border: rem(1) solid var(--fs-color-black);
  border-radius: var(--fs-radius-3xl);

  @include from-desktop {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: var(--fs-space-5) var(--fs-space-6);
  }
}

.projectText {
  max-width: rem(620);
  margin: 0;
  @include fs-text;
  color: var(--fs-color-gray);
}
</style>

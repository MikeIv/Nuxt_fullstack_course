# Курс «Бэкенд Nuxt fullstack» — PROJECT

Постоянный контекст для агента (Cursor / DS Harness). Обновлять при смене этапа, стека или процесса.

## Назначение

Интерактивное приложение к текстовому курсу из 12 уроков про серверную часть Nuxt.
Читалка уроков по трём аркам, последовательное прохождение с прогрессом, playbook одним
экраном, карточки-конспекты и блок практики, который сверяется с живым проектом
`Olimp_fitnes_landing`. Одним приложением: Nuxt 4.6.2 (SSR), Nitro, Pinia, CSS Modules + SCSS.

**Этап 1 (текущий):** каркас, контент-пайплайн из `class/`, дизайн-система, читалка, прогресс.
**Этап 2:** live-аудит практики по проекту Olimp (`/project`, чек-листы в уроках).
**Этап 3:** полировка — SEO/OG, a11y, печать playbook, состояния ошибок.

## Стек

| Слой | Технология |
| --- | --- |
| Frontend | Nuxt 4.6.2, Vue 3, TypeScript, SSR, CSS Modules + SCSS, Pinia |
| Backend | Nitro (серверные ассеты `class/`, `defineCachedEventHandler`) |
| Контент | markdown-it + markdown-it-anchor (парсинг уроков), shiki (подсветка), mermaid (схемы) |
| Тесты | Vitest (unit — парсер уроков) |
| Lint | ESLint (@nuxt/eslint), Prettier, Stylelint, Husky |
| PM | pnpm 11, Node 26 |

## Ключевые пути

| Путь | Назначение |
| --- | --- |
| `class/`, `research/`, `sources.json` | Источник контента курса — только чтение |
| `app/pages/` | `/`, `/lessons`, `/lessons/[slug]`, `/playbook`, `/cards`, `/project` |
| `app/components/` | `layout`, `home`, `lessons`, `content`, `ui`, `project` |
| `app/stores/progress.ts` | Прогресс: три флага на урок + localStorage |
| `app/assets/styles/` | Токены `--fs-*`, миксины `from-*`, база (перенос из `SC_Shelkovskiy`) |
| `server/utils/lessonParser.ts` | Разбор `lesson.md` → `LessonDetail` |
| `server/api/` | `lessons`, `lessons/[slug]`, `playbook`, `practice/scan` (dev) |
| `shared/types/`, `shared/data/` | Общие контракты и карта практики |
| `.planning/` | brief (вход), plan (волны), state (выход волны) |

## Команды

```bash
pnpm install
pnpm dev            # dev-сервер
pnpm typecheck | verify | build | lint:all | test
pnpm rules:sync     # правила .cursor/rules → AGENTS.md + .dsh/skills
```

## Источники стиля и каркаса

- Каркас и процесс — шаблон `D:\_WEB\_Work\_NUXT4_Template`.
- Дизайн-система — `D:\_WEB\_Work\Grand\SC_Shelkovskiy` (палитра, Actay + Roboto, сетка,
  радиусы, орнамент).
- Практика — `D:\_WEB\_Work\Grand\Olimp_fitnes_landing` (`NUXT_PRACTICE_PROJECT_ROOT`).

## Процесс

- Класс задачи определяет агент (`S` / `M` / `L` / `XL`), фазы — Discuss → Plan (L+) → Execute → Verify.
- Волна = 1–3 задачи; между волнами — `.planning/state.md` («Ручка у», «Файлы волны»).
- Коммит — только по слову «коммить», сообщения полностью на английском.
- `.planning/{brief,plan,state}.md` — сессионные, в git не хранятся (шаблоны остаются).

## Ограничения для агента

- Не менять `class/`, `research/`, `sources.json` без отдельной просьбы.
- Не отключать SSR, не менять `srcDir`, ESLint/Husky pipeline, брейкпоинты и массовые
  `--fs-*` без запроса.
- API только через `useApi` / `useApiFetch` / `serverApi`; ошибки — `createError`.
- Стили — токены `--fs-*`, mobile-first; hex и сырые `font-size` в секциях не хардкодить.
- Чужой каталог (Olimp) читается только в dev и только по путям из `shared/data/practiceMap.ts`.
- Минимальный diff, без рефакторинга за пределами задачи.

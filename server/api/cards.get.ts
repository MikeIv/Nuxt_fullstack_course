/**
 * `GET /api/cards` — карточки-конспекты всех уроков из `class/cards.md`.
 * Кеш — `routeRules` в проде; в dev его нет, чтобы правки `cards.md` были видны сразу.
 */
export default defineEventHandler(async () => {
  const source = (await useStorage('assets:class').getItem<string>('cards.md')) ?? ''

  return parseCards(source)
})

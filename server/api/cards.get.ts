/**
 * `GET /api/cards` — карточки-конспекты всех уроков из `class/cards.md`.
 */
export default defineCachedEventHandler(
  async () => {
    const source = (await useStorage('assets:class').getItem<string>('cards.md')) ?? ''

    return parseCards(source)
  },
  {
    name: 'cards',
    getKey: () => 'cards',
    maxAge: 60 * 60,
    swr: true,
  },
)

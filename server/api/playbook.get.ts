/**
 * `GET /api/playbook` — все правила курса одним списком: то, что перечитывают через месяц.
 * Кеш — `routeRules` в проде; в dev его нет, чтобы правки `playbook.md` были видны сразу.
 */
export default defineEventHandler(() => getPlaybook())

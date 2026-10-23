/**
 * `GET /api/playbook` — все правила курса одним списком: то, что перечитывают через месяц.
 */
export default defineCachedEventHandler(() => getPlaybook(), {
  name: 'playbook',
  getKey: () => 'playbook',
  maxAge: 60 * 60,
  swr: true,
})

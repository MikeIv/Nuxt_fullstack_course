/**
 * Общие HTTP-типы без доменной логики. Расширяйте под контракт бэкенда.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/** Заготовка под обёртки ответа API (пока не зафиксирован контракт). */
export type UnknownJson = Record<string, unknown>

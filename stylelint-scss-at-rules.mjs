/**
 * Значение `languageOptions.syntax.atRules` для правила `at-rule-no-unknown`:
 * директивы SCSS, которые CSS-список at-rule иначе считает неизвестными.
 * Без этого списка падают `@use`, `@include` и прочие, а с ним опечатки (`@inclde`) ловятся.
 */
export const scssAtRules = {
  use: {},
  forward: {},
  mixin: {},
  include: {},
  extend: {},
  'at-root': {},
  if: {},
  else: {},
  each: {},
  for: {},
  while: {},
  function: {},
  return: {},
  debug: {},
  warn: {},
  error: {},
  content: {},
}

import { propertiesOrderRule } from './stylelint-properties-order.mjs'
import { scssAtRules } from './stylelint-scss-at-rules.mjs'

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-recommended-vue'],
  plugins: ['stylelint-order'],
  /** Единственный источник игнора (раньше дублировался в `.stylelintignore`) */
  ignoreFiles: [
    '**/node_modules/**',
    '.pnpm-store/**',
    '.nuxt/**',
    '.nitro/**',
    '.data/**',
    '.cache/**',
    '.output/**',
    'dist/**',
    'coverage/**',
    '.cursor/**',
    '.idea/**',
    'pnpm-lock.yaml',
  ],
  /** SCSS-директивы для `at-rule-no-unknown` — см. `stylelint-scss-at-rules.mjs` */
  languageOptions: {
    syntax: { atRules: scssAtRules },
  },
  /** SCSS: `//`-комментарии и `#{}` обычный postcss-парсер не разбирает */
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  rules: {
    /** Пустой `<style>` в SFC допустим на этапе заготовки */
    'no-empty-source': null,
    /** BEM / CSS modules — не навязываем паттерн имён классов */
    'selector-class-pattern': null,
    /**
     * CSS-список at-rule не знает SCSS (`@use`, `@include`) — своя часть объявлена
     * в `languageOptions` выше, поэтому опечатки (`@inclde`) ловятся.
     */
    'at-rule-no-unknown': true,
    /** Гибче для вложенности в блоках `<style>` SFC (в т.ч. CSS modules) */
    'rule-empty-line-before': null,
    /** `z('header')` — SCSS-функция слоёв из `variables/_z-index.scss`, а не опечатка */
    'function-no-unknown': [true, { ignoreFunctions: ['z'] }],
    /** …и значение `z-index: z(...)` тоже не проверяем: там имя слоя, а не число */
    'declaration-property-value-no-unknown': [
      true,
      { ignoreProperties: { 'z-index': ['/^z\\(/'] } },
    ],
    /** Порядок CSS-свойств в declaration blocks — см. `stylelint-properties-order.mjs` */
    'order/properties-order': propertiesOrderRule,
  },
}

/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,mjs,cjs,ts}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.vue': ['eslint --fix', 'stylelint --fix --allow-empty-input', 'prettier --write'],
  '*.{css,scss}': ['stylelint --fix --allow-empty-input', 'prettier --write'],
}

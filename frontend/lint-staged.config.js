import path from 'path'

const buildEslintCommand = (filenames) =>
  `eslint ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

const config = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '*.{ts,tsx}': () => 'npx tsc -p tsconfig.app.json --noEmit',
  '*.{js,mjs,jsx,ts,tsx,json,css,md,yaml,yml}': ['prettier --check'],
}

export default config

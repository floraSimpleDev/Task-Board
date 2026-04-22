import path from 'path'

const buildEslintCommand = (filenames) =>
  `eslint ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`

const config = {
  '*.{js,ts}': [buildEslintCommand],
  '*.ts': () => 'npx tsc -p tsconfig.json --noEmit',
  '*.{js,mjs,ts,json,md,yaml,yml}': ['prettier --check'],
}

export default config

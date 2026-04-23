import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

const database_url = process.env.DATABASE_URL

if (!database_url) {
  throw new Error('Missing required env var: DATABASE_URL')
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: database_url,
  },
})

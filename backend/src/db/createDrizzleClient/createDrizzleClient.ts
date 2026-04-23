import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '@/db/schema'

type Database = NodePgDatabase<typeof schema>

interface DrizzleClient {
  db: Database
  pool: Pool
}

const createDrizzleClient = (): DrizzleClient => {
  const database_url = process.env.DATABASE_URL

  if (!database_url) {
    throw new Error('Missing required env var: DATABASE_URL')
  }

  const pool = new Pool({ connectionString: database_url })
  const db = drizzle({ client: pool, schema })

  return { db, pool }
}

export default createDrizzleClient

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '@/db/schema'
import validateEnv from '@/lib/validateEnv'

export type Database = NodePgDatabase<typeof schema>

export type Executor = Database | Parameters<Parameters<Database['transaction']>[0]>[0]

interface DrizzleClient {
  database: Database
  pool: Pool
}

const createDrizzleClient = (): DrizzleClient => {
  const connectionString = validateEnv('DATABASE_URL')

  const pool = new Pool({ connectionString })
  const database = drizzle({ client: pool, schema })

  return { database, pool }
}

export default createDrizzleClient

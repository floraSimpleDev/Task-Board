import { sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { users } from '@/db/schema/users'

const countUsers = async (database: Database): Promise<number> => {
  const [{ total }] = await database
    .select({ total: sql<number>`cast(count(*) as integer)` })
    .from(users)
  return total
}

export default countUsers

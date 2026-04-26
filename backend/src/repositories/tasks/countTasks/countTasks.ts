import { sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { tasks } from '@/db/schema/tasks'

const countTasks = async (database: Database): Promise<number> => {
  const [{ total }] = await database
    .select({ total: sql<number>`cast(count(*) as integer)` })
    .from(tasks)
  return total
}

export default countTasks

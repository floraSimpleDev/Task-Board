import { sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { taskActivities } from '@/db/schema/taskActivities'

const countTaskActivities = async (database: Database): Promise<number> => {
  const [{ total }] = await database
    .select({ total: sql<number>`cast(count(*) as integer)` })
    .from(taskActivities)
  return total
}

export default countTaskActivities

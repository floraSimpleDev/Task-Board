import { sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'

const countBoards = async (database: Database): Promise<number> => {
  const [{ total }] = await database
    .select({ total: sql<number>`cast(count(*) as integer)` })
    .from(boards)
  return total
}

export default countBoards

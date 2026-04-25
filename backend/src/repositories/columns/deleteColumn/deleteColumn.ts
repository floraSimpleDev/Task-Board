import { eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'

const deleteColumn = async (database: Database, columnId: string): Promise<boolean> => {
  const deleted = await database
    .delete(boardColumns)
    .where(eq(boardColumns.id, columnId))
    .returning({ id: boardColumns.id })

  return deleted.length > 0
}

export default deleteColumn

import { eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'

type Column = typeof boardColumns.$inferSelect

interface UpdateColumnInput {
  title?: string
  position?: number
}

const updateColumn = async (
  database: Database,
  columnId: string,
  input: UpdateColumnInput
): Promise<Column | null> => {
  const updated = await database
    .update(boardColumns)
    .set(input)
    .where(eq(boardColumns.id, columnId))
    .returning()

  return updated[0] ?? null
}

export default updateColumn

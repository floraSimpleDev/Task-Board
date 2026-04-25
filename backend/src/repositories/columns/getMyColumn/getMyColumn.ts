import { and, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'
import { boards } from '@/db/schema/boards'

type Column = typeof boardColumns.$inferSelect

const getMyColumn = async (
  database: Database,
  columnId: string,
  userId: string
): Promise<Column | null> => {
  const column = await database.query.boardColumns.findFirst({
    where: eq(boardColumns.id, columnId),
  })

  if (!column) {
    return null
  }

  const board = await database.query.boards.findFirst({
    where: and(eq(boards.id, column.boardId), eq(boards.userId, userId)),
  })

  if (!board) {
    return null
  }

  return column
}

export default getMyColumn

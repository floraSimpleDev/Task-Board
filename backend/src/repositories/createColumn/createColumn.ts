import { sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'

type Column = typeof boardColumns.$inferSelect

interface CreateColumnInput {
  boardId: string
  title: string
}

const createColumn = async (database: Database, input: CreateColumnInput): Promise<Column> => {
  const [column] = await database
    .insert(boardColumns)
    .values({
      boardId: input.boardId,
      title: input.title,
      position: sql<number>`(SELECT COALESCE(MAX(${boardColumns.position}), -1) + 1 FROM ${boardColumns} WHERE ${boardColumns.boardId} = ${input.boardId})`,
    })
    .returning()

  return column
}

export default createColumn

import { and, eq, inArray, sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'

const reorderColumns = async (
  database: Database,
  boardId: string,
  columnIds: string[]
): Promise<boolean> =>
  database.transaction(async (transaction) => {
    const columnsInBoard = await transaction
      .select({ id: boardColumns.id })
      .from(boardColumns)
      .where(and(eq(boardColumns.boardId, boardId), inArray(boardColumns.id, columnIds)))

    if (columnsInBoard.length !== columnIds.length) {
      return false
    }

    await transaction.execute(sql`SET CONSTRAINTS "board_columns_board_id_position_key" DEFERRED`)

    await Promise.all(
      columnIds.map(async (columnId, nextPosition) =>
        transaction
          .update(boardColumns)
          .set({ position: nextPosition })
          .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)))
      )
    )

    return true
  })

export default reorderColumns

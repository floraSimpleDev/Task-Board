import { and, asc, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'
import { boards } from '@/db/schema/boards'
import { tasks } from '@/db/schema/tasks'

type Board = typeof boards.$inferSelect
type Column = typeof boardColumns.$inferSelect
type Task = typeof tasks.$inferSelect

interface ColumnWithTasks extends Column {
  tasks: Task[]
}

interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[]
}

const getMyBoardWithColumns = async (
  database: Database,
  boardId: string,
  userId: string
): Promise<BoardWithColumns | null> => {
  const board = await database.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
    with: {
      columns: {
        orderBy: asc(boardColumns.position),
        with: {
          tasks: {
            orderBy: asc(tasks.position),
          },
        },
      },
    },
  })

  if (!board) {
    return null
  }

  return board
}

export default getMyBoardWithColumns

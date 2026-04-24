import { and, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'
import { boards } from '@/db/schema/boards'
import { tasks } from '@/db/schema/tasks'

type Task = typeof tasks.$inferSelect

const getMyTask = async (
  database: Database,
  taskId: string,
  userId: string
): Promise<Task | null> => {
  const task = await database.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  })

  if (!task) {
    return null
  }

  const column = await database.query.boardColumns.findFirst({
    where: eq(boardColumns.id, task.boardColumnId),
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

  return task
}

export default getMyTask

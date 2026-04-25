import { sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { tasks } from '@/db/schema/tasks'

type Task = typeof tasks.$inferSelect

interface CreateTaskInput {
  boardColumnId: string
  title: string
}

const createTask = async (database: Database, input: CreateTaskInput): Promise<Task> => {
  const [task] = await database
    .insert(tasks)
    .values({
      boardColumnId: input.boardColumnId,
      title: input.title,
      position: sql<number>`(SELECT COALESCE(MAX(${tasks.position}), -1) + 1 FROM ${tasks} WHERE ${tasks.boardColumnId} = ${input.boardColumnId})`,
    })
    .returning()

  return task
}

export default createTask

import { eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { tasks } from '@/db/schema/tasks'

type Task = typeof tasks.$inferSelect

interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: 'P0' | 'P1' | 'P2' | null
  position?: number
  boardColumnId?: string
}

const updateTask = async (
  database: Database,
  taskId: string,
  input: UpdateTaskInput
): Promise<Task | null> => {
  const updated = await database.update(tasks).set(input).where(eq(tasks.id, taskId)).returning()

  return updated[0] ?? null
}

export default updateTask

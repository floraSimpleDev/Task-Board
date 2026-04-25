import { eq } from 'drizzle-orm'

import type { Executor } from '@/db/createDrizzleClient/createDrizzleClient'
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
  executor: Executor,
  taskId: string,
  input: UpdateTaskInput
): Promise<Task | null> => {
  const updated = await executor.update(tasks).set(input).where(eq(tasks.id, taskId)).returning()

  return updated[0] ?? null
}

export default updateTask

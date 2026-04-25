import type { Executor } from '@/db/createDrizzleClient/createDrizzleClient'
import { taskActivities } from '@/db/schema/taskActivities'

type TaskActivity = typeof taskActivities.$inferSelect
type Action = TaskActivity['action']

interface CreateTaskActivityInput {
  taskId: string
  actorId: string
  action: Action
  changes?: unknown
}

const createTaskActivity = async (
  executor: Executor,
  input: CreateTaskActivityInput
): Promise<TaskActivity> => {
  const [activity] = await executor
    .insert(taskActivities)
    .values({
      taskId: input.taskId,
      actorId: input.actorId,
      action: input.action,
      changes: input.changes ?? null,
    })
    .returning()

  return activity
}

export default createTaskActivity

import { desc, eq } from 'drizzle-orm'

import type { Executor } from '@/db/createDrizzleClient/createDrizzleClient'
import { taskActivities } from '@/db/schema/taskActivities'
import { users } from '@/db/schema/users'

interface TaskActivityRow {
  id: string
  taskId: string
  action: 'created' | 'updated' | 'moved'
  changes: unknown
  createdAt: Date
  actorId: string | null
  actorName: string | null
}

const listTaskActivities = async (
  executor: Executor,
  taskId: string,
  limit = 50
): Promise<TaskActivityRow[]> =>
  executor
    .select({
      id: taskActivities.id,
      taskId: taskActivities.taskId,
      action: taskActivities.action,
      changes: taskActivities.changes,
      createdAt: taskActivities.createdAt,
      actorId: taskActivities.actorId,
      actorName: users.userName,
    })
    .from(taskActivities)
    .leftJoin(users, eq(users.id, taskActivities.actorId))
    .where(eq(taskActivities.taskId, taskId))
    .orderBy(desc(taskActivities.createdAt))
    .limit(limit)

export default listTaskActivities

import { and, desc, eq, lt, or, sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'
import { boards } from '@/db/schema/boards'
import { taskActivities } from '@/db/schema/taskActivities'
import { tasks } from '@/db/schema/tasks'
import { users } from '@/db/schema/users'

interface ActivityWithContextRow {
  id: string
  taskId: string
  action: 'created' | 'updated' | 'moved'
  changes: unknown
  createdAt: Date
  actorId: string | null
  actorName: string | null
  taskTitle: string
  boardId: string
  boardTitle: string
}

interface Props {
  cursor?: { createdAt: Date; id: string }
  limit: number
}

const listAllActivitiesWithContext = async (
  database: Database,
  { cursor, limit }: Props
): Promise<ActivityWithContextRow[]> => {
  const cursorCondition = cursor
    ? or(
        lt(taskActivities.createdAt, cursor.createdAt),
        and(eq(taskActivities.createdAt, cursor.createdAt), lt(taskActivities.id, cursor.id))
      )
    : undefined

  return database
    .select({
      id: taskActivities.id,
      taskId: taskActivities.taskId,
      action: taskActivities.action,
      changes: taskActivities.changes,
      createdAt: taskActivities.createdAt,
      actorId: taskActivities.actorId,
      actorName: users.userName,
      taskTitle: tasks.title,
      boardId: boards.id,
      boardTitle: boards.title,
    })
    .from(taskActivities)
    .innerJoin(tasks, eq(tasks.id, taskActivities.taskId))
    .innerJoin(boardColumns, eq(boardColumns.id, tasks.boardColumnId))
    .innerJoin(boards, eq(boards.id, boardColumns.boardId))
    .leftJoin(users, eq(users.id, taskActivities.actorId))
    .where(cursorCondition)
    .orderBy(desc(taskActivities.createdAt), desc(sql`${taskActivities.id}::text`))
    .limit(limit)
}

export default listAllActivitiesWithContext

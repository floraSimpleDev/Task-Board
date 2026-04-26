import { and, desc, eq, lt, or, sql } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boardColumns } from '@/db/schema/boardColumns'
import { boards } from '@/db/schema/boards'
import { tasks } from '@/db/schema/tasks'
import { users } from '@/db/schema/users'

interface TaskWithContextRow {
  id: string
  title: string
  priority: 'P0' | 'P1' | 'P2' | null
  createdAt: Date
  boardId: string
  boardTitle: string
  ownerUserName: string
  ownerEmail: string
}

interface Props {
  cursor?: { createdAt: Date; id: string }
  limit: number
}

const listAllTasksWithContext = async (
  database: Database,
  { cursor, limit }: Props
): Promise<TaskWithContextRow[]> => {
  const cursorCondition = cursor
    ? or(
        lt(tasks.createdAt, cursor.createdAt),
        and(eq(tasks.createdAt, cursor.createdAt), lt(tasks.id, cursor.id))
      )
    : undefined

  return database
    .select({
      id: tasks.id,
      title: tasks.title,
      priority: tasks.priority,
      createdAt: tasks.createdAt,
      boardId: boards.id,
      boardTitle: boards.title,
      ownerUserName: users.userName,
      ownerEmail: users.email,
    })
    .from(tasks)
    .innerJoin(boardColumns, eq(boardColumns.id, tasks.boardColumnId))
    .innerJoin(boards, eq(boards.id, boardColumns.boardId))
    .innerJoin(users, eq(users.id, boards.userId))
    .where(cursorCondition)
    .orderBy(desc(tasks.createdAt), desc(sql`${tasks.id}::text`))
    .limit(limit)
}

export default listAllTasksWithContext

import { and, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'

const deleteBoard = async (
  database: Database,
  boardId: string,
  userId: string
): Promise<boolean> => {
  const deleted = await database
    .delete(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
    .returning({ id: boards.id })

  return deleted.length > 0
}

export default deleteBoard

import { and, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'

type Board = typeof boards.$inferSelect

const getMyBoard = async (
  database: Database,
  boardId: string,
  userId: string
): Promise<Board | null> => {
  const board = await database.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
  })

  if (!board) {
    return null
  }

  return board
}

export default getMyBoard

import { and, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'

type Board = typeof boards.$inferSelect

interface UpdateBoardInput {
  title: string
}

const updateBoard = async (
  database: Database,
  boardId: string,
  userId: string,
  input: UpdateBoardInput
): Promise<Board | null> => {
  const updated = await database
    .update(boards)
    .set(input)
    .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
    .returning()

  return updated.at(0) ?? null
}

export default updateBoard

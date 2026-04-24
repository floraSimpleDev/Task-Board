import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'

type Board = typeof boards.$inferSelect

interface CreateBoardInput {
  userId: string
  title: string
}

const createBoard = async (database: Database, input: CreateBoardInput): Promise<Board> => {
  const [board] = await database.insert(boards).values(input).returning()
  return board
}

export default createBoard

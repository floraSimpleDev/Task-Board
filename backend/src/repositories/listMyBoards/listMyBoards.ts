import { desc, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'

type Board = typeof boards.$inferSelect

const listMyBoards = async (database: Database, userId: string): Promise<Board[]> =>
  database.query.boards.findMany({
    where: eq(boards.userId, userId),
    orderBy: desc(boards.createdAt),
  })

export default listMyBoards

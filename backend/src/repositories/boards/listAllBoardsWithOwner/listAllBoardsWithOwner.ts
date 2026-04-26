import { desc, eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { boards } from '@/db/schema/boards'
import { users } from '@/db/schema/users'

interface BoardWithOwnerRow {
  id: string
  title: string
  createdAt: Date
  ownerId: string
  ownerUserName: string
  ownerEmail: string
}

const listAllBoardsWithOwner = async (database: Database): Promise<BoardWithOwnerRow[]> =>
  database
    .select({
      id: boards.id,
      title: boards.title,
      createdAt: boards.createdAt,
      ownerId: users.id,
      ownerUserName: users.userName,
      ownerEmail: users.email,
    })
    .from(boards)
    .innerJoin(users, eq(users.id, boards.userId))
    .orderBy(desc(boards.createdAt))

export default listAllBoardsWithOwner

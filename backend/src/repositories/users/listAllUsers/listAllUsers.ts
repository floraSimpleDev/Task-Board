import { desc } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { users } from '@/db/schema/users'

type User = typeof users.$inferSelect

const listAllUsers = async (database: Database): Promise<User[]> =>
  database.query.users.findMany({
    orderBy: desc(users.createdAt),
  })

export default listAllUsers

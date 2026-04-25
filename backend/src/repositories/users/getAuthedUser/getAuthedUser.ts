import { eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { users } from '@/db/schema/users'

type User = typeof users.$inferSelect

const getAuthedUser = async (database: Database, authSub: string): Promise<User | null> => {
  const user = await database.query.users.findFirst({
    where: eq(users.authSub, authSub),
  })

  if (!user) {
    return null
  }

  return user
}

export default getAuthedUser

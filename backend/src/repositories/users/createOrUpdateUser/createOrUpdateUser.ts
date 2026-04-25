import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { users } from '@/db/schema/users'

type User = typeof users.$inferSelect

interface CreateUserInput {
  authSub: string
  email: string
  userName: string
}

const createOrUpdateUser = async (database: Database, input: CreateUserInput): Promise<User> => {
  const [user] = await database
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.authSub,
      set: {
        email: input.email,
        userName: input.userName,
      },
    })
    .returning()

  return user
}

export default createOrUpdateUser

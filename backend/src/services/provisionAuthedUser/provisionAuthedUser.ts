import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { users } from '@/db/schema/users'
import createOrUpdateUser from '@/repositories/users/createOrUpdateUser'
import getAuthedUser from '@/repositories/users/getAuthedUser'
import resolveProfile from '@/services/resolveProfile'

type LocalUser = typeof users.$inferSelect

interface Auth0UserInfo {
  email?: string
  name?: string
  nickname?: string
}

interface ProvisionClaims {
  sub: string
  email?: string
  name?: string
  nickname?: string
}

interface ProvisionAuthedUserOptions {
  database: Database
  claims: ProvisionClaims
  fetchUserInfo: () => Promise<Auth0UserInfo>
}

const provisionAuthedUser = async ({
  database,
  claims,
  fetchUserInfo,
}: ProvisionAuthedUserOptions): Promise<LocalUser> => {
  const authedUser = await getAuthedUser(database, claims.sub)
  if (authedUser) {
    return authedUser
  }

  const { email, name: userName } = await resolveProfile({ claims, fetchUserInfo })

  return createOrUpdateUser(database, {
    authSub: claims.sub,
    email,
    userName,
  })
}

export default provisionAuthedUser

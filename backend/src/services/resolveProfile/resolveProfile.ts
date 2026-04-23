interface Auth0UserInfo {
  email?: string
  name?: string
  nickname?: string
}

interface ProfileClaims {
  email?: string
  name?: string
  nickname?: string
}

interface Profile {
  email: string
  name: string
}

interface ResolveProfileOptions {
  claims: ProfileClaims
  fetchUserInfo: () => Promise<Auth0UserInfo>
}

const resolveProfile = async ({
  claims,
  fetchUserInfo,
}: ResolveProfileOptions): Promise<Profile> => {
  const { email: claimEmail, name: claimName, nickname } = claims
  const nameFromClaims = claimName ?? nickname

  if (claimEmail && nameFromClaims) {
    return { email: claimEmail, name: nameFromClaims }
  }

  const userinfo = await fetchUserInfo()
  const email = claimEmail ?? userinfo.email

  if (!email) {
    throw new Error('Could not resolve user email from Auth0 claims or /userinfo')
  }

  const name = nameFromClaims ?? userinfo.name ?? userinfo.nickname ?? email

  return { email, name }
}

export default resolveProfile

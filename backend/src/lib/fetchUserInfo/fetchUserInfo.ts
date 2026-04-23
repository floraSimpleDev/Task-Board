interface Auth0UserInfo {
  email?: string
  name?: string
  nickname?: string
}

const fetchUserInfo = async (auth0Domain: string, token: string): Promise<Auth0UserInfo> => {
  const response = await fetch(`https://${auth0Domain}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Auth0 /userinfo returned ${String(response.status)} ${response.statusText}`)
  }

  return (await response.json()) as Auth0UserInfo
}

export default fetchUserInfo

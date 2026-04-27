import { Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const auth0UserInfoSchema = Type.Object({
  email: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  nickname: Type.Optional(Type.String()),
})

const fetchUserInfo = async (auth0Domain: string, token: string) => {
  const response = await fetch(`https://${auth0Domain}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Auth0 /userinfo returned ${String(response.status)} ${response.statusText}`)
  }

  return Value.Decode(auth0UserInfoSchema, await response.json())
}

export default fetchUserInfo

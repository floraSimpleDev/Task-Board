export interface AccessTokenClaims {
  sub: string
  email?: string
  name?: string
  nickname?: string
  permissions?: string[]
}

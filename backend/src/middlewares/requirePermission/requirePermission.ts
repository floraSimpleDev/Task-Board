import type { preHandlerHookHandler } from 'fastify'

import { ForbiddenError } from '@/lib/httpErrors'

interface AccessTokenClaims {
  sub: string
  email?: string
  name?: string
  nickname?: string
  permissions?: string[]
}

const requirePermission =
  (permission: string): preHandlerHookHandler =>
  (request) => {
    const { permissions = [] } = request.user as AccessTokenClaims
    if (!permissions.includes(permission)) {
      throw new ForbiddenError(`Missing required permission: ${permission}`)
    }
  }

export default requirePermission

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
  (request, _reply, done) => {
    const { permissions = [] } = request.user as AccessTokenClaims
    if (!permissions.includes(permission)) {
      done(new ForbiddenError(`Missing required permission: ${permission}`))
      return
    }
    done()
  }

export default requirePermission

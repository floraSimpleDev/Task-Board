import type { preHandlerHookHandler } from 'fastify'

interface AccessTokenClaims {
  sub: string
  email?: string
  name?: string
  nickname?: string
  permissions?: string[]
}

const requirePermission =
  (permission: string): preHandlerHookHandler =>
  async (request, reply) => {
    const { permissions = [] } = request.user as AccessTokenClaims
    if (!permissions.includes(permission)) {
      void reply.code(403).send({
        error: 'Forbidden',
        message: `Missing required permission: ${permission}`,
      })
    }
  }

export default requirePermission

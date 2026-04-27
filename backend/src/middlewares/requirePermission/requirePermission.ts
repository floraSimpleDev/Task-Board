import { Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import type { preHandlerHookHandler } from 'fastify'

import { ForbiddenError } from '@/lib/httpErrors'

const accessTokenClaimsSchema = Type.Object({
  permissions: Type.Optional(Type.Array(Type.String())),
})

const requirePermission =
  (permission: string): preHandlerHookHandler =>
  (request, _reply, done) => {
    const { permissions = [] } = Value.Decode(accessTokenClaimsSchema, request.user)
    if (!permissions.includes(permission)) {
      done(new ForbiddenError(`Missing required permission: ${permission}`))
      return
    }
    done()
  }

export default requirePermission

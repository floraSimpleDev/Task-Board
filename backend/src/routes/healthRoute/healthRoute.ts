import type { FastifyPluginCallback } from 'fastify'

import healthSchema from '@/types/healthSchema'

const healthRoute: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get('/health', { schema: { response: { 200: healthSchema } } }, () => ({
    status: 'ok',
  }))
  done()
}

export default healthRoute

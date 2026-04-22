import type { FastifyPluginAsync } from 'fastify'

import healthSchema from '@/types/healthSchema'

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', { schema: { response: { 200: healthSchema } } }, async () => ({
    status: 'ok',
  }))
}

export default healthRoute

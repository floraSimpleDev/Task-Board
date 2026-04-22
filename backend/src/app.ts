import Fastify, { type FastifyInstance } from 'fastify'

import healthRoute from '@/routes/healthRoute'

import swagger from './plugins/swagger'

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true })

  await app.register(swagger)

  await app.register(healthRoute)

  return app
}

export default buildApp

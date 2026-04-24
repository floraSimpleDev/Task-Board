import Fastify, { type FastifyInstance } from 'fastify'

import authenticate from '@/plugins/authenticate'
import authZero from '@/plugins/authZero'
import cors from '@/plugins/cors'
import database from '@/plugins/database'
import swagger from '@/plugins/swagger'
import adminRoute from '@/routes/adminRoute'
import healthRoute from '@/routes/healthRoute'
import meRoute from '@/routes/meRoute'

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true })

  await app.register(cors)
  await app.register(swagger)
  await app.register(database)
  await app.register(authZero)
  await app.register(authenticate)

  await app.register(healthRoute)
  await app.register(meRoute)
  await app.register(adminRoute)

  return app
}

export default buildApp

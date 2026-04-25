import Fastify, { type FastifyInstance } from 'fastify'

import createLoggerConfig from '@/lib/createLoggerConfig'
import authenticate from '@/plugins/authenticate'
import authZero from '@/plugins/authZero'
import cors from '@/plugins/cors'
import database from '@/plugins/database'
import errorHandler from '@/plugins/errorHandler'
import swagger from '@/plugins/swagger'
import adminRoute from '@/routes/adminRoute'
import boardsRoute from '@/routes/boardsRoute'
import columnsRoute from '@/routes/columnsRoute'
import healthRoute from '@/routes/healthRoute'
import meRoute from '@/routes/meRoute'
import tasksRoute from '@/routes/tasksRoute'

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: createLoggerConfig() })

  await app.register(errorHandler)
  await app.register(cors)
  await app.register(swagger)
  await app.register(database)
  await app.register(authZero)
  await app.register(authenticate)

  await app.register(healthRoute)
  await app.register(meRoute)
  await app.register(boardsRoute)
  await app.register(columnsRoute)
  await app.register(tasksRoute)
  await app.register(adminRoute)

  return app
}

export default buildApp

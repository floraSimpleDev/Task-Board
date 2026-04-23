import type { FastifyPluginAsync } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import createDrizzleClient, { type Database } from '@/db/createDrizzleClient/createDrizzleClient'

declare module 'fastify' {
  interface FastifyInstance {
    database: Database
  }
}

const database: FastifyPluginAsync = async (fastify) => {
  const { database: drizzleDatabase, pool } = createDrizzleClient()

  fastify.decorate('database', drizzleDatabase)

  fastify.addHook('onClose', async () => {
    await pool.end()
  })
}

export default fastifyPlugin(database)

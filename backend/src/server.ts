import validateEnv from '@/lib/validateEnv'

import buildApp from './app'

const start = async (): Promise<void> => {
  const port = Number(validateEnv('PORT'))
  const host = validateEnv('HOST')

  const app = await buildApp()

  try {
    await app.listen({ port, host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

void start()

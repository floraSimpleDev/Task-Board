import buildApp from './app'

const start = async (): Promise<void> => {
  const port = Number(process.env.PORT)
  const host = process.env.HOST

  if (!port) {
    throw new Error('Missing environment variable port')
  }

  if (!host) {
    throw new Error('Missing environment variable host')
  }

  const app = await buildApp()

  try {
    await app.listen({ port, host })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

void start()

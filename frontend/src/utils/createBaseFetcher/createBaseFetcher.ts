import type { z } from 'zod'

interface Props<T extends z.ZodType> {
  getToken: () => Promise<string>
  baseURL: string
  schema: T
}

const createBaseFetcher =
  <T extends z.ZodType>({ getToken, baseURL, schema }: Props<T>) =>
  async (path: string, init?: RequestInit): Promise<z.infer<T>> => {
    const token = await getToken()
    const response = await fetch(`${baseURL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`${String(response.status)} ${response.statusText}`)
    }

    if (response.status === 204) {
      return schema.parse(undefined)
    }

    return schema.parse(await response.json())
  }

export default createBaseFetcher

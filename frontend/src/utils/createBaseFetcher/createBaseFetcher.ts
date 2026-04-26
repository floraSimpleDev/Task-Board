import type { z } from 'zod'

import ApiError from '@/utils/ApiError'

interface Props<T extends z.ZodType> {
  getToken: () => Promise<string>
  baseURL: string
  schema: T
}

interface ErrorBody {
  error?: string
  message?: string
}

const isErrorBody = (value: unknown): value is ErrorBody =>
  typeof value === 'object' && value !== null

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
      const body: unknown = await response.json().catch(() => null)
      const statusText = (isErrorBody(body) && body.error) || response.statusText || 'Error'
      const message = (isErrorBody(body) && body.message) || response.statusText || 'Request failed'
      throw new ApiError(response.status, statusText, message)
    }

    if (response.status === 204) {
      return schema.parse(undefined)
    }

    return schema.parse(await response.json())
  }

export default createBaseFetcher

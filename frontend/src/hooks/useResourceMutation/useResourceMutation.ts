import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'

interface RequestSpec {
  url: string
  method: 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

interface Props<TSchema extends z.ZodType, TArg> {
  swrKey: string
  schema: TSchema
  buildRequest: (arg: TArg) => RequestSpec
}

const useResourceMutation = <TSchema extends z.ZodType, TArg>({
  swrKey,
  schema,
  buildRequest,
}: Props<TSchema, TArg>): SWRMutationResponse<z.infer<TSchema>, Error, string, TArg> => {
  const fetcher = useAuthFetcher(schema)

  return useSWRMutation<z.infer<TSchema>, Error, string, TArg>(
    swrKey,
    async (_key, { arg }) => {
      const { url, method, body } = buildRequest(arg)
      const init: RequestInit = { method }
      if (body !== undefined) {
        init.headers = { 'Content-Type': 'application/json' }
        init.body = JSON.stringify(body)
      }
      return fetcher(url, init)
    },
    { throwOnError: false }
  )
}

export default useResourceMutation

import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'
import type { z } from 'zod'

import createBaseFetcher from '@/utils/createBaseFetcher'

const useAuthFetcher = <T extends z.ZodType>(
  schema: T
): ReturnType<typeof createBaseFetcher<T>> => {
  const { getAccessTokenSilently } = useAuth0()

  return useMemo(
    () =>
      createBaseFetcher({
        getToken: getAccessTokenSilently,
        baseURL: import.meta.env.VITE_API_URL,
        schema,
      }),
    [getAccessTokenSilently, schema]
  )
}

export default useAuthFetcher

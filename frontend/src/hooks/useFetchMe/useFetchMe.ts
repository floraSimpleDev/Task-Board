import useSWR, { type SWRResponse } from 'swr'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'

const schema = z.object({
  id: z.uuid(),
  authSub: z.string(),
  email: z.email(),
  userName: z.string(),
  createdAt: z.iso.datetime(),
})

type Me = z.infer<typeof schema>

const useFetchMe = (): SWRResponse<Me, Error> => useSWR<Me, Error>('/me', useAuthFetcher(schema))

export default useFetchMe

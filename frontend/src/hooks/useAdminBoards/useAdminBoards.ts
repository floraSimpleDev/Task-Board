import useSWR, { type SWRResponse } from 'swr'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import adminBoardListSchema from '@/schemas/adminBoardList'

type AdminBoardList = z.infer<typeof adminBoardListSchema>

const useAdminBoards = (): SWRResponse<AdminBoardList, Error> =>
  useSWR<AdminBoardList, Error>('/admin/boards', useAuthFetcher(adminBoardListSchema), {
    shouldRetryOnError: false,
  })

export default useAdminBoards

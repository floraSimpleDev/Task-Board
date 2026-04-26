import useSWR, { type SWRResponse } from 'swr'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import adminStatsSchema from '@/schemas/adminStats'

type AdminStats = z.infer<typeof adminStatsSchema>

const useAdminStats = (): SWRResponse<AdminStats, Error> =>
  useSWR<AdminStats, Error>('/admin/stats', useAuthFetcher(adminStatsSchema), {
    shouldRetryOnError: false,
  })

export default useAdminStats

import useSWR, { type SWRResponse } from 'swr'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import adminUserListSchema from '@/schemas/adminUserList'

type AdminUserList = z.infer<typeof adminUserListSchema>

const useAdminUsers = (): SWRResponse<AdminUserList, Error> =>
  useSWR<AdminUserList, Error>('/admin/users', useAuthFetcher(adminUserListSchema), {
    shouldRetryOnError: false,
  })

export default useAdminUsers

import useSWR, { type SWRResponse } from 'swr'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import taskActivitySchema from '@/schemas/taskActivity'

const schema = z.array(taskActivitySchema)
type TaskActivity = z.infer<typeof taskActivitySchema>

const useTaskActivities = (taskId: string | undefined): SWRResponse<TaskActivity[], Error> =>
  useSWR<TaskActivity[], Error>(
    taskId ? `/tasks/${taskId}/activities` : null,
    useAuthFetcher(schema)
  )

export default useTaskActivities

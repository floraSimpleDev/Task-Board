import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import taskSchema, { type Task, type TaskPriority } from '@/schemas/task/task'

interface UpdateTaskInput {
  taskId: string
  patch: {
    title?: string
    description?: string | null
    priority?: TaskPriority | null
    position?: number
    boardColumnId?: string
  }
}

interface Props {
  boardId: string
}

const useUpdateTask = ({
  boardId,
}: Props): SWRMutationResponse<Task, Error, string, UpdateTaskInput> => {
  const fetcher = useAuthFetcher(taskSchema)
  const key = `/boards/${boardId}`

  return useSWRMutation<Task, Error, string, UpdateTaskInput>(
    key,
    async (_key, { arg }) =>
      fetcher(`/tasks/${arg.taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg.patch),
      }),
    { throwOnError: false }
  )
}

export default useUpdateTask

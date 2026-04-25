import type { SWRMutationResponse } from 'swr/mutation'
import type z from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'
import taskSchema from '@/schemas/task'

type Task = z.infer<typeof taskSchema>
type TaskPriority = 'P0' | 'P1' | 'P2'

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
}: Props): SWRMutationResponse<Task, Error, string, UpdateTaskInput> =>
  useResourceMutation<typeof taskSchema, UpdateTaskInput>({
    swrKey: `/boards/${boardId}`,
    schema: taskSchema,
    buildRequest: (input) => ({
      url: `/tasks/${input.taskId}`,
      method: 'PATCH',
      body: input.patch,
    }),
  })

export default useUpdateTask

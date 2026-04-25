import type { SWRMutationResponse } from 'swr/mutation'
import { z } from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'

const voidSchema = z.void()

interface Props {
  boardId: string
}

const useDeleteTask = ({ boardId }: Props): SWRMutationResponse<void, Error, string, string> =>
  useResourceMutation<typeof voidSchema, string>({
    swrKey: `/boards/${boardId}`,
    schema: voidSchema,
    buildRequest: (taskId) => ({ url: `/tasks/${taskId}`, method: 'DELETE' }),
  })

export default useDeleteTask

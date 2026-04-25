import type { SWRMutationResponse } from 'swr/mutation'
import { z } from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'

const voidSchema = z.void()

const useDeleteBoard = (): SWRMutationResponse<void, Error, string, string> =>
  useResourceMutation<typeof voidSchema, string>({
    swrKey: '/boards',
    schema: voidSchema,
    buildRequest: (boardId) => ({ url: `/boards/${boardId}`, method: 'DELETE' }),
  })

export default useDeleteBoard

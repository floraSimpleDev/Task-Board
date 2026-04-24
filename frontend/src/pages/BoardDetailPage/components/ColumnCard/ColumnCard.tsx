import type { FC } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Column } from '@/schemas/column/column'

import DeleteColumnDialog from '../DeleteColumnDialog'

interface Props {
  boardId: string
  column: Column
}

const ColumnCard: FC<Props> = ({ boardId, column }) => (
  <Card className="w-72 shrink-0">
    <CardHeader>
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="truncate">{column.title}</CardTitle>
        <DeleteColumnDialog boardId={boardId} columnId={column.id} columnTitle={column.title} />
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">No tasks yet</p>
    </CardContent>
  </Card>
)

export default ColumnCard

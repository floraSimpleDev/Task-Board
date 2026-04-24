import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FC, ReactNode } from 'react'

type Sortable = ReturnType<typeof useSortable>

interface DragHandleProps {
  attributes: Sortable['attributes']
  listeners: Sortable['listeners']
}

interface Props {
  columnId: string
  children: (dragHandleProps: DragHandleProps) => ReactNode
}

const SortableColumn: FC<Props> = ({ columnId, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnId,
    data: { type: 'column' },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="shrink-0"
    >
      {children({ attributes, listeners })}
    </div>
  )
}

export default SortableColumn

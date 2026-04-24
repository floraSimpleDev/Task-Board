import { closestCorners, type CollisionDetection } from '@dnd-kit/core'

import parseDragData from '../parseDragData'

const boardCollisionDetection: CollisionDetection = (args) => {
  const activeData = parseDragData(args.active)

  if (activeData?.type === 'column') {
    const columnContainers = args.droppableContainers.filter(
      (container) => parseDragData(container)?.type === 'column'
    )
    return closestCorners({ ...args, droppableContainers: columnContainers })
  }

  return closestCorners(args)
}

export default boardCollisionDetection

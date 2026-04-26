import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title: string
  description: string
  value: number
  to?: string
}

const StatCard: FC<Props> = ({ title, description, value, to }) => {
  const card = (
    <Card className={to ? 'hover:border-primary transition-colors' : undefined}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )

  if (!to) {
    return card
  }

  return (
    <Link to={to} className="block">
      {card}
    </Link>
  )
}

export default StatCard

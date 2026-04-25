import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const NotFoundPage: FC = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>404 — Page not found</CardTitle>
        <CardDescription>The page you are looking for does not exist.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link to="/">Back to home</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
)

export default NotFoundPage

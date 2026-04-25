import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const LoginPage: FC = () => {
  const { loginWithRedirect } = useAuth0()

  const handleLogin = (): void => {
    void loginWithRedirect()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in to access your task boards</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleLogin}>
            Log in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage

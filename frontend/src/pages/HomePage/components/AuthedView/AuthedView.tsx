import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'

import { Button } from '@/components/ui/button'
import useFetchMe from '@/hooks/useFetchMe'

const AuthedView: FC = () => {
  const { user, logout } = useAuth0()
  const { name, email } = user ?? {}
  const { data: me, error, isLoading, mutate } = useFetchMe()

  const handleLogout = (): void => {
    void logout({ logoutParams: { returnTo: window.location.origin } })
  }

  const handleRefetch = (): void => {
    void mutate()
  }

  return (
    <div className="mt-4 space-y-3">
      <p>Hello {name ?? email}</p>
      <div className="space-x-2">
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
        <Button onClick={handleRefetch}>Refetch /me</Button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-destructive">Error: {error.message}</p>}
      {me && <pre className="bg-muted mt-2 rounded p-3 text-sm">{JSON.stringify(me, null, 2)}</pre>}
    </div>
  )
}

export default AuthedView

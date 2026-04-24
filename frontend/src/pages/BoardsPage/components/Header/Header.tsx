import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'

import { Button } from '@/components/ui/button'

const Header: FC = () => {
  const { user, logout } = useAuth0()
  const { name, email } = user ?? {}

  const handleLogout = (): void => {
    void logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="text-xl font-semibold">Task Board</h1>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">{name ?? email ?? 'there'}</span>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  )
}

export default Header

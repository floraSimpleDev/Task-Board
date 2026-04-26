import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import useAdminStats from '@/hooks/useAdminStats'
import useFetchMe from '@/hooks/useFetchMe'

const Header: FC = () => {
  const { user, logout } = useAuth0()
  const { data: me } = useFetchMe()
  const { data: adminStats } = useAdminStats()
  const { name, email } = user ?? {}
  const { userName } = me ?? {}
  const isAdmin = Boolean(adminStats)

  const handleLogout = (): void => {
    void logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-4">
        <Link to="/boards" className="text-xl font-semibold">
          Task Board
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Admin
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">
          {userName ?? name ?? email ?? 'there'}
        </span>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  )
}

export default Header

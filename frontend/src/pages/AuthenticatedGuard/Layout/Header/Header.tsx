import { useAuth0 } from '@auth0/auth0-react'
import { ChevronDownIcon } from 'lucide-react'
import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useAdminStats from '@/hooks/useAdminStats'
import useFetchMe from '@/hooks/useFetchMe'

const Header: FC = () => {
  const { user, logout } = useAuth0()
  const { data: me } = useFetchMe()
  const { data: adminStats } = useAdminStats()
  const navigate = useNavigate()
  const { name, email } = user ?? {}
  const { userName } = me ?? {}
  const displayName = userName ?? name ?? email ?? 'there'
  const isAdmin = Boolean(adminStats)

  const handleLogout = (): void => {
    void logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link to="/boards" className="text-xl font-semibold">
        Task Board
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm outline-none">
          <span>{displayName}</span>
          <ChevronDownIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-foreground text-sm font-medium">{displayName}</span>
              {email && <span className="text-muted-foreground text-xs">{email}</span>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem
              onSelect={() => {
                void navigate('/admin')
              }}
            >
              Admin stats
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default Header

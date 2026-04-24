import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const AuthenticatedRoute: FC = () => {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

export default AuthenticatedRoute

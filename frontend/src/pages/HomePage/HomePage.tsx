import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'
import { Navigate } from 'react-router-dom'

import LoginPage from '@/pages/LoginPage'

const HomePage: FC = () => {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/boards" replace /> : <LoginPage />
}

export default HomePage

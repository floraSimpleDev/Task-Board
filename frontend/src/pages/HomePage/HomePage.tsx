import { useAuth0 } from '@auth0/auth0-react'
import type { FC } from 'react'

import AuthedView from './components/AuthedView'
import LoginView from './components/LoginView'

const HomePage: FC = () => {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? <AuthedView /> : <LoginView />
}

export default HomePage

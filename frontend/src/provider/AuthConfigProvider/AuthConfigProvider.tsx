import { Auth0Provider } from '@auth0/auth0-react'
import type { FC, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const AuthConfigProvider: FC<Props> = ({ children }) => (
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
    }}
  >
    {children}
  </Auth0Provider>
)

export default AuthConfigProvider

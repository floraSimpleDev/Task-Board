import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import AuthConfigProvider from '@/provider/AuthConfigProvider'

import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthConfigProvider>
      <App />
    </AuthConfigProvider>
  </StrictMode>
)

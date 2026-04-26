import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

import Header from '@/pages/AuthenticatedGuard/Layout/Header'

const Layout: FC = () => (
  <div className="min-h-screen">
    <Header />
    <main className="mx-auto max-w-5xl p-6">
      <Outlet />
    </main>
  </div>
)

export default Layout

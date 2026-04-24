import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

import Header from '@/components/Header'

const Layout: FC = () => (
  <div className="min-h-screen">
    <Header />
    <Outlet />
  </div>
)

export default Layout

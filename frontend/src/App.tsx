import type { FC } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthenticatedRoute from '@/components/AuthenticatedRoute'
import BoardsPage from '@/pages/BoardsPage'
import HomePage from '@/pages/HomePage'

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<AuthenticatedRoute />}>
        <Route path="/boards" element={<BoardsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App

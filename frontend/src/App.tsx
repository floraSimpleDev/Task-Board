import type { FC } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthenticatedGuard from '@/pages/AuthenticatedGuard'
import BoardDetailPage from '@/pages/BoardDetailPage'
import BoardsPage from '@/pages/BoardsPage'
import HomePage from '@/pages/HomePage'

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<AuthenticatedGuard />}>
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:id" element={<BoardDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App

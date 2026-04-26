import type { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AdminActivitiesPage from '@/pages/AdminActivitiesPage'
import AdminBoardsPage from '@/pages/AdminBoardsPage'
import AdminStatsPage from '@/pages/AdminStatsPage'
import AdminTasksPage from '@/pages/AdminTasksPage'
import AdminUsersPage from '@/pages/AdminUsersPage'
import AuthenticatedGuard from '@/pages/AuthenticatedGuard'
import BoardDetailPage from '@/pages/BoardDetailPage'
import BoardsPage from '@/pages/BoardsPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<AuthenticatedGuard />}>
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:id" element={<BoardDetailPage />} />
        <Route path="/admin" element={<AdminStatsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/boards" element={<AdminBoardsPage />} />
        <Route path="/admin/tasks" element={<AdminTasksPage />} />
        <Route path="/admin/activities" element={<AdminActivitiesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
)

export default App

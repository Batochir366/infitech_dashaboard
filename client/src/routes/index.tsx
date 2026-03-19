import { createBrowserRouter, RouterProvider } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import AuthLayout from "../layouts/AuthLayout"

import { Navigate } from "react-router-dom"
import LoginPage from "../pages/auth/LoginPage"
import ClientListPage from "../pages/clients/ClientListPage"
import ClientFormPage from "../pages/clients/ClientFormPage"
import ClientDetailPage from "../pages/clients/ClientDetailPage"
import ModuleListPage from "../pages/modules/ModuleListPage"
import ModuleDetailPage from "../pages/modules/ModuleDetailPage"
import DomainListPage from "../pages/domains/DomainListPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/clients" replace />,
      },
      {
        path: "clients",
        children: [
          {
            index: true,
            element: <ClientListPage />,
          },
          {
            path: ":id",
            element: <ClientDetailPage />,
          },
          {
            path: ":id/edit",
            element: <ClientFormPage />,
          },
        ],
      },
      {
        path: "domains",
        children: [
          {
            index: true,
            element: <DomainListPage />,
          },
        ],
      },
      {
        path: "modules",
        children: [
          {
            index: true,
            element: <ModuleListPage />,
          },
          {
            path: ":id",
            element: <ModuleDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

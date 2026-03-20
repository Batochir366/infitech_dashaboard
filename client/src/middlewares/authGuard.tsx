import { Navigate, useLocation } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"

const TOKEN_KEY = "auth_token"

export default function AuthGuard() {
  const location = useLocation()
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    const returnTo = location.pathname + location.search
    return (
      <Navigate
        to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    )
  }

  return <DashboardLayout />
}


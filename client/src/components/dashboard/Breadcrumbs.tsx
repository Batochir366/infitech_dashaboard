import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home size={14} className="mr-1" />
        <span>Dashboard</span>
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1
        const to = `/${pathnames.slice(0, index + 1).join("/")}`

        return (
          <div key={to} className="flex items-center space-x-2">
            <ChevronRight size={14} />
            {last ? (
              <span className="font-medium text-foreground capitalize">
                {value.replace(/-/g, " ")}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors capitalize"
              >
                {value.replace(/-/g, " ")}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

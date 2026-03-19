import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const DEFAULT_PRIMARY = "#24a3bf"

interface ThemeContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: DEFAULT_PRIMARY,
  setPrimaryColor: () => { },
})

function applyPrimaryColor(hex: string) {
  document.documentElement.style.setProperty("--color-primary", hex)
  document.documentElement.style.setProperty("--color-ring", hex)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    return localStorage.getItem("primary_color") || DEFAULT_PRIMARY
  })

  useEffect(() => {
    applyPrimaryColor(primaryColor)
  }, [])

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color)
    localStorage.setItem("primary_color", color)
    applyPrimaryColor(color)
  }

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

import { Bell, User, Palette } from "lucide-react"
import { useRef } from "react"
import { Button } from "../ui/Button"
import { useTheme } from "../../context/ThemeContext"

const PRESET_COLORS = [
  { label: "Blue", value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Rose", value: "#e11d48" },
  { label: "Orange", value: "#ea580c" },
  { label: "Emerald", value: "#059669" },
  { label: "Slate", value: "#334155" },
]

export function Navbar() {
  const { primaryColor, setPrimaryColor } = useTheme()
  const colorInputRef = useRef<HTMLInputElement>(null)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex flex-1 items-center gap-4" />
      <div className="flex items-center gap-2">

        {/* Color picker */}
        <div className="relative group">
          <Button variant="ghost" size="icon" className="relative" title="Change primary color">
            <Palette size={20} />
            <span
              className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full border border-white"
              style={{ backgroundColor: primaryColor }}
            />
          </Button>

          {/* Dropdown panel */}
          <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col gap-2 rounded-xl border bg-popover p-3 shadow-lg min-w-[160px] z-50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Primary Color</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  title={preset.label}
                  onClick={() => setPrimaryColor(preset.value)}
                  className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: preset.value,
                    borderColor: primaryColor === preset.value ? "white" : "transparent",
                    outline: primaryColor === preset.value ? `2px solid ${preset.value}` : "none",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1 border-t pt-2">
              <span className="text-xs text-muted-foreground flex-1">Custom</span>
              <div
                className="h-6 w-6 rounded-full border-2 border-border cursor-pointer overflow-hidden"
                style={{ backgroundColor: primaryColor }}
                onClick={() => colorInputRef.current?.click()}
              >
                <input
                  ref={colorInputRef}
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          <User size={18} className="text-secondary-foreground" />
        </div>
      </div>
    </header>
  )
}

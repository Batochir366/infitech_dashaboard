import * as React from "react"
import { cn } from "../../utils/cn"

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value?: number
  onChange?: (value: number) => void
  currency?: boolean
}

const formatNumber = (raw: string): string => {
  if (!raw) return ""
  const num = parseInt(raw, 10)
  return isNaN(num) ? "" : num.toLocaleString("en-US")
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, currency = false, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [rawText, setRawText] = React.useState<string>(() =>
      value !== undefined && !isNaN(value) ? String(value) : ""
    )

    const localRef = React.useRef<HTMLInputElement | null>(null)
    // Snapshot the digit count before the cursor on each keydown so we can
    // restore a sensible cursor position after the value is reformatted.
    const digitsBeforeCursor = React.useRef(0)

    // Sync rawText when the form resets / sets a new value from outside.
    React.useEffect(() => {
      if (!isFocused) {
        setRawText(value !== undefined && !isNaN(value) ? String(value) : "")
      }
    }, [value, isFocused])

    const formatted = formatNumber(rawText)
    const displayValue = isFocused
      ? formatted
      : formatted
        ? currency
          ? `${formatted}₮`
          : formatted
        : ""

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const pos = e.currentTarget.selectionStart ?? 0
      digitsBeforeCursor.current = formatted.slice(0, pos).replace(/\D/g, "").length
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stripped = e.target.value.replace(/\D/g, "")
      const prevStripped = rawText.replace(/\D/g, "")
      const isDeleting = stripped.length < prevStripped.length

      setRawText(stripped)
      onChange?.(stripped === "" ? 0 : parseInt(stripped, 10))

      // Restore cursor after React re-renders the reformatted value.
      const newFormatted = formatNumber(stripped)
      const targetDigits = isDeleting
        ? Math.max(0, digitsBeforeCursor.current - 1)
        : digitsBeforeCursor.current + 1

      requestAnimationFrame(() => {
        const el = localRef.current
        if (!el) return
        let digitCount = 0
        let newPos = newFormatted.length
        for (let i = 0; i < newFormatted.length; i++) {
          if (/\d/.test(newFormatted[i])) digitCount++
          if (digitCount === targetDigits) {
            newPos = i + 1
            break
          }
        }
        el.setSelectionRange(newPos, newPos)
      })
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <input
        type="text"
        inputMode="numeric"
        ref={(el) => {
          localRef.current = el
          if (typeof ref === "function") ref(el)
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
        }}
        value={displayValue}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }

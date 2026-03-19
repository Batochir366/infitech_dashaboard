import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Info, X, XCircle } from "lucide-react"
import { cn } from "../../utils/cn"
import type { ToastItem } from "../../context/ToastContext"

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

const config = {
  success: {
    icon: CheckCircle,
    className: "border-emerald-500/40 bg-white",
    iconClassName: "text-emerald-500",
    titleClassName: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    className: "border-red-500/40 bg-white",
    iconClassName: "text-red-500",
    titleClassName: "text-red-500",
  },
  info: {
    icon: Info,
    className: "border-blue-500/40 bg-white",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-500",
  },
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const { icon: Icon, className, iconClassName, titleClassName } = config[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-3 w-80 rounded-lg border p-4 shadow-lg",
        className
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", iconClassName)} />
      <p className={cn("flex-1 text-sm font-medium leading-snug", titleClassName)}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

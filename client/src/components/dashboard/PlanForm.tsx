import { useEffect, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, ChevronDown, X } from "lucide-react"
import { usePlan, useCreatePlan, useUpdatePlan } from "../../hooks/usePlans"
import { useModules } from "../../hooks/useModules"
import { useDomains } from "../../hooks/useDomains"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { NumberInput } from "../ui/NumberInput"
import { Switch } from "../ui/Switch"

const parseAllowedDomains = (raw?: string | null): string[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean)
    }
  } catch {
    // Backward compatibility for older comma-separated values.
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

const planSchema = z.object({
  moduleId: z.number({ message: "Модуль сонгоно уу" }).min(1, "Модуль сонгоно уу"),
  title: z.string().min(1, "Гарчиг оруулна уу"),
  description: z.string().optional(),
  credit: z.number({ message: "Тоо оруулна уу" }).min(0),
  price: z.number({ message: "Тоо оруулна уу" }).min(0),
  discount: z.number({ message: "Тоо оруулна уу" }).min(0).max(100),
  isEnabled: z.boolean(),
  allowedDomains: z.string().optional(),
})

type PlanFormValues = z.infer<typeof planSchema>

interface PlanFormProps {
  planId?: number
  defaultModuleId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function PlanForm({ planId, defaultModuleId, onSuccess, onCancel }: PlanFormProps) {
  const isEdit = !!planId
  const { data: plan, isLoading: isFetching } = usePlan(planId ?? 0)
  const { data: modulesData } = useModules({ limit: 100 })
  const { data: domainsData } = useDomains({ limit: 100 })
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()

  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      moduleId: defaultModuleId ?? 0,
      title: "",
      description: "",
      credit: 0,
      price: 0,
      discount: 0,
      isEnabled: true,
      allowedDomains: "",
    },
  })

  const isEnabled = watch("isEnabled")

  useEffect(() => {
    if (plan) {
      reset({
        moduleId: plan.moduleId,
        title: plan.title,
        description: plan.description ?? "",
        credit: plan.credit,
        price: plan.price,
        discount: plan.discount,
        isEnabled: plan.isEnabled,
        allowedDomains: plan.allowedDomains ?? "",
      })
      setItems(plan.items.map((i) => i.title))
      setSelectedDomains(parseAllowedDomains(plan.allowedDomains))
    }
  }, [plan, reset])

  useEffect(() => {
    setValue(
      "allowedDomains",
      selectedDomains.length > 0 ? JSON.stringify(selectedDomains) : ""
    )
  }, [selectedDomains, setValue])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    setItems((prev) => [...prev, trimmed])
    setNewItem("")
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PlanFormValues) => {
    try {
      const payload = {
        ...data,
        allowedDomains:
          selectedDomains.length > 0 ? JSON.stringify(selectedDomains) : undefined,
        description: data.description || undefined,
        items,
      }
      if (isEdit) {
        await updatePlan.mutateAsync({ id: planId!, data: payload })
      } else {
        await createPlan.mutateAsync(payload)

      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save plan:", error)
    }
  }

  if (isEdit && isFetching) {
    return <div className="py-10 text-center">Уншиж байна...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {!defaultModuleId && (
        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">Модуль *</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={watch("moduleId") || ""}
            onChange={(e) => setValue("moduleId", parseInt(e.target.value), { shouldValidate: true })}
          >
            <option value="">Модуль сонгоно уу</option>
            {modulesData?.data.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.code})
              </option>
            ))}
          </select>
          {errors.moduleId && (
            <p className="text-xs text-destructive">{errors.moduleId.message}</p>
          )}
        </div>
      )}

      <div className="grid gap-2">
        <label className="text-sm font-medium text-muted-foreground">Гарчиг *</label>
        <Input {...register("title")} placeholder="Тарифын нэр" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-muted-foreground">Тайлбар</label>
        <textarea
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          {...register("description")}
          placeholder="Тарифын тайлбар..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">Кредит *</label>
          <Controller
            name="credit"
            control={control}
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="0"
              />
            )}
          />
          {errors.credit && <p className="text-xs text-destructive">{errors.credit.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">Үнэ *</label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                currency
                placeholder="0"
              />
            )}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">Хямдрал % *</label>
          <Input
            type="number"
            {...register("discount", { valueAsNumber: true })}
            placeholder="0"
            min={0}
            max={100}
          />
          {errors.discount && (
            <p className="text-xs text-destructive">{errors.discount.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-muted-foreground">Зөвшөөрөгдсөн домэйнууд</label>
        <input type="hidden" {...register("allowedDomains")} />
        <div className="relative" ref={dropdownRef}>
          {/* Selected chips */}
          {selectedDomains.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {selectedDomains.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => setSelectedDomains((prev) => prev.filter((d) => d !== name))}
                    className="hover:text-destructive transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSelectedDomains([])}
                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                title="Бүгдийг цэвэрлэх"
              >
                <X size={11} />
                Бүгд
              </button>
            </div>
          )}

          {/* Trigger */}
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground"
          >
            <span>
              {selectedDomains.length === 0
                ? "Домэйн сонгоно уу..."
                : `${selectedDomains.length} домэйн сонгогдсон`}
            </span>
            <ChevronDown size={15} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown list */}
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md max-h-48 overflow-y-auto">
              {domainsData?.data.filter((d) => d.isEnabled).length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">Домэйн байхгүй байна.</div>
              )}
              {domainsData?.data
                .filter((d) => d.isEnabled)
                .map((domain) => {
                  const checked = selectedDomains.includes(domain.name)
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => {
                        setSelectedDomains((prev) =>
                          checked ? prev.filter((d) => d !== domain.name) : [...prev, domain.name]
                        )
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked ? "bg-primary border-primary text-primary-foreground" : "border-input"
                        }`}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {domain.name}
                    </button>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium text-muted-foreground">
          Тарифын Мэдээлэл ({items.length})
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 rounded-md border bg-muted px-3 py-1.5 text-sm">
                {item}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => removeItem(index)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Мэдээлэл нэмэх..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addItem} className="shrink-0 gap-1">
            <Plus size={14} />
            Нэмэх
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={isEnabled}
          onCheckedChange={(val) => setValue("isEnabled", val)}
        />
        <label className="text-sm font-medium text-muted-foreground">
          {isEnabled ? "Идэвхтэй" : "Идэвхгүй"}
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Цуцлах
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Хадгалж байна..." : isEdit ? "Шинэчлэх" : "Нэмэх"}
        </Button>
      </div>
    </form>
  )
}

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useModule, useCreateModule, useUpdateModule } from "../../hooks/useModules"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Switch } from "../ui/Switch"

const moduleSchema = z.object({
  title: z.string().min(1, "Гарчиг оруулна уу"),
  code: z.string().min(1, "Код оруулна уу"),
  isEnabled: z.boolean(),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface ModuleFormProps {
  moduleId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function ModuleForm({ moduleId, onSuccess, onCancel }: ModuleFormProps) {
  const isEdit = !!moduleId
  const { data: module, isLoading: isFetching } = useModule(moduleId ?? 0)
  const createModule = useCreateModule()
  const updateModule = useUpdateModule()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      code: "",
      isEnabled: true,
    },
  })

  const isEnabled = watch("isEnabled")

  useEffect(() => {
    if (module) {
      reset({
        title: module.title,
        code: module.code,
        isEnabled: module.isEnabled,
      })
    }
  }, [module, reset])

  const onSubmit = async (data: ModuleFormValues) => {
    try {
      if (isEdit) {
        await updateModule.mutateAsync({ id: moduleId!, data })
      } else {
        await createModule.mutateAsync(data)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save module:", error)
    }
  }

  if (isEdit && isFetching) {
    return <div className="py-10 text-center">Уншиж байна...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium text-muted-foreground">
          Гарчиг *
        </label>
        <Input id="title" {...register("title")} placeholder="Модулийн нэр" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="code" className="text-sm font-medium text-muted-foreground">
          Код *
        </label>
        <Input
          id="code"
          {...register("code")}
          placeholder="MODUL_CODE"
          className="font-mono"
        />
        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
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

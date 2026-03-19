import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useClient, useCreateClient, useUpdateClient } from "../../hooks/useClients"
import { useDomains } from "../../hooks/useDomains"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { NumberInput } from "../ui/NumberInput"
import { useEffect, useState } from "react"
import { User, Building2, Loader2 } from "lucide-react"

const EBARIMT_MERCHANT_INFO_URL = "https://info.ebarimt.mn/rest/merchant/info"

interface EbarimtMerchantInfo {
  found: boolean
  name: string
}

const fetchMerchantByRegNo = async (regno: string): Promise<EbarimtMerchantInfo | null> => {
  const normalized = regno.replace(/\D/g, "")
  if (normalized.length !== 7) return null
  try {
    const res = await fetch(`${EBARIMT_MERCHANT_INFO_URL}?regno=${normalized}`)
    const data = (await res.json()) as EbarimtMerchantInfo
    return data
  } catch {
    return null
  }
}

const PRODUCT_TYPE_OPTIONS = [
  { value: "ecom", label: "Ecommerce system" },
  { value: "deliverySystem", label: "Delivery system" },
] as const

const clientSchema = z.object({
  clientType: z.enum(["person", "company"]),
  name: z.string().min(2, "Нэр хамгийн багадаа 2 тэмдэгт байх ёстой"),
  regNumber: z.string().optional(),
  phoneNumber: z.string().min(1, "Утасны дугаар оруулна уу"),
  phoneNumber2: z.string().optional(),
  email: z.string().email("Зөв имэйл хаяг оруулна уу").optional().or(z.literal("")),
  domainId: z.string().optional(),
  invoice: z.number({ message: "Тоо оруулна уу" }).min(0, "Төлбөр 0-ээс бага байж болохгүй"),
  paymentDate: z.string().min(1, "Төлөх огноог сонгоно уу"),
  status: z.enum(["active", "inactive"]),
  notes: z.string().optional(),
  productType: z.enum(["ecom", "deliverySystem"]).optional(),
}).superRefine((data, ctx) => {
  if (data.clientType === "company" && data.regNumber?.replace(/\D/g, "").length !== 7) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["regNumber"],
      message: "7 оронтой байгууллагын регистр оруулна уу",
    })
  }
})

type ClientFormValues = z.infer<typeof clientSchema>

interface ClientFormProps {
  clientId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function ClientForm({ clientId, onSuccess, onCancel }: ClientFormProps) {
  const isEdit = !!clientId
  const { data: client, isLoading: isFetching } = useClient(clientId || "")
  const { data: domainsData } = useDomains({ limit: 100 })
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const [isCheckingRegNo, setIsCheckingRegNo] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientType: "person",
      status: "active",
      invoice: 0,
      name: "",
      regNumber: "",
      phoneNumber: "",
      phoneNumber2: "",
      email: "",
      domainId: "",
      paymentDate: "",
      notes: "",
      productType: undefined,
    },
  })

  const clientType = watch("clientType")

  useEffect(() => {
    if (client) {
      reset({
        clientType: client.regNumber ? "company" : "person",
        name: client.name,
        regNumber: client.regNumber || "",
        phoneNumber: client.phoneNumber,
        phoneNumber2: client.phoneNumber2 || "",
        email: client.email || "",
        domainId: client.domainId ? String(client.domainId) : "",
        invoice: client.invoice,
        paymentDate: client.paymentDate,
        status: client.status,
        notes: client.notes || "",
        productType: (client.productType as "ecom" | "deliverySystem") || undefined,
      })
    }
  }, [client, reset])

  const lookupCompany = async (value: string) => {
    const normalized = value.replace(/\D/g, "")
    if (normalized.length !== 7) return
    setIsCheckingRegNo(true)
    clearErrors("regNumber")
    try {
      const result = await fetchMerchantByRegNo(normalized)
      if (result?.found && result?.name?.trim()) {
        setValue("name", result.name.trim())
        clearErrors("regNumber")
      } else {
        setValue("name", "")
        setError("regNumber", { type: "validate", message: "Регистрийн дугаар аа шалгана уу" })
      }
    } catch {
      setValue("name", "")
      setError("regNumber", { type: "validate", message: "Регистрийн дугаар аа шалгана уу" })
    } finally {
      setIsCheckingRegNo(false)
    }
  }

  const onSubmit = async (data: ClientFormValues) => {
    try {
      const { clientType: _type, domainId: domainIdStr, ...rest } = data
      const payload = {
        ...rest,
        domainId: domainIdStr ? parseInt(domainIdStr, 10) : null,
      }
      if (isEdit) {
        await updateClient.mutateAsync({ id: clientId!, data: payload })
      } else {
        await createClient.mutateAsync(payload)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save client:", error)
    }
  }


  const switchToType = (type: "person" | "company") => {
    setValue("clientType", type)
    setValue("name", "")
    setValue("regNumber", "")
    clearErrors("name")
    clearErrors("regNumber")
  }

  if (isEdit && isFetching) {
    return <div className="py-10 text-center">Уншиж байна...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Tab switcher — only shown on create */}
      {!isEdit && (
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => switchToType("person")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${clientType === "person"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
          >
            <User className="w-4 h-4" />
            <span>Хувь хүн</span>
          </button>
          <button
            type="button"
            onClick={() => switchToType("company")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${clientType === "company"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Байгууллага</span>
          </button>
        </div>
      )}

      {/* Company tab: regNumber first, then auto-filled name */}
      {clientType === "company" && (
        <div className="grid gap-2">
          <label htmlFor="regNumber" className="text-sm font-medium text-muted-foreground">
            Байгууллагын регистрийн дугаар *
          </label>
          <div className="relative">
            <Input
              id="regNumber"
              {...register("regNumber", {
                onChange: (e) => {
                  const val: string = e.target.value.replace(/\D/g, "")
                  if (val.length === 7) lookupCompany(val)
                  else if (val.length < 7) {
                    setValue("name", "")
                    clearErrors("regNumber")
                  }
                },
              })}
              placeholder="1234567"
              maxLength={7}
              inputMode="numeric"
              onBlur={(e) => lookupCompany(e.target.value)}
              className="pr-8"
            />
            {isCheckingRegNo && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {errors.regNumber && (
            <p className="text-xs text-destructive">{errors.regNumber.message}</p>
          )}
        </div>
      )}

      {/* Name field — editable for person, readOnly (auto-filled) for company */}
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
          {clientType === "company" ? "Байгууллагын нэр" : "Нэр *"}
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder={clientType === "company" ? "Регистр оруулахад автоматаар бөглөгдөнө" : "Нэр оруулна уу"}
          readOnly={clientType === "company"}
          className={clientType === "company" ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Email — only for person */}
      {clientType === "person" && (
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Имэйл (Сонголтоор)</label>
          <Input id="email" type="email" {...register("email")} placeholder="example@mail.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      )}

      {/* Phone numbers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium text-muted-foreground">Утасны дугаар *</label>
          <Input id="phoneNumber" {...register("phoneNumber")} placeholder="9900-0000" inputMode="numeric" maxLength={8} />
          {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>}
        </div>
        <div className="grid gap-2">
          <label htmlFor="phoneNumber2" className="text-sm font-medium text-muted-foreground">Утасны дугаар 2 (Сонголтоор)</label>
          <Input id="phoneNumber2" {...register("phoneNumber2")} placeholder="9900-0000" inputMode="numeric" maxLength={8} />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="domainId" className="text-sm font-medium text-muted-foreground">Домэйн</label>
        <select
          id="domainId"
          {...register("domainId")}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— Сонгоно уу —</option>
          {domainsData?.data
            .filter((d) => d.isEnabled)
            .map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
        </select>
        {errors.domainId && <p className="text-xs text-destructive">{errors.domainId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="invoice" className="text-sm font-medium text-muted-foreground">Төлбөр *</label>
          <Controller
            name="invoice"
            control={control}
            render={({ field }) => (
              <NumberInput
                id="invoice"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                currency
                placeholder="0"
              />
            )}
          />
          {errors.invoice && <p className="text-xs text-destructive">{errors.invoice.message}</p>}
        </div>
        <div className="grid gap-2">
          <label htmlFor="paymentDate" className="text-sm font-medium text-muted-foreground">Төлөх огноо *</label>
          <Input id="paymentDate" type="input" inputMode="numeric" {...register("paymentDate")} />
          {errors.paymentDate && <p className="text-xs text-destructive">{errors.paymentDate.message}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="productType" className="text-sm font-medium text-muted-foreground">Бүтээгдэхүүний төрөл (Сонголтоор)</label>
        <select
          id="productType"
          {...register("productType")}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— Сонгоно уу —</option>
          {PRODUCT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium text-muted-foreground">Тэмдэглэл (Сонголтоор)</label>
        <textarea
          id="notes"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register("notes")}
          placeholder="Нэмэлт мэдээлэл..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Цуцлах
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Хадгалж байна..." : isEdit ? "Шинэчлэх" : "Нэмэх"}
        </Button>
      </div>
    </form>
  )
}

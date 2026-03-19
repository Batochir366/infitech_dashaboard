import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { useDomains, useCreateDomain, useUpdateDomain, useDeleteDomain } from "../../hooks/useDomains"
import { useToast } from "../../context/ToastContext"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"
import { Switch } from "../../components/ui/Switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table"
import { Card } from "../../components/ui/Card"
import { Modal } from "../../components/ui/Modal"
import dayjs from "dayjs"

const domainSchema = z.object({
  name: z.string().min(1, "Домэйн нэр оруулна уу"),
  isEnabled: z.boolean(),
})

type DomainFormValues = z.infer<typeof domainSchema>

interface DomainFormProps {
  defaultValues?: DomainFormValues
  onSubmit: (data: DomainFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

function DomainForm({ defaultValues, onSubmit, onCancel, isSubmitting }: DomainFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: defaultValues ?? { name: "", isEnabled: true },
  })

  const isEnabled = watch("isEnabled")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
          Домэйн нэр *
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder="example.mn"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => setValue("isEnabled", checked)}
        />
        <label className="text-sm font-medium text-muted-foreground">
          {isEnabled ? "Идэвхтэй" : "Идэвхгүй"}
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Цуцлах
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
        </Button>
      </div>
    </form>
  )
}

export default function DomainListPage() {
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editDomainId, setEditDomainId] = useState<number | null>(null)

  const { data, isLoading } = useDomains({ search: search || undefined })
  const createDomain = useCreateDomain()
  const updateDomain = useUpdateDomain()
  const deleteDomain = useDeleteDomain()
  const toast = useToast()

  const editDomain = data?.data.find((d) => d.id === editDomainId)

  const handleCreate = async (values: DomainFormValues) => {
    try {
      await createDomain.mutateAsync(values)
      setIsAddModalOpen(false)
    } catch {
      toast.error("Домэйн нэмэхэд алдаа гарлаа")
    }
  }

  const handleUpdate = async (values: DomainFormValues) => {
    if (!editDomainId) return
    try {
      await updateDomain.mutateAsync({ id: editDomainId, data: values })
      setEditDomainId(null)
    } catch {
      toast.error("Өөрчлөлт хадгалахад алдаа гарлаа")
    }
  }

  const handleToggleEnabled = async (id: number, current: boolean) => {
    try {
      await updateDomain.mutateAsync({ id, data: { isEnabled: !current } })
    } catch {
      toast.error("Төлөв өөрчлөхөд алдаа гарлаа")
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Та энэ домэйнийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deleteDomain.mutateAsync(id)
      } catch {
        toast.error("Устгахад алдаа гарлаа")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Домэйнууд</h2>
          <p className="text-muted-foreground">Системд бүртгэлтэй домэйнуудын жагсаалт.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Нэмэх</span>
        </Button>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Шинэ Домэйн нэмэх"
        description="Домэйн нэрийг доорх хэсэгт бүртгэнэ үү."
      >
        <DomainForm
          onSubmit={handleCreate}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={createDomain.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editDomainId}
        onClose={() => setEditDomainId(null)}
        title="Домэйн засах"
        description="Домэйн мэдээллийг шинэчлэнэ үү."
      >
        {editDomain && (
          <DomainForm
            defaultValues={{ name: editDomain.name, isEnabled: editDomain.isEnabled }}
            onSubmit={handleUpdate}
            onCancel={() => setEditDomainId(null)}
            isSubmitting={updateDomain.isPending}
          />
        )}
      </Modal>

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Домэйнээр хайх..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Уншиж байна...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Домэйн нэр</TableHead>
                <TableHead>Үүсгэсэн огноо</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Мэдээлэл олдсонгүй.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">{domain.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {dayjs(domain.createdAt).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={domain.isEnabled}
                          onCheckedChange={() => handleToggleEnabled(domain.id, domain.isEnabled)}
                          disabled={updateDomain.isPending}
                        />
                        <Badge variant={domain.isEnabled ? "success" : "warning"}>
                          {domain.isEnabled ? "Идэвхтэй" : "Идэвхгүй"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditDomainId(domain.id)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(domain.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}

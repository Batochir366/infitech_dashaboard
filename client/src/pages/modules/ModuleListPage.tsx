import { useState } from "react"

import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { useModules, useDeleteModule, useUpdateModule } from "../../hooks/useModules"
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
import { ModuleForm } from "../../components/dashboard/ModuleForm"
import { useNavigate } from "react-router-dom"

export default function ModuleListPage() {
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editModuleId, setEditModuleId] = useState<number | null>(null)
  const navigate = useNavigate()
  const { data, isLoading } = useModules({ search: search || undefined })
  const deleteModule = useDeleteModule()
  const updateModule = useUpdateModule()
  const toast = useToast()

  const handleDelete = async (id: number) => {
    if (window.confirm("Та энэ Модулийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deleteModule.mutateAsync(id)
      } catch {
        toast.error("Устгахад алдаа гарлаа")
      }
    }
  }

  const handleToggleEnabled = async (id: number, current: boolean) => {
    try {
      await updateModule.mutateAsync({ id, data: { isEnabled: !current } })
    } catch {
      toast.error("Төлөв өөрчлөхөд алдаа гарлаа")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Модулиуд</h2>
          <p className="text-muted-foreground">Системд бүртгэлтэй модулиудын жагсаалт.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Нэмэх</span>
        </Button>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Шинэ Модуль нэмэх"
        description="Модулийн мэдээллийг доорх хэсэгт бүртгэнэ үү."
      >
        <ModuleForm
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editModuleId}
        onClose={() => setEditModuleId(null)}
        title="Модуль засах"
        description="Модулийн мэдээллийг шинэчлэнэ үү."
      >
        <ModuleForm
          moduleId={editModuleId ?? undefined}
          onSuccess={() => setEditModuleId(null)}
          onCancel={() => setEditModuleId(null)}
        />
      </Modal>

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Нэр эсвэл кодоор хайх..."
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
                <TableHead>Гарчиг</TableHead>
                <TableHead>Код</TableHead>

                <TableHead>Төлөв</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Мэдээлэл олдсонгүй.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((module) => (

                  <TableRow
                    key={module.id}
                    className="hover:bg-muted cursor-pointer"
                  >
                    <TableCell className="font-medium">

                      {module.title}

                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {module.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={module.isEnabled}
                          onCheckedChange={() => handleToggleEnabled(module.id, module.isEnabled)}
                          disabled={updateModule.isPending}
                        />
                        <Badge variant={module.isEnabled ? "success" : "warning"}>
                          {module.isEnabled ? "Идэвхтэй" : "Идэвхгүй"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/modules/${module.id}`)}>
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditModuleId(module.id)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(module.id)}
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

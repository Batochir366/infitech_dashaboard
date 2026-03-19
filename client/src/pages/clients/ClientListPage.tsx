import { useState } from "react"
import dayjs from "dayjs"
import { Plus, Search, Edit, Trash2, Eye, } from "lucide-react"
import { useClients, useDeleteClient, useUpdateClient } from "../../hooks/useClients"
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
import { ClientForm } from "../../components/dashboard/ClientForm"
import { useNavigate } from "react-router-dom"

export default function ClientListPage() {
  const { data: clients, isLoading } = useClients()
  const deleteClient = useDeleteClient()
  const updateClient = useUpdateClient()
  const toast = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editClientId, setEditClientId] = useState<string | null>(null)
  const navigate = useNavigate()
  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.domain?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      client.invoice.toString().includes(search) ||
      (client.regNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
      client.phoneNumber.includes(search)

    const matchesStatus = statusFilter === "all" || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (window.confirm("Та энэ Харилцагчийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deleteClient.mutateAsync(id)
      } catch {
        toast.error("Устгахад алдаа гарлаа")
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    try {
      await updateClient.mutateAsync({
        id,
        data: { status: newStatus as "active" | "inactive" },
      })
    } catch {
      toast.error("Төлөв өөрчлөхөд алдаа гарлаа")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Харилцагчид</h2>
          <p className="text-muted-foreground">Системд бүртгэлтэй Харилцагчдын жагсаалт.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Нэмэх</span>
        </Button>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Шинэ Харилцагч нэмэх"
        description="Харилцагчийн мэдээллийг доорх хэсэгт бүртгэнэ үү."
      >
        <ClientForm
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editClientId}
        onClose={() => setEditClientId(null)}
        title="Харилцагч засах"
        description="Харилцагчийн мэдээллийг шинэчлэнэ үү."
      >
        <ClientForm
          clientId={editClientId ?? undefined}
          onSuccess={() => setEditClientId(null)}
          onCancel={() => setEditClientId(null)}
        />
      </Modal>

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Нэр эсвэл төлбөрөөр хайх..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-transparent border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Бүх төлөв</option>
              <option value="active">Идэвхтэй</option>
              <option value="inactive">Идэвхгүй</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Уншиж байна...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Нэр</TableHead>
                <TableHead>Регистр</TableHead>
                <TableHead>Утас</TableHead>
                <TableHead>Домэйн</TableHead>
                <TableHead>Бүтээгдэхүүн</TableHead>
                <TableHead>Төлбөр</TableHead>
                <TableHead>Төлөх огноо</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead>Бүртгэсэн</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Мэдээлэл олдсонгүй.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients?.map((client) => (
                  <TableRow
                    key={client.id}
                    className="hover:bg-muted cursor-pointer"

                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-muted-foreground">{client.regNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>{client.phoneNumber}</div>
                      {client.phoneNumber2 && <div className="text-xs text-muted-foreground">{client.phoneNumber2}</div>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client.domain?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.productType === "ecom"
                        ? "Ecommerce"
                        : client.productType === "deliverySystem"
                          ? "Delivery system"
                          : "—"}
                    </TableCell>
                    <TableCell>{client.invoice.toLocaleString()} ₮</TableCell>
                    <TableCell>{(client.paymentDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={client.status === "active"}
                          onCheckedChange={() => handleToggleStatus(client.id, client.status)}
                          disabled={updateClient.isPending}
                        />
                        <Badge variant={client.status === "active" ? "success" : "warning"}>
                          {client.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dayjs(client.createdAt).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${client.id}`)}>
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditClientId(client.id)}>
                          <Edit size={16} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(client.id)}
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

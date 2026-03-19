import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Calendar, Info, CreditCard, Activity, Phone, Mail, Hash } from "lucide-react"
import { useClient, useDeleteClient } from "../../hooks/useClients"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { useToast } from "../../context/ToastContext"


export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(id || "")
  const deleteClient = useDeleteClient()
  const toast = useToast()

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Уншиж байна...</div>
  }

  if (!client) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Үйлчлүүлэгч олдсонгүй</h2>
        <Button variant="link" onClick={() => navigate("/clients")}>
          Жагсаалт руу буцах
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (window.confirm("Та энэ үйлчлүүлэгчийг устгахдаа итгэлтэй байна уу?")) {
      try {
        await deleteClient.mutateAsync(client.id)
        navigate("/clients")
      } catch {
        toast.error("Устгахад алдаа гарлаа")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client.status === "active" ? "success" : "warning"}>
                {client.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
              </Badge>
              <span className="text-sm text-muted-foreground">ID: {client.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/clients/${client.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit size={16} />
              <span>Засах</span>
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>Устгах</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info size={18} />
              <span>Ерөнхий мэдээлэл</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Нэр</p>
                <p className="text-lg font-semibold">{client.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Регистрийн дугаар</p>
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-muted-foreground" />
                  <p className="text-lg font-semibold">{client.regNumber}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Утасны дугаар</p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <p className="text-lg">{client.phoneNumber}</p>
                </div>
              </div>
              {client.phoneNumber2 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Утасны дугаар 2</p>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <p className="text-lg">{client.phoneNumber2}</p>
                  </div>
                </div>
              )}
            </div>

            {client.email && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Имэйл</p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <p className="text-lg">{client.email}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Төлбөр</p>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-muted-foreground" />
                  <p className="text-lg text-primary font-bold">
                    {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(client.invoice)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Төлөх огноо</p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <p className="text-lg">{client.paymentDate}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Тэмдэглэл</p>
              <p className="text-sm bg-muted/30 p-4 rounded-md min-h-[100px]">
                {client.notes || "Тэмдэглэл байхгүй."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              <span>Системийн мэдээлэл</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Бүртгэсэн огноо</p>
              <p className="text-sm">{new Date(client.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Сүүлд зассан</p>
              <p className="text-sm">Одоогоор засаагүй</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Мэдээлэл шинэчлэгдсэн</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

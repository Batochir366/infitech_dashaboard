import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { ClientForm } from "../../components/dashboard/ClientForm"

export default function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {isEdit ? "Edit Client" : "Create New Client"}
        </h2>
        <Button variant="outline" onClick={() => navigate("/clients")}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm 
            clientId={id} 
            onSuccess={() => navigate("/clients")} 
            onCancel={() => navigate("/clients")} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

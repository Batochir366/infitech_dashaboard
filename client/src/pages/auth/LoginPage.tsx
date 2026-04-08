import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/Card"
import apiClient from "../../api/apiClient"
import { useToast } from "../../context/ToastContext"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)

  const returnTo = searchParams.get("returnTo") ?? "/"
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/"
  const authError = searchParams.get("error")

  useEffect(() => {
    if (authError === "unauthorized") {
      toast.error("Таны token хугацаа дууссан байна. Дахин нэвтэрнэ үү")
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await apiClient.post("/auth/login", data)
      localStorage.setItem("auth_token", res.data.token)
      toast.success("Амжилттай нэвтээгдлээ")
      navigate(safeReturnTo)
    } catch {
      toast.error("Нэвтрэх нэр эсвэл нууц үг буруу байна")
    }
  }

  return (
    <div>
      <Card className="border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Нэвтрэх</CardTitle>
          <CardDescription className="text-center">
            Имэйл болон нууц үгээ оруулна уу
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Имэйл</label>
              <Input id="email" type="email" placeholder="admin@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Нууц үг</label>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "..." : "Нэвтрэх"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div >

  )
}

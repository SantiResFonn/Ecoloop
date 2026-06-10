"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Leaf, LogOut, Users, TrendingUp, Coins, BarChart3, UserPlus, Settings } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
}

interface Stats {
  totalUsers: number
  totalTransactions: number
  totalPointsEarned?: number
  totalPointsRedeemed: number
  totalRedemptions?: number
  binsNeedingAttention?: number
}

interface Transaction {
  waste_type: string
  points_earned: number
  created_at: string
}

interface WasteBin {
  waste_type: string
  capacity_percentage: number
  needs_attention: boolean
  station?: { name?: string } | null
}

interface Redemption {
  id: string
  points_spent: number
  status: string
  created_at: string
  user?: { full_name?: string | null; email?: string } | null
  product?: { name?: string } | null
}

interface AdminDashboardProps {
  profile: Profile
  stats: Stats
  transactions: Transaction[]
  wasteBins: WasteBin[]
  recentRedemptions: Redemption[]
  onSignOut: () => void | Promise<void>
}

const COLORS = {
  recyclable: "#3b82f6",
  organic: "#22c55e",
  non_recyclable: "#6b7280",
}

export function AdminDashboard({
  profile,
  stats,
  transactions,
  wasteBins,
  recentRedemptions,
  onSignOut,
}: AdminDashboardProps) {
  const wasteTypeData = [
    {
      name: "Reciclable",
      value: transactions.filter((t) => t.waste_type === "recyclable").length,
      color: COLORS.recyclable,
    },
    {
      name: "Orgánico",
      value: transactions.filter((t) => t.waste_type === "organic").length,
      color: COLORS.organic,
    },
    {
      name: "No Reciclable",
      value: transactions.filter((t) => t.waste_type === "non_recyclable").length,
      color: COLORS.non_recyclable,
    },
  ]

  const averageCapacity = (type: string) => {
    const filtered = wasteBins.filter((b) => b.waste_type === type)
    if (filtered.length === 0) return 0
    return filtered.reduce((sum, b) => sum + (b.capacity_percentage || 0), 0) / filtered.length
  }

  const capacityByType = [
    { type: "Reciclable", capacidad: averageCapacity("recyclable") },
    { type: "Orgánico", capacidad: averageCapacity("organic") },
    { type: "No Reciclable", capacidad: averageCapacity("non_recyclable") },
  ]

  const binsNeedingAttention = wasteBins.filter((b) => b.needs_attention)

  return (
    <div className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Panel de Administrador</h1>
              <p className="text-xs text-muted-foreground">{profile.full_name || "Admin"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container px-4 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            <TabsTrigger value="management">Gestión</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Usuarios registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">Escaneos realizados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Puntos Canjeados</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPointsRedeemed}</div>
                  <p className="text-xs text-muted-foreground">EcoPoints totales</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Canjes Recientes</CardTitle>
                <CardDescription>Últimas {recentRedemptions.length} transacciones de la tienda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRedemptions.map((redemption) => {
                    const date = new Date(redemption.created_at)
                    return (
                      <div key={redemption.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{redemption.product?.name || "Producto"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {redemption.user?.full_name || redemption.user?.email || "Usuario"}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <Badge variant="secondary">-{redemption.points_spent} pts</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {recentRedemptions.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Aún no hay canjes recientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Residuos</CardTitle>
                <CardDescription>¿Qué tipo de residuo se desecha más?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={wasteTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {wasteTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacidad Promedio por Tipo</CardTitle>
                <CardDescription>¿Cuál canasta se llena más rápido?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={capacityByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="capacidad" fill="hsl(var(--primary))" name="Capacidad (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canastas que Necesitan Atención</CardTitle>
                <CardDescription>{binsNeedingAttention.length} canasta(s) con capacidad mayor al 80%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {binsNeedingAttention.map((bin, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{bin.station?.name || "Estación sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">
                          {bin.waste_type === "recyclable"
                            ? "Reciclable"
                            : bin.waste_type === "organic"
                              ? "Orgánico"
                              : "No Reciclable"}
                        </p>
                      </div>
                      <Badge variant="destructive">{bin.capacity_percentage}%</Badge>
                    </div>
                  ))}
                  {binsNeedingAttention.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Todas las canastas están en buen estado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" asChild>
                <Link href="/admin/users">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Gestionar Usuarios</CardTitle>
                        <CardDescription>Crear trabajadores y administradores</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" asChild>
                <Link href="/admin/products">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Settings className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Gestionar Productos</CardTitle>
                        <CardDescription>Administrar tienda y stock</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" asChild>
                <Link href="/admin/stations">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Gestionar Estaciones</CardTitle>
                        <CardDescription>Administrar puestos de basura</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" asChild>
                <Link href="/admin/news">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Settings className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Gestionar Contenido</CardTitle>
                        <CardDescription>Noticias y quizzes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

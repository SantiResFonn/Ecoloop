"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Leaf, ArrowLeft, UserPlus, Pencil, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { profileService } from "@/app/services/profileService"
import { useToast } from "@/components/ui/use-toast"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  eco_points: number
  created_at: string
}

interface UsersManagementProps {
  profile: Profile
  users: Profile[]
  onRefresh?: () => void | Promise<void>
}

type UserRole = "user" | "worker" | "admin"

export function UsersManagement({
  profile,
  users: initialUsers,
  onRefresh,
}: UsersManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user" as UserRole,
  })

  const filteredUsers = initialUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await profileService.createUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
      })

      toast({
        title: "Usuario creado",
        description: `${formData.full_name || formData.email} ha sido creado exitosamente.`,
      })

      setIsCreateOpen(false)
      setFormData({ email: "", password: "", full_name: "", role: "user" })
      await onRefresh?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear el usuario.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsLoading(true)

    try {
      await profileService.updateProfile(selectedUser.id, {
        full_name: formData.full_name,
        role: formData.role,
      })

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado exitosamente.",
      })

      setIsEditOpen(false)
      setSelectedUser(null)
      await onRefresh?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el usuario.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (user: Profile) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      role: (user.role as UserRole) || "user",
    })
    setIsEditOpen(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Administrador</Badge>
      case "worker":
        return <Badge variant="secondary">Trabajador</Badge>
      default:
        return <Badge>Usuario</Badge>
    }
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Gestionar Usuarios</h1>
                <p className="text-xs text-muted-foreground">Administrar trabajadores y administradores</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription>Total: {initialUsers.length} usuarios</CardDescription>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>Crear trabajador, administrador o usuario regular</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nombre Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="worker">Trabajador</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creando..." : "Crear Usuario"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Puntos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.eco_points} pts</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            disabled={user.id === profile.id}
                            title={user.id === profile.id ? "No puedes editar tu propio perfil aquí" : "Editar"}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modificar información del usuario</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input id="edit_email" type="email" value={formData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Nombre Completo</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="worker">Trabajador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

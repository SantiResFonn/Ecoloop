"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { register, error: authError, loading: isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register(email, password, fullName);
      router.push("/auth/register-success");
    } catch (err: any) {
      console.error("Error en registro:", err);
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-balance">Únete a EcoLoop</h1>
            <p className="text-sm text-muted-foreground text-balance">Crea tu cuenta y comienza a reciclar</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Registro de Usuario</CardTitle>
              <CardDescription>Completa el formulario para crear tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Pérez"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {(error || authError) && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error || authError}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Inicia sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default RegisterPage;

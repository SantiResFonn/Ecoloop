"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQrScanner } from "@/app/hooks/useQrScanner"
import { Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface QrScannerProps {
  userId: string
  onScanSuccess: () => void
}

export function QrScanner({ userId, onScanSuccess }: QrScannerProps) {
  const {
    isScanning,
    scanResult,
    isProcessing,
    hasPermission,
    scannedBin,
    wasteAmount,
    setWasteAmount,
    isSubmitting,
    startScanning,
    stopScanning,
    handleSubmitDeposit,
    handleCancelDeposit,
    setScanResult,
    MAX_CAPACITY_KG,
  } = useQrScanner(userId, onScanSuccess)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Escanear Código QR</CardTitle>
          <CardDescription>Escanea el código QR de una canasta de basura para depositar residuos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning && !scanResult && !scannedBin && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground text-balance">
                Presiona el botón para activar la cámara y escanear un código QR
              </p>
              <Button onClick={startScanning} size="lg" className="w-full max-w-xs">
                <Camera className="mr-2 h-5 w-5" />
                Activar Cámara
              </Button>
            </div>
          )}

          {hasPermission === false && (
            <div className="rounded-lg bg-destructive/10 p-4 text-center">
              <p className="text-sm text-destructive">
                No se pudo acceder a la cámara. Por favor, permite el acceso en la configuración de tu navegador.
              </p>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div id="qr-reader" className="overflow-hidden rounded-lg" />
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </div>
              )}
              <Button onClick={stopScanning} variant="outline" className="w-full bg-transparent">
                Cancelar
              </Button>
            </div>
          )}

          {scannedBin && !scanResult && (
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/10 p-4">
                <h3 className="font-semibold text-primary mb-2">Canasta Escaneada</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Estación:</strong> {scannedBin.waste_stations?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tipo:</strong>{" "}
                  {scannedBin.waste_type === "recyclable"
                    ? "Reciclable"
                    : scannedBin.waste_type === "organic"
                      ? "Orgánico"
                      : "No Reciclable"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Peso actual:</strong> {scannedBin.current_weight || 0}kg / {MAX_CAPACITY_KG}kg
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Capacidad:</strong> {scannedBin.capacity_percentage}%
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wasteAmount">Cantidad de residuos (kg)</Label>
                <Input
                  id="wasteAmount"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ej: 2.5"
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa la cantidad aproximada de residuos que vas a depositar (máximo {MAX_CAPACITY_KG}kg por
                  canasta)
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitDeposit} disabled={isSubmitting || !wasteAmount} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Depositar Residuos"
                  )}
                </Button>
                <Button onClick={handleCancelDeposit} variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${scanResult.success ? "bg-primary/10" : "bg-destructive/10"}`}>
                <div className="flex items-start gap-3">
                  {scanResult.success ? (
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${scanResult.success ? "text-primary" : "text-destructive"}`}>
                      {scanResult.message}
                    </p>
                    {scanResult.success && scanResult.points && (
                      <p className="mt-2 text-2xl font-bold text-primary">+{scanResult.points} EcoPoints</p>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={() => setScanResult(null)} className="w-full">
                Escanear Otro Código
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sistema de Puntos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">Puntos base por depósito:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reciclable</span>
                <span className="font-semibold text-primary">10 puntos base</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Orgánico</span>
                <span className="font-semibold text-primary">8 puntos base</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">No Reciclable</span>
                <span className="font-semibold text-primary">5 puntos base</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">+ Puntos adicionales según la cantidad depositada (kg)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

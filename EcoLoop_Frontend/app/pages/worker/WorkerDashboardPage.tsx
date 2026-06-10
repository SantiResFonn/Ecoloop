"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { stationService } from "@/app/services/stationService";
import { binService } from "@/app/services/binService";
import { WorkerDashboard } from "@/components/worker/worker-dashboard";
import { WasteStation } from "@/app/types";
import { Loader2 } from "lucide-react";

export function WorkerDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [stations, setStations] = useState<WasteStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "worker" && user.role !== "admin") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const data = await stationService.getStations();
        setStations(data as any);
      } catch (err) {
        console.error("Error loading stations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleEmptyBin = async (binId: string) => {
    setIsUpdating(true);
    try {
      await binService.emptyBin(binId);
      const updatedStations = await stationService.getStations();
      setStations(updatedStations as any);
    } catch (err) {
      console.error("Error emptying bin:", err);
      alert("Error al vaciar la canasta. Por favor, intenta de nuevo.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Panel de Trabajador...</span>
        </div>
      </div>
    );
  }

  return (
    <WorkerDashboard
      profile={user}
      stations={stations}
      onSignOut={handleSignOut}
      onEmptyBin={handleEmptyBin}
      isUpdating={isUpdating}
    />
  );
}

export default WorkerDashboardPage;

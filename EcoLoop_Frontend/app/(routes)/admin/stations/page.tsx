"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { stationService } from "@/app/services/stationService";
import { StationsManagement } from "@/components/admin/stations-management";
import { Loader2 } from "lucide-react";

export default function StationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await stationService.getStations();
      setStations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading stations:", err);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
    refresh().finally(() => setLoading(false));
  }, [user, authLoading, router, refresh]);

  if (authLoading || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Estaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <StationsManagement profile={user as any} stations={stations} onRefresh={refresh} />
  );
}

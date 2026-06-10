"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { adminService, type AdminAnalyticsResponse } from "@/app/services/adminService";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Loader2 } from "lucide-react";

export function AdminDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const analytics = await adminService.getAnalyticsData();
        setData(analytics);
      } catch (err) {
        console.error("Error loading analytics data:", err);
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

  if (authLoading || loading || !user || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Panel de Administrador...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      profile={user}
      stats={data.stats}
      transactions={data.recentTransactions as any[]}
      wasteBins={data.wasteBins as any[]}
      recentRedemptions={data.recentRedemptions as any[]}
      onSignOut={handleSignOut}
    />
  );
}

export default AdminDashboardPage;

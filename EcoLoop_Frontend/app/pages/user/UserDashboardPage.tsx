"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { transactionService } from "@/app/services/transactionService";
import { authService } from "@/app/services/authService";
import { UserDashboard } from "@/components/user/user-dashboard";
import { Transaction, Profile } from "@/app/types";
import { Loader2 } from "lucide-react";

export function UserDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    setProfile(user);

    const loadData = async () => {
      try {
        const txs = await transactionService.getTransactions(user.id);
        setTransactions(txs as any);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const handleRefresh = async () => {
    if (!user) return;
    try {
      const updatedUser = await authService.getUser();
      if (updatedUser) {
        setProfile(updatedUser as any);
      }
      const txs = await transactionService.getTransactions(user.id);
      setTransactions(txs as any);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (authLoading || loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <UserDashboard
      profile={profile}
      transactions={transactions}
      onSignOut={handleSignOut}
      onRefresh={handleRefresh}
    />
  );
}
export default UserDashboardPage;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { productService } from "@/app/services/productService";
import { authService } from "@/app/services/authService";
import { StoreView } from "@/components/user/store-view";
import { Product, Redemption, Profile } from "@/app/types";
import { Loader2 } from "lucide-react";

export function RedeemStorePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
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
        const prodList = await productService.getProducts(true);
        const redList = await productService.getRedemptions(user.id);
        setProducts(prodList as any);
        setRedemptions(redList as any);
      } catch (err) {
        console.error("Error loading store data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const handleRedeem = async (productId: string, pointsCost: number): Promise<void> => {
    if (!user || !profile) return;
    
    if (profile.eco_points < pointsCost) {
      throw new Error("No tienes suficientes EcoPoints para canjear este producto");
    }

    await productService.redeemProduct(user.id, productId, pointsCost);

    const updatedUser = await authService.getUser();
    if (updatedUser) {
      setProfile(updatedUser as any);
    }

    const prodList = await productService.getProducts(true);
    setProducts(prodList as any);

    const updatedRedemptions = await productService.getRedemptions(user.id);
    setRedemptions(updatedRedemptions as any);
  };

  if (authLoading || loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Tienda...</span>
        </div>
      </div>
    );
  }

  return (
    <StoreView
      profile={profile}
      products={products}
      redemptions={redemptions}
      onRedeem={handleRedeem}
    />
  );
}
export default RedeemStorePage;

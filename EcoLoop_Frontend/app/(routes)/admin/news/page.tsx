"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { newsService } from "@/app/services/newsService";
import { quizService } from "@/app/services/quizService";
import { ContentManagement } from "@/components/admin/content-management";
import { Loader2 } from "lucide-react";

export default function NewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [newsData, quizData] = await Promise.all([
        newsService.getNews(),
        quizService.getQuizzes(),
      ]);
      setNews(Array.isArray(newsData) ? newsData : []);
      setQuizzes(Array.isArray(quizData) ? quizData : []);
    } catch (err) {
      console.error("Error loading content:", err);
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
          <span>Cargando Contenido...</span>
        </div>
      </div>
    );
  }

  return (
    <ContentManagement
      profile={user as any}
      news={news}
      quizzes={quizzes}
      onRefresh={refresh}
    />
  );
}

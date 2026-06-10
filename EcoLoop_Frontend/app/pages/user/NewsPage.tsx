"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { newsService } from "@/app/services/newsService";
import { quizService } from "@/app/services/quizService";
import { NewsView } from "@/components/user/news-view";
import { NewsArticle, Quiz, Profile } from "@/app/types";
import { Loader2 } from "lucide-react";

export function NewsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([]);
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
        const artList = await newsService.getNews(true);
        const qzList = await quizService.getQuizzes(true);
        const compList = await quizService.getCompletions(user.id);
        
        setArticles(artList as any);
        setQuizzes(qzList as any);
        setCompletedQuizIds(compList?.map((c: any) => c.quiz_id) || []);
      } catch (err) {
        console.error("Error loading news/quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  if (authLoading || loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Noticias y Quizzes...</span>
        </div>
      </div>
    );
  }

  return (
    <NewsView
      profile={profile}
      articles={articles as any}
      quizzes={quizzes as any}
      completedQuizIds={completedQuizIds}
    />
  );
}
export default NewsPage;

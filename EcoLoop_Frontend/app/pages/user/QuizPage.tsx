"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { quizService, type QuizAnswerInput } from "@/app/services/quizService";
import { QuizView } from "@/components/user/quiz-view";
import { Quiz, QuizQuestion, Profile } from "@/app/types";
import { Loader2 } from "lucide-react";

export function QuizPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setProfile(user);

    const loadQuizData = async () => {
      if (!id) return;
      try {
        const completions = await quizService.getCompletions();
        const alreadyCompleted = Array.isArray(completions)
          ? completions.some((c: any) => c.quiz_id === id)
          : false;
        if (alreadyCompleted) {
          router.push("/user/news");
          return;
        }

        const quizData = await quizService.getQuizById(id);
        if (!quizData) {
          router.push("/user/news");
          return;
        }

        setQuiz(quizData as Quiz);
        setQuestions((quizData.quiz_questions || []) as QuizQuestion[]);
      } catch (err) {
        console.error("Error loading quiz:", err);
        router.push("/user/news");
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [user, authLoading, id, router]);

  const handleSubmit = async (answers: QuizAnswerInput[]) => {
    if (!quiz) {
      throw new Error("Quiz no cargado");
    }
    return quizService.submitQuizCompletion(quiz.id, answers);
  };

  if (authLoading || loading || !profile || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Cargando Quiz...</span>
        </div>
      </div>
    );
  }

  return (
    <QuizView
      profile={profile}
      quiz={quiz}
      questions={questions}
      onSubmit={handleSubmit}
    />
  );
}
export default QuizPage;

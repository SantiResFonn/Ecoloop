"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { Profile, Quiz, QuizQuestion } from "@/app/types"
import type { QuizAnswerInput } from "@/app/services/quizService"

interface QuizSubmissionResult {
  points_earned: number
  total_points: number
  completion: {
    score: number
  }
}

interface QuizViewProps {
  profile: Profile
  quiz: Quiz
  questions: QuizQuestion[]
  onSubmit: (answers: QuizAnswerInput[]) => Promise<QuizSubmissionResult>
}

export function QuizView({ profile: _profile, quiz, questions, onSubmit }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [answers, setAnswers] = useState<QuizAnswerInput[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resultSummary, setResultSummary] = useState<QuizSubmissionResult | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return []
    const options = [
      currentQuestion.wrong_answer_1,
      currentQuestion.wrong_answer_2,
      currentQuestion.wrong_answer_3,
    ].filter(Boolean)
    if (currentQuestion.correct_answer) {
      options.push(currentQuestion.correct_answer)
    }
    return [...options].sort(() => Math.random() - 0.5)
  }, [currentQuestion])

  const handleNext = () => {
    if (!selectedAnswer || isSubmitting) return

    const updatedAnswers: QuizAnswerInput[] = [
      ...answers,
      {
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
      },
    ]

    if (currentQuestionIndex < questions.length - 1) {
      setAnswers(updatedAnswers)
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
    } else {
      handleComplete(updatedAnswers)
    }
  }

  const handleComplete = async (allAnswers: QuizAnswerInput[]) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await onSubmit(allAnswers)
      setResultSummary(result)
      setAnswers(allAnswers)
      setIsCompleted(true)
    } catch (error: any) {
      console.error("Error completing quiz:", error)
      setErrorMessage(error?.message || "Error al completar el quiz. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCompleted && resultSummary) {
    return (
      <div className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">¡Quiz Completado!</CardTitle>
            <CardDescription>Has terminado el quiz exitosamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Tu puntuación</p>
              <p className="text-3xl font-bold text-primary">
                {resultSummary.completion.score} / {questions.length}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-primary font-medium">Puntos ganados</p>
              <p className="text-2xl font-bold text-primary">+{resultSummary.points_earned} EcoPoints</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/user/news">Volver a Noticias</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/user/news">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{quiz.title}</h1>
            <p className="text-xs text-muted-foreground">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-balance">{currentQuestion?.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {shuffledAnswers.map((answer, index) => (
                  <div
                    key={`${answer}-${index}`}
                    className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <RadioGroupItem value={answer} id={`answer-${index}`} />
                    <Label htmlFor={`answer-${index}`} className="flex-1 cursor-pointer text-balance">
                      {answer}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button onClick={handleNext} disabled={!selectedAnswer || isSubmitting} className="w-full">
                {isSubmitting
                  ? "Enviando..."
                  : currentQuestionIndex < questions.length - 1
                    ? "Siguiente Pregunta"
                    : "Finalizar Quiz"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

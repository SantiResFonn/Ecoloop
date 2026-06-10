"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Leaf, ArrowLeft, Plus, Trash2, Search, FileText, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { newsService } from "@/app/services/newsService"
import { useToast } from "@/components/ui/use-toast"

interface News {
  id: string
  title: string
  content: string
  image_url: string | null
  published: boolean
  created_at: string
}

interface Quiz {
  id: string
  title: string
  description: string | null
  quiz_questions?: any
  points_reward: number
  created_at: string
}

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
}

interface ContentManagementProps {
  profile: Profile
  news: News[]
  quizzes: Quiz[]
  onRefresh?: () => void | Promise<void>
}

export function ContentManagement({
  profile: _profile,
  news: initialNews,
  quizzes: initialQuizzes,
  onRefresh,
}: ContentManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [newsFormData, setNewsFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    published: true,
  })

  const filteredNews = initialNews.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredQuizzes = initialQuizzes.filter((item) =>
    item?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await newsService.createNews({
        title: newsFormData.title,
        content: newsFormData.content,
        image_url: newsFormData.image_url || null,
        published: newsFormData.published,
      })

      toast({
        title: "Noticia creada",
        description: "La noticia ha sido publicada exitosamente.",
      })

      setIsCreateNewsOpen(false)
      setNewsFormData({ title: "", content: "", image_url: "", published: true })
      await onRefresh?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear la noticia.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return

    try {
      await newsService.deleteNews(newsId)
      toast({
        title: "Noticia eliminada",
        description: "La noticia ha sido eliminada exitosamente.",
      })
      await onRefresh?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo eliminar la noticia.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Gestionar Contenido</h1>
                <p className="text-xs text-muted-foreground">Noticias y quizzes educativos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news">Noticias</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Noticias Educativas</CardTitle>
                    <CardDescription>Total: {initialNews.length} noticias</CardDescription>
                  </div>
                  <Dialog open={isCreateNewsOpen} onOpenChange={setIsCreateNewsOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Noticia
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Noticia</DialogTitle>
                        <DialogDescription>Publicar contenido educativo sobre reciclaje</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateNews} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="news_title">Título</Label>
                          <Input
                            id="news_title"
                            value={newsFormData.title}
                            onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="news_content">Contenido</Label>
                          <Textarea
                            id="news_content"
                            value={newsFormData.content}
                            onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                            rows={6}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="news_image_url">URL de Imagen (opcional)</Label>
                          <Input
                            id="news_image_url"
                            type="url"
                            value={newsFormData.image_url}
                            onChange={(e) => setNewsFormData({ ...newsFormData, image_url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Creando..." : "Publicar Noticia"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar noticias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNews.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image_url ? (
                                <img
                                  src={item.image_url || "/placeholder.svg"}
                                  alt={item.title}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.published ? "default" : "secondary"}>
                              {item.published ? "Publicado" : "Borrador"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quizzes Educativos</CardTitle>
                <CardDescription>Total: {initialQuizzes.length} quizzes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                  La creación y edición de quizzes desde el panel está deshabilitada en esta versión.
                  Los cuestionarios deben crearse desde el backend o la base de datos directamente.
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Preguntas</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{quiz.title}</p>
                                {quiz.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{quiz.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {Array.isArray(quiz.quiz_questions) ? quiz.quiz_questions.length : 0} preguntas
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{quiz.points_reward} pts</Badge>
                          </TableCell>
                          <TableCell>{new Date(quiz.created_at).toLocaleDateString("es-ES")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

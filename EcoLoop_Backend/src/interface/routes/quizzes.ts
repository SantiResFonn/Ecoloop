import { Router } from "express";
import { quizzesController } from "../controllers/QuizzesController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const quizzesRouter = Router();

/**
 * @openapi
 * /api/v1/quizzes:
 *   get:
 *     summary: Listar cuestionarios (Quizzes)
 *     tags: [Quizzes]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *         description: Filtrar solo cuestionarios activos (true)
 *     responses:
 *       200:
 *         description: Lista de cuestionarios obtenida con éxito
 */
quizzesRouter.get("/", quizzesController.list);

/**
 * @openapi
 * /api/v1/quizzes/completions/user:
 *   get:
 *     summary: Obtener historial de cuestionarios completados por el usuario autenticado
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de cuestionarios completados obtenido con éxito
 *       401:
 *         description: No autorizado
 */
quizzesRouter.get("/completions/user", authMiddleware, quizzesController.listCompletions);

/**
 * @openapi
 * /api/v1/quizzes/{id}:
 *   get:
 *     summary: Obtener detalle de un cuestionario por ID
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario
 *     responses:
 *       200:
 *         description: Detalle del cuestionario obtenido con éxito
 *       404:
 *         description: Cuestionario no encontrado
 */
quizzesRouter.get("/:id", quizzesController.getById);

/**
 * @openapi
 * /api/v1/quizzes/{id}/complete:
 *   post:
 *     summary: Responder/Completar un cuestionario
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question_id
 *                     - selected_answer
 *                   properties:
 *                     question_id:
 *                       type: string
 *                     selected_answer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Cuestionario completado y puntos calculados con éxito
 *       400:
 *         description: Datos inválidos o el cuestionario ya fue completado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuestionario o perfil no encontrado
 */
quizzesRouter.post("/:id/complete", authMiddleware, quizzesController.complete);

export default quizzesRouter;

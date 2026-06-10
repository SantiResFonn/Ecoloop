import { Router } from "express";
import { newsController } from "../controllers/NewsController";
import { authMiddleware, adminMiddleware } from "../../infrastructure/security/auth";

export const newsRouter = Router();

/**
 * @openapi
 * /api/v1/news:
 *   get:
 *     summary: Listar artículos de noticias
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de artículos
 */
newsRouter.get("/", newsController.list);

/**
 * @openapi
 * /api/v1/news/{id}:
 *   get:
 *     summary: Obtener un artículo por ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrado
 */
newsRouter.get("/:id", newsController.getById);

/**
 * @openapi
 * /api/v1/news:
 *   post:
 *     summary: Crear artículo
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image_url:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Creado
 */
newsRouter.post("/", authMiddleware, adminMiddleware, newsController.create);

/**
 * @openapi
 * /api/v1/news/{id}:
 *   put:
 *     summary: Actualizar artículo
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
newsRouter.put("/:id", authMiddleware, adminMiddleware, newsController.update);

/**
 * @openapi
 * /api/v1/news/{id}:
 *   delete:
 *     summary: Eliminar artículo
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Eliminado
 */
newsRouter.delete("/:id", authMiddleware, adminMiddleware, newsController.delete);


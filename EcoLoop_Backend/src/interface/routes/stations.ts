import { Router } from "express";
import { stationsController } from "../controllers/StationsController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const stationsRouter = Router();

/**
 * @openapi
 * /api/v1/stations:
 *   get:
 *     summary: Listar todas las estaciones
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: Lista de estaciones de reciclaje
 */
stationsRouter.get("/", stationsController.list);

/**
 * @openapi
 * /api/v1/stations/{id}:
 *   get:
 *     summary: Obtener una estación por ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos de la estación
 *       404:
 *         description: No encontrada
 */
stationsRouter.get("/:id", stationsController.getById);

/**
 * @openapi
 * /api/v1/stations:
 *   post:
 *     summary: Crear una nueva estación
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Creado
 */
stationsRouter.post("/", authMiddleware, stationsController.create);

/**
 * @openapi
 * /api/v1/stations/{id}:
 *   put:
 *     summary: Actualizar una estación
 *     tags: [Stations]
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
stationsRouter.put("/:id", authMiddleware, stationsController.update);

/**
 * @openapi
 * /api/v1/stations/{id}:
 *   delete:
 *     summary: Eliminar una estación
 *     tags: [Stations]
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
stationsRouter.delete("/:id", authMiddleware, stationsController.delete);

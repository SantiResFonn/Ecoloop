import { Router } from "express";
import { binsController } from "../controllers/BinsController";
import { authMiddleware, workerMiddleware } from "../../infrastructure/security/auth";

export const binsRouter = Router();

/**
 * @openapi
 * /api/v1/bins/qr:
 *   get:
 *     summary: Obtener un contenedor por su código QR
 *     tags: [Bins]
 *     parameters:
 *       - in: query
 *         name: qr_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código QR único del contenedor
 *     responses:
 *       200:
 *         description: Contenedor encontrado
 *       400:
 *         description: qr_code es requerido
 *       404:
 *         description: Contenedor no encontrado
 */
binsRouter.get("/qr", binsController.getByQr);

/**
 * @openapi
 * /api/v1/bins/{id}/capacity:
 *   put:
 *     summary: Actualizar capacidad y peso de un contenedor
 *     tags: [Bins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del contenedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [capacity_percentage, current_weight]
 *             properties:
 *               capacity_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               current_weight:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Capacidad actualizada con éxito
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Contenedor no encontrado
 */
binsRouter.put("/:id/capacity", authMiddleware, binsController.updateCapacity);

/**
 * @openapi
 * /api/v1/bins/{id}/empty:
 *   post:
 *     summary: Vaciar el contenedor (sólo worker/admin)
 *     tags: [Bins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del contenedor
 *     responses:
 *       200:
 *         description: Contenedor vaciado con éxito
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol worker o admin
 *       404:
 *         description: Contenedor no encontrado
 */
binsRouter.post("/:id/empty", authMiddleware, workerMiddleware, binsController.empty);

export default binsRouter;

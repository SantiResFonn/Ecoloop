import { Router } from "express";
import { redemptionsController } from "../controllers/RedemptionsController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const redemptionsRouter = Router();

/**
 * @openapi
 * /api/v1/redemptions:
 *   post:
 *     summary: Realizar canje de un producto (EcoTienda)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Canje creado con éxito
 *       400:
 *         description: Datos inválidos o puntos/stock insuficientes
 *       404:
 *         description: Producto o usuario no encontrado
 */
redemptionsRouter.post("/", authMiddleware, redemptionsController.create);

/**
 * @openapi
 * /api/v1/redemptions:
 *   get:
 *     summary: Obtener historial de canjes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID del usuario (solo admin)
 *     responses:
 *       200:
 *         description: Listado de canjes obtenido con éxito
 */
redemptionsRouter.get("/", authMiddleware, redemptionsController.list);

export default redemptionsRouter;

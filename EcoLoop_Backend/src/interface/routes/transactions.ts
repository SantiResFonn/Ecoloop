import { Router } from "express";
import { transactionsController } from "../controllers/TransactionsController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const transactionsRouter = Router();

/**
 * @openapi
 * /api/v1/transactions:
 *   get:
 *     summary: Listar transacciones
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por usuario
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
transactionsRouter.get("/", transactionsController.list);

/**
 * @openapi
 * /api/v1/transactions/scan:
 *   post:
 *     summary: Registrar escaneo de QR (flujo completo de reciclaje)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qr_code, weight]
 *             properties:
 *               qr_code:
 *                 type: string
 *                 description: Código QR del contenedor escaneado
 *               weight:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Peso (kg) de los residuos depositados
 *               user_id:
 *                 type: string
 *                 description: (Opcional) Sólo si se ignora el token; siempre se prefiere req.user.userId
 *     responses:
 *       201:
 *         description: Transacción registrada exitosamente
 *       400:
 *         description: Datos inválidos o contenedor lleno
 *       401:
 *         description: No autorizado
 *       404:
 *         description: QR no encontrado
 */
transactionsRouter.post("/scan", authMiddleware, transactionsController.scan);

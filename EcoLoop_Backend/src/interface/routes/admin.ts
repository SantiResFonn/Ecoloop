import { Router } from "express";
import { adminController } from "../controllers/AdminController";
import { authMiddleware, adminMiddleware } from "../../infrastructure/security/auth";

export const adminRouter = Router();

/**
 * @openapi
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Obtener métricas consolidadas del panel de administración
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas consolidadas (usuarios, transacciones, canjes, contenedores)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalTransactions:
 *                       type: integer
 *                     totalPointsEarned:
 *                       type: integer
 *                     totalPointsRedeemed:
 *                       type: integer
 *                     totalRedemptions:
 *                       type: integer
 *                     binsNeedingAttention:
 *                       type: integer
 *                 recentTransactions:
 *                   type: array
 *                 wasteBins:
 *                   type: array
 *                 recentRedemptions:
 *                   type: array
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol admin
 */
adminRouter.get("/analytics", authMiddleware, adminMiddleware, adminController.getAnalytics);

export default adminRouter;

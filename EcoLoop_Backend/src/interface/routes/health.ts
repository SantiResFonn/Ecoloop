import { Router } from "express";
import { healthController } from "../controllers/HealthController";

export const healthRouter = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Health check del API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OK
 */
healthRouter.get("/", healthController.check);

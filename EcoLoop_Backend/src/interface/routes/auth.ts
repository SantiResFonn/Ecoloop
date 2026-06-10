import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const authRouter = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@ecoloop.com
 *               password:
 *                 type: string
 *                 example: user123
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Credenciales inválidas
 */
authRouter.post("/login", authController.login);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Creado
 */
authRouter.post("/register", authController.register);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.get("/me", authMiddleware, authController.me);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post("/logout", authMiddleware, authController.logout);

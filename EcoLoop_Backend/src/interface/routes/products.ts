import { Router } from "express";
import { productsController } from "../controllers/ProductsController";
import { authMiddleware, adminMiddleware } from "../../infrastructure/security/auth";

export const productsRouter = Router();

/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos
 */
productsRouter.get("/", productsController.list);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Products]
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
productsRouter.get("/:id", productsController.getById);

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, points_cost, category]
 *             properties:
 *               name:
 *                 type: string
 *               points_cost:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Creado
 */
productsRouter.post("/", authMiddleware, adminMiddleware, productsController.create);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Products]
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
productsRouter.put("/:id", authMiddleware, adminMiddleware, productsController.update);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
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
productsRouter.delete("/:id", authMiddleware, adminMiddleware, productsController.delete);

import { Request, Response } from "express";
import { ListProductsUseCase } from "../../application/use-cases/products/ListProductsUseCase";
import { CreateProductUseCase } from "../../application/use-cases/products/CreateProductUseCase";
import { GetProductByIdUseCase } from "../../application/use-cases/products/GetProductByIdUseCase";
import { UpdateProductUseCase } from "../../application/use-cases/products/UpdateProductUseCase";
import { DeleteProductUseCase } from "../../application/use-cases/products/DeleteProductUseCase";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";

export class ProductsController {
  private listProductsUseCase = new ListProductsUseCase(productsRepository);
  private getProductByIdUseCase = new GetProductByIdUseCase(productsRepository);
  private createProductUseCase = new CreateProductUseCase(productsRepository);
  private updateProductUseCase = new UpdateProductUseCase(productsRepository);
  private deleteProductUseCase = new DeleteProductUseCase(productsRepository);

  list = async (req: Request, res: Response) => {
    try {
      const available = req.query.available === "true";
      const category = req.query.category as string | undefined;
      const data = await this.listProductsUseCase.execute({
        available: req.query.available ? available : undefined,
        category,
      });
      return res.json(data);
    } catch (err: any) {
      if (err instanceof ValidationError || err?.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err?.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await this.getProductByIdUseCase.execute(req.params.id);
      if (!data) return res.status(404).json({ error: "Producto no encontrado" });
      return res.json(data);
    } catch (err: any) {
      if (err instanceof ValidationError || err?.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      if (
        err?.code === "P2025" ||
        err instanceof NotFoundError ||
        err?.name === "NotFoundError" ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      return res.status(500).json({ error: err?.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, description, points_cost, stock, category, image_url, is_available } = req.body;
      const data = await this.createProductUseCase.execute({
        name,
        description,
        points_cost,
        stock,
        category,
        image_url,
        is_available,
      });
      return res.status(201).json(data);
    } catch (err: any) {
      if (err instanceof ValidationError || err?.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err?.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.updateProductUseCase.execute(id, req.body);
      return res.json(data);
    } catch (err: any) {
      if (err instanceof ValidationError || err?.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      if (
        err?.code === "P2025" ||
        err instanceof NotFoundError ||
        err?.name === "NotFoundError" ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      return res.status(500).json({ error: err?.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteProductUseCase.execute(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      if (err instanceof ValidationError || err?.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
      }
      if (err?.code === "P2003") {
        return res.status(400).json({ error: "No se puede eliminar el producto porque está asociado a transacciones de canje" });
      }
      if (
        err?.code === "P2025" ||
        err instanceof NotFoundError ||
        err?.name === "NotFoundError" ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      return res.status(500).json({ error: err?.message });
    }
  };
}

export const productsController = new ProductsController();



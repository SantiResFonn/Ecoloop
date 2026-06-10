import { describe, it, expect, vi } from "vitest";
import { UpdateProductUseCase } from "./UpdateProductUseCase";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { Product } from "../../../domain/entities";
import { ValidationError } from "../../../domain/errors";

describe("UpdateProductUseCase", () => {
  it("should update product successfully with provided fields and set updated_at", async () => {
    const mockProduct: Product = {
      id: "prod-123",
      name: "Camiseta Ecológica Actualizada",
      description: "Hecha de algodón orgánico mejorado",
      points_cost: 120,
      image_url: "http://example.com/image.jpg",
      stock: 12,
      category: "Ropa",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      updateProduct: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);
    const updateData = {
      name: "Camiseta Ecológica Actualizada",
      description: "Hecha de algodón orgánico mejorado",
      points_cost: 120,
      stock: 12,
    };

    const result = await useCase.execute("prod-123", updateData);

    expect(mockRepo.updateProduct).toHaveBeenCalledWith(
      "prod-123",
      expect.objectContaining({
        ...updateData,
        updated_at: expect.any(Date),
      })
    );
    expect(result).toEqual(mockProduct);
  });

  it("should trim name when updating product", async () => {
    const mockProduct: Product = {
      id: "prod-123",
      name: "Camiseta Ecológica Actualizada",
      description: "Hecha de algodón orgánico mejorado",
      points_cost: 120,
      image_url: "http://example.com/image.jpg",
      stock: 12,
      category: "Ropa",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      updateProduct: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);
    await useCase.execute("prod-123", { name: "  New Name  " });

    expect(mockRepo.updateProduct).toHaveBeenCalledWith(
      "prod-123",
      expect.objectContaining({
        name: "New Name",
        updated_at: expect.any(Date),
      })
    );
  });

  it("should throw a ValidationError if points_cost is negative when updating", async () => {
    const mockRepo = {
      updateProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123", { points_cost: -10 })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.updateProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if points_cost is not an integer when updating", async () => {
    const mockRepo = {
      updateProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123", { points_cost: 10.5 })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.updateProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if stock is negative when updating", async () => {
    const mockRepo = {
      updateProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123", { stock: -1 })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.updateProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if stock is not an integer when updating", async () => {
    const mockRepo = {
      updateProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123", { stock: 5.5 })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.updateProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if name is empty or only whitespace when updating", async () => {
    const mockRepo = {
      updateProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123", { name: "   " })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.updateProduct).not.toHaveBeenCalled();
  });

  it("should propagate error when repository throws", async () => {
    const mockRepo = {
      updateProduct: vi.fn().mockRejectedValue(new Error("Producto no encontrado")),
    } as unknown as IProductsRepository;

    const useCase = new UpdateProductUseCase(mockRepo);

    await expect(
      useCase.execute("prod-123", { name: "New Name" })
    ).rejects.toThrow("Producto no encontrado");

    expect(mockRepo.updateProduct).toHaveBeenCalled();
  });
});

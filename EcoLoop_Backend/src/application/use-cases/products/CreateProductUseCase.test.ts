import { describe, it, expect, vi } from "vitest";
import { CreateProductUseCase } from "./CreateProductUseCase";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { Product } from "../../../domain/entities";
import { ValidationError } from "../../../domain/errors";

describe("CreateProductUseCase", () => {
  it("should create a product successfully with provided fields and default stock to 0 if not provided", async () => {
    const mockProduct: Product = {
      id: "prod-123",
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      image_url: "http://example.com/image.jpg",
      stock: 0,
      category: "Ropa",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      listProducts: vi.fn(),
      getProductById: vi.fn(),
      createProduct: vi.fn().mockResolvedValue(mockProduct),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
    } as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);
    const data = {
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      category: "Ropa",
      image_url: "http://example.com/image.jpg",
    };

    const result = await useCase.execute(data);

    expect(mockRepo.createProduct).toHaveBeenCalledWith({
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      stock: 0,
      category: "Ropa",
      image_url: "http://example.com/image.jpg",
      is_available: undefined,
    });
    expect(result).toEqual(mockProduct);
  });

  it("should create a product successfully with a specific stock", async () => {
    const mockProduct: Product = {
      id: "prod-123",
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      image_url: "http://example.com/image.jpg",
      stock: 15,
      category: "Ropa",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      createProduct: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);
    const data = {
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      stock: 15,
      category: "Ropa",
      image_url: "http://example.com/image.jpg",
      is_available: true,
    };

    const result = await useCase.execute(data);

    expect(mockRepo.createProduct).toHaveBeenCalledWith({
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      stock: 15,
      category: "Ropa",
      image_url: "http://example.com/image.jpg",
      is_available: true,
    });
    expect(result).toEqual(mockProduct);
  });

  it("should throw a ValidationError if name is missing", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "", points_cost: 100, category: "Ropa" })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if name consists only of whitespace", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "   ", points_cost: 100, category: "Ropa" })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should trim whitespace from the name when creating", async () => {
    const mockProduct: Product = {
      id: "prod-123",
      name: "Camiseta Ecológica",
      description: "Hecha de algodón orgánico",
      points_cost: 100,
      image_url: "http://example.com/image.jpg",
      stock: 0,
      category: "Ropa",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      createProduct: vi.fn().mockResolvedValue(mockProduct),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);
    await useCase.execute({
      name: "   Camiseta Ecológica   ",
      points_cost: 100,
      category: "Ropa",
    });

    expect(mockRepo.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Camiseta Ecológica",
      })
    );
  });

  it("should throw a ValidationError if points_cost is missing", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: undefined as any, category: "Ropa" })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if category is missing", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: 100, category: "" })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if points_cost is negative", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: -50, category: "Ropa" })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if points_cost is not an integer", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: 10.5, category: "Ropa" })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if stock is negative", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: 100, category: "Ropa", stock: -5 })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should throw a ValidationError if stock is not an integer", async () => {
    const mockRepo = {
      createProduct: vi.fn(),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: 100, category: "Ropa", stock: 5.5 })
    ).rejects.toThrowError(ValidationError);

    expect(mockRepo.createProduct).not.toHaveBeenCalled();
  });

  it("should propagate error when repository throws", async () => {
    const mockRepo = {
      createProduct: vi.fn().mockRejectedValue(new Error("Database connection error")),
    } as unknown as IProductsRepository;

    const useCase = new CreateProductUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Camiseta", points_cost: 100, category: "Ropa" })
    ).rejects.toThrow("Database connection error");

    expect(mockRepo.createProduct).toHaveBeenCalled();
  });
});

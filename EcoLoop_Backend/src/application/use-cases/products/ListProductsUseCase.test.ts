import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListProductsUseCase } from "./ListProductsUseCase";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { Product } from "../../../domain/entities";

describe("ListProductsUseCase", () => {
  const mockProductsRepo = {
    listProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  } as unknown as IProductsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProducts: Product[] = [
    {
      id: "product-1",
      name: "Reusable Bottle",
      description: "A durable glass bottle",
      points_cost: 100,
      image_url: null,
      stock: 50,
      category: "kitchen",
      is_available: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "product-2",
      name: "Tote Bag",
      description: "Organic cotton bag",
      points_cost: 50,
      image_url: null,
      stock: 0,
      category: "bags",
      is_available: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  it("should list all products when no filter is provided", async () => {
    const useCase = new ListProductsUseCase(mockProductsRepo);

    vi.mocked(mockProductsRepo.listProducts).mockResolvedValueOnce(mockProducts);

    const result = await useCase.execute();

    expect(mockProductsRepo.listProducts).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockProducts);
  });

  it("should list products filtered by availability when availability filter is provided", async () => {
    const useCase = new ListProductsUseCase(mockProductsRepo);

    const availableProducts = mockProducts.filter(p => p.is_available === true);
    vi.mocked(mockProductsRepo.listProducts).mockResolvedValueOnce(availableProducts);

    const result = await useCase.execute({ available: true });

    expect(mockProductsRepo.listProducts).toHaveBeenCalledWith({ available: true });
    expect(result).toEqual(availableProducts);
  });

  it("should list products filtered by category when category filter is provided", async () => {
    const useCase = new ListProductsUseCase(mockProductsRepo);

    const kitchenProducts = mockProducts.filter(p => p.category === "kitchen");
    vi.mocked(mockProductsRepo.listProducts).mockResolvedValueOnce(kitchenProducts);

    const result = await useCase.execute({ category: "kitchen" });

    expect(mockProductsRepo.listProducts).toHaveBeenCalledWith({ category: "kitchen" });
    expect(result).toEqual(kitchenProducts);
  });

  it("should list products filtered by both availability and category when both are provided", async () => {
    const useCase = new ListProductsUseCase(mockProductsRepo);

    const filteredProducts = mockProducts.filter(p => p.is_available === true && p.category === "kitchen");
    vi.mocked(mockProductsRepo.listProducts).mockResolvedValueOnce(filteredProducts);

    const result = await useCase.execute({ available: true, category: "kitchen" });

    expect(mockProductsRepo.listProducts).toHaveBeenCalledWith({ available: true, category: "kitchen" });
    expect(result).toEqual(filteredProducts);
  });
});

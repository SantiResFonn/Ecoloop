import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedeemProductUseCase } from "./RedeemProductUseCase";
import { IRedemptionsRepository } from "../../../domain/repositories/IRedemptionsRepository";
import { IProductsRepository } from "../../../domain/repositories/IProductsRepository";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ValidationError, NotFoundError } from "../../../domain/errors";

describe("RedeemProductUseCase", () => {
  let redemptionsRepoMock: IRedemptionsRepository;
  let productsRepoMock: IProductsRepository;
  let profilesRepoMock: IProfilesRepository;
  let useCase: RedeemProductUseCase;

  beforeEach(() => {
    redemptionsRepoMock = {
      createRedemption: vi.fn(),
      listRedemptions: vi.fn(),
    } as any;

    productsRepoMock = {
      getProductById: vi.fn(),
      updateProduct: vi.fn(),
      listProducts: vi.fn(),
      createProduct: vi.fn(),
      deleteProduct: vi.fn(),
    } as any;

    profilesRepoMock = {
      getProfileById: vi.fn(),
      updateProfile: vi.fn(),
      listProfiles: vi.fn(),
      createProfile: vi.fn(),
    } as any;

    useCase = new RedeemProductUseCase(redemptionsRepoMock, productsRepoMock, profilesRepoMock);
  });

  it("should successfully redeem a product", async () => {
    const mockProduct = {
      id: "prod-123",
      name: "Cuaderno",
      points_cost: 50,
      stock: 10,
      is_available: true,
    };
    const mockUser = {
      id: "user-123",
      eco_points: 150,
    };
    const mockRedemption = {
      id: "red-123",
      user_id: "user-123",
      product_id: "prod-123",
      points_spent: 50,
      quantity: 1,
      status: "pending",
    };

    vi.mocked(productsRepoMock.getProductById).mockResolvedValue(mockProduct as any);
    vi.mocked(profilesRepoMock.getProfileById).mockResolvedValue(mockUser as any);
    vi.mocked(redemptionsRepoMock.createRedemption).mockResolvedValue(mockRedemption as any);

    const result = await useCase.execute("user-123", "prod-123", 1);

    expect(result).toBe(mockRedemption);
    expect(productsRepoMock.getProductById).toHaveBeenCalledWith("prod-123");
    expect(profilesRepoMock.getProfileById).toHaveBeenCalledWith("user-123");
    
    // Points deduction verification (150 - 50 = 100)
    expect(profilesRepoMock.updateProfile).toHaveBeenCalledWith("user-123", { eco_points: 100 });
    
    // Stock reduction verification (10 - 1 = 9)
    expect(productsRepoMock.updateProduct).toHaveBeenCalledWith("prod-123", { stock: 9, is_available: true });
    
    expect(redemptionsRepoMock.createRedemption).toHaveBeenCalledWith({
      user_id: "user-123",
      product_id: "prod-123",
      points_spent: 50,
      quantity: 1,
      status: "pending",
    });
  });

  it("should throw ValidationError if points are insufficient", async () => {
    const mockProduct = {
      id: "prod-123",
      name: "Cuaderno",
      points_cost: 50,
      stock: 10,
      is_available: true,
    };
    const mockUser = {
      id: "user-123",
      eco_points: 30,
    };

    vi.mocked(productsRepoMock.getProductById).mockResolvedValue(mockProduct as any);
    vi.mocked(profilesRepoMock.getProfileById).mockResolvedValue(mockUser as any);

    await expect(useCase.execute("user-123", "prod-123", 1)).rejects.toThrow(ValidationError);
    expect(profilesRepoMock.updateProfile).not.toHaveBeenCalled();
    expect(productsRepoMock.updateProduct).not.toHaveBeenCalled();
    expect(redemptionsRepoMock.createRedemption).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if product is out of stock", async () => {
    const mockProduct = {
      id: "prod-123",
      name: "Cuaderno",
      points_cost: 50,
      stock: 0,
      is_available: false,
    };
    const mockUser = {
      id: "user-123",
      eco_points: 100,
    };

    vi.mocked(productsRepoMock.getProductById).mockResolvedValue(mockProduct as any);
    vi.mocked(profilesRepoMock.getProfileById).mockResolvedValue(mockUser as any);

    await expect(useCase.execute("user-123", "prod-123", 1)).rejects.toThrow(ValidationError);
  });

  it("should throw NotFoundError if product does not exist", async () => {
    vi.mocked(productsRepoMock.getProductById).mockResolvedValue(null);

    await expect(useCase.execute("user-123", "prod-123", 1)).rejects.toThrow(NotFoundError);
  });

  it("should throw NotFoundError if user does not exist", async () => {
    const mockProduct = {
      id: "prod-123",
      name: "Cuaderno",
      points_cost: 50,
      stock: 10,
      is_available: true,
    };

    vi.mocked(productsRepoMock.getProductById).mockResolvedValue(mockProduct as any);
    vi.mocked(profilesRepoMock.getProfileById).mockResolvedValue(null);

    await expect(useCase.execute("user-123", "prod-123", 1)).rejects.toThrow(NotFoundError);
  });
});

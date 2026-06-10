import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateProfileUseCase } from "./UpdateProfileUseCase";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ValidationError } from "../../../domain/errors";
import { Profile } from "../../../domain/entities";

describe("UpdateProfileUseCase", () => {
  const mockProfilesRepo = {
    listProfiles: vi.fn(),
    getProfileById: vi.fn(),
    findProfileByEmail: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
  } as unknown as IProfilesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully update profile and append updated_at", async () => {
    const useCase = new UpdateProfileUseCase(mockProfilesRepo);
    const mockProfile: Profile = {
      id: "1",
      email: "updated@example.com",
      password_hash: "hash1",
      full_name: "Updated Name",
      role: "worker",
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.updateProfile).mockResolvedValueOnce(mockProfile);

    const updateData = {
      email: "updated@example.com",
      full_name: "Updated Name",
      role: "worker",
      eco_points: 50,
    };

    const result = await useCase.execute("1", updateData);

    expect(mockProfilesRepo.updateProfile).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        email: "updated@example.com",
        full_name: "Updated Name",
        role: "worker",
        eco_points: 50,
        updated_at: expect.any(Date),
      })
    );
    expect(result).toEqual(mockProfile);
  });

  it("should throw ValidationError if eco_points is negative", async () => {
    const useCase = new UpdateProfileUseCase(mockProfilesRepo);

    await expect(
      useCase.execute("1", { eco_points: -10 })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute("1", { eco_points: -10 })
    ).rejects.toThrow("Los puntos ecológicos no pueden ser negativos");

    expect(mockProfilesRepo.updateProfile).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if eco_points is not an integer", async () => {
    const useCase = new UpdateProfileUseCase(mockProfilesRepo);

    await expect(
      useCase.execute("1", { eco_points: 10.5 })
    ).rejects.toThrow(ValidationError);

    await expect(
      useCase.execute("1", { eco_points: 10.5 })
    ).rejects.toThrow("Los puntos ecológicos deben ser un número entero");

    expect(mockProfilesRepo.updateProfile).not.toHaveBeenCalled();
  });

  it("should strip out non-whitelisted fields (like password_hash or id) to prevent mass assignment", async () => {
    const useCase = new UpdateProfileUseCase(mockProfilesRepo);
    const mockProfile: Profile = {
      id: "1",
      email: "updated@example.com",
      password_hash: "hash1",
      full_name: "Updated Name",
      role: "worker",
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.updateProfile).mockResolvedValueOnce(mockProfile);

    const updateData = {
      email: "updated@example.com",
      full_name: "Updated Name",
      role: "worker",
      eco_points: 50,
      password_hash: "malicious_hash",
      id: "malicious_id",
      created_at: new Date(),
    } as any;

    await useCase.execute("1", updateData);

    expect(mockProfilesRepo.updateProfile).toHaveBeenCalledWith(
      "1",
      {
        email: "updated@example.com",
        full_name: "Updated Name",
        role: "worker",
        eco_points: 50,
        updated_at: expect.any(Date),
      }
    );
  });

  it("should propagate database failures or not found errors", async () => {
    const useCase = new UpdateProfileUseCase(mockProfilesRepo);
    const dbError = new Error("Database connection failed");

    vi.mocked(mockProfilesRepo.updateProfile).mockRejectedValueOnce(dbError);

    await expect(
      useCase.execute("1", { full_name: "Name" })
    ).rejects.toThrow(dbError);

    expect(mockProfilesRepo.updateProfile).toHaveBeenCalled();
  });
});

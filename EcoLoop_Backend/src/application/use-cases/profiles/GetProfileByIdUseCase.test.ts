import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetProfileByIdUseCase } from "./GetProfileByIdUseCase";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { Profile } from "../../../domain/entities";

describe("GetProfileByIdUseCase", () => {
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

  it("should return a profile by ID if it exists", async () => {
    const useCase = new GetProfileByIdUseCase(mockProfilesRepo);
    const mockProfile: Profile = {
      id: "1",
      email: "test@example.com",
      password_hash: "hash1",
      full_name: "Test User",
      role: "user",
      eco_points: 10,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.getProfileById).mockResolvedValueOnce(mockProfile);

    const result = await useCase.execute("1");

    expect(mockProfilesRepo.getProfileById).toHaveBeenCalledWith("1");
    expect(result).toEqual(mockProfile);
  });

  it("should return null if the profile does not exist", async () => {
    const useCase = new GetProfileByIdUseCase(mockProfilesRepo);

    vi.mocked(mockProfilesRepo.getProfileById).mockResolvedValueOnce(null);

    const result = await useCase.execute("non-existent-id");

    expect(mockProfilesRepo.getProfileById).toHaveBeenCalledWith("non-existent-id");
    expect(result).toBeNull();
  });
});

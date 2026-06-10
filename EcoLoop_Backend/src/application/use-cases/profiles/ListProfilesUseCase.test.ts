import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListProfilesUseCase } from "./ListProfilesUseCase";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { Profile } from "../../../domain/entities";

describe("ListProfilesUseCase", () => {
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

  it("should return a list of all profiles when no filter is provided", async () => {
    const useCase = new ListProfilesUseCase(mockProfilesRepo);
    const mockProfiles: Profile[] = [
      {
        id: "1",
        email: "test1@example.com",
        password_hash: "hash1",
        full_name: "Test User 1",
        role: "user",
        eco_points: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2",
        email: "test2@example.com",
        password_hash: "hash2",
        full_name: "Test User 2",
        role: "admin",
        eco_points: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(mockProfilesRepo.listProfiles).mockResolvedValueOnce(mockProfiles);

    const result = await useCase.execute();

    expect(mockProfilesRepo.listProfiles).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockProfiles);
  });

  it("should filter profiles by role when role is provided", async () => {
    const useCase = new ListProfilesUseCase(mockProfilesRepo);
    const mockProfiles: Profile[] = [
      {
        id: "1",
        email: "test1@example.com",
        password_hash: "hash1",
        full_name: "Test User 1",
        role: "user",
        eco_points: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(mockProfilesRepo.listProfiles).mockResolvedValueOnce(mockProfiles);

    const filter = { role: "user" };
    const result = await useCase.execute(filter);

    expect(mockProfilesRepo.listProfiles).toHaveBeenCalledWith(filter);
    expect(result).toEqual(mockProfiles);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "./LoginUseCase";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ISecurityService } from "../../../domain/services/ISecurityService";
import { Profile } from "../../../domain/entities";

describe("LoginUseCase", () => {
  const mockProfilesRepo = {
    listProfiles: vi.fn(),
    getProfileById: vi.fn(),
    findProfileByEmail: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
  } as unknown as IProfilesRepository;

  const mockSecurityService = {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
    generateToken: vi.fn(),
  } as unknown as ISecurityService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully with correct email and password", async () => {
    const useCase = new LoginUseCase(mockProfilesRepo, mockSecurityService);
    
    const mockProfile: Profile = {
      id: "user-123",
      email: "test@example.com",
      password_hash: "hashed_password",
      full_name: "Test User",
      role: "user",
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.findProfileByEmail).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockSecurityService.verifyPassword).mockResolvedValueOnce(true);
    vi.mocked(mockSecurityService.generateToken).mockReturnValueOnce("mocked_jwt_token");

    const result = await useCase.execute("test@example.com", "correct_password");

    expect(mockProfilesRepo.findProfileByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockSecurityService.verifyPassword).toHaveBeenCalledWith("correct_password", "hashed_password");
    expect(mockSecurityService.generateToken).toHaveBeenCalledWith({
      userId: "user-123",
      email: "test@example.com",
      role: "user",
    });

    expect(result).toEqual({
      token: "mocked_jwt_token",
      user: {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        role: "user",
        eco_points: 50,
      },
    });
  });

  it("should throw an error when email is empty", async () => {
    const useCase = new LoginUseCase(mockProfilesRepo, mockSecurityService);

    await expect(useCase.execute("", "password")).rejects.toThrow("email y password son requeridos");
    expect(mockProfilesRepo.findProfileByEmail).not.toHaveBeenCalled();
  });

  it("should throw an error when password is empty", async () => {
    const useCase = new LoginUseCase(mockProfilesRepo, mockSecurityService);

    await expect(useCase.execute("test@example.com", "")).rejects.toThrow("email y password son requeridos");
    expect(mockProfilesRepo.findProfileByEmail).not.toHaveBeenCalled();
  });

  it("should throw an error when email is not found", async () => {
    const useCase = new LoginUseCase(mockProfilesRepo, mockSecurityService);

    vi.mocked(mockProfilesRepo.findProfileByEmail).mockResolvedValueOnce(null);

    await expect(useCase.execute("notfound@example.com", "password")).rejects.toThrow("Credenciales inválidas");
    expect(mockProfilesRepo.findProfileByEmail).toHaveBeenCalledWith("notfound@example.com");
    expect(mockSecurityService.verifyPassword).not.toHaveBeenCalled();
  });

  it("should throw an error when password verification fails", async () => {
    const useCase = new LoginUseCase(mockProfilesRepo, mockSecurityService);

    const mockProfile: Profile = {
      id: "user-123",
      email: "test@example.com",
      password_hash: "hashed_password",
      full_name: "Test User",
      role: "user",
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.findProfileByEmail).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockSecurityService.verifyPassword).mockResolvedValueOnce(false);

    await expect(useCase.execute("test@example.com", "wrong_password")).rejects.toThrow("Credenciales inválidas");
    expect(mockProfilesRepo.findProfileByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockSecurityService.verifyPassword).toHaveBeenCalledWith("wrong_password", "hashed_password");
    expect(mockSecurityService.generateToken).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterUseCase } from "./RegisterUseCase";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { ISecurityService } from "../../../domain/services/ISecurityService";
import { Profile } from "../../../domain/entities";

describe("RegisterUseCase", () => {
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

  it("should register a new profile successfully", async () => {
    const useCase = new RegisterUseCase(mockProfilesRepo, mockSecurityService);

    const mockProfile: Profile = {
      id: "user-123",
      email: "newuser@example.com",
      password_hash: "hashed_password",
      full_name: "New User",
      role: "user",
      eco_points: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.findProfileByEmail).mockResolvedValueOnce(null);
    vi.mocked(mockSecurityService.hashPassword).mockResolvedValueOnce("hashed_password");
    vi.mocked(mockProfilesRepo.createProfile).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockSecurityService.generateToken).mockReturnValueOnce("mocked_jwt_token");

    const result = await useCase.execute("newuser@example.com", "validpassword", "New User");

    expect(mockProfilesRepo.findProfileByEmail).toHaveBeenCalledWith("newuser@example.com");
    expect(mockSecurityService.hashPassword).toHaveBeenCalledWith("validpassword");
    expect(mockProfilesRepo.createProfile).toHaveBeenCalledWith({
      email: "newuser@example.com",
      password_hash: "hashed_password",
      full_name: "New User",
      role: "user",
    });
    expect(mockSecurityService.generateToken).toHaveBeenCalledWith({
      userId: "user-123",
      email: "newuser@example.com",
      role: "user",
    });

    expect(result).toEqual({
      token: "mocked_jwt_token",
      user: {
        id: "user-123",
        email: "newuser@example.com",
        full_name: "New User",
        role: "user",
        eco_points: 0,
      },
    });
  });

  it("should fall back to email username if fullName is not provided", async () => {
    const useCase = new RegisterUseCase(mockProfilesRepo, mockSecurityService);

    const mockProfile: Profile = {
      id: "user-123",
      email: "john.doe@example.com",
      password_hash: "hashed_password",
      full_name: "john.doe",
      role: "user",
      eco_points: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.findProfileByEmail).mockResolvedValueOnce(null);
    vi.mocked(mockSecurityService.hashPassword).mockResolvedValueOnce("hashed_password");
    vi.mocked(mockProfilesRepo.createProfile).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockSecurityService.generateToken).mockReturnValueOnce("mocked_jwt_token");

    const result = await useCase.execute("john.doe@example.com", "validpassword");

    expect(mockProfilesRepo.createProfile).toHaveBeenCalledWith({
      email: "john.doe@example.com",
      password_hash: "hashed_password",
      full_name: "john.doe",
      role: "user",
    });
    expect(result.user.full_name).toBe("john.doe");
  });

  it("should throw an error when email is empty", async () => {
    const useCase = new RegisterUseCase(mockProfilesRepo, mockSecurityService);

    await expect(useCase.execute("", "password")).rejects.toThrow("email y password son requeridos");
    expect(mockProfilesRepo.findProfileByEmail).not.toHaveBeenCalled();
    expect(mockSecurityService.hashPassword).not.toHaveBeenCalled();
  });

  it("should throw an error when password is empty", async () => {
    const useCase = new RegisterUseCase(mockProfilesRepo, mockSecurityService);

    await expect(useCase.execute("test@example.com", "")).rejects.toThrow("email y password son requeridos");
    expect(mockProfilesRepo.findProfileByEmail).not.toHaveBeenCalled();
    expect(mockSecurityService.hashPassword).not.toHaveBeenCalled();
  });

  it("should throw an error when password is less than 6 characters", async () => {
    const useCase = new RegisterUseCase(mockProfilesRepo, mockSecurityService);

    await expect(useCase.execute("test@example.com", "12345")).rejects.toThrow(
      "La contraseña debe tener al menos 6 caracteres"
    );
    expect(mockProfilesRepo.findProfileByEmail).not.toHaveBeenCalled();
    expect(mockSecurityService.hashPassword).not.toHaveBeenCalled();
  });

  it("should throw an error when email is already registered", async () => {
    const useCase = new RegisterUseCase(mockProfilesRepo, mockSecurityService);

    const mockProfile: Profile = {
      id: "user-123",
      email: "existing@example.com",
      password_hash: "hashed_password",
      full_name: "Existing User",
      role: "user",
      eco_points: 10,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockProfilesRepo.findProfileByEmail).mockResolvedValueOnce(mockProfile);

    await expect(useCase.execute("existing@example.com", "password123")).rejects.toThrow(
      "El email ya está registrado"
    );
    expect(mockProfilesRepo.findProfileByEmail).toHaveBeenCalledWith("existing@example.com");
    expect(mockSecurityService.hashPassword).not.toHaveBeenCalled();
    expect(mockProfilesRepo.createProfile).not.toHaveBeenCalled();
  });
});

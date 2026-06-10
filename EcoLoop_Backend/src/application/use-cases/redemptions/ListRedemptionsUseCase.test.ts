import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListRedemptionsUseCase } from "./ListRedemptionsUseCase";
import { IRedemptionsRepository } from "../../../domain/repositories/IRedemptionsRepository";

describe("ListRedemptionsUseCase", () => {
  let redemptionsRepoMock: IRedemptionsRepository;
  let useCase: ListRedemptionsUseCase;

  beforeEach(() => {
    redemptionsRepoMock = {
      createRedemption: vi.fn(),
      listRedemptions: vi.fn(),
    } as any;

    useCase = new ListRedemptionsUseCase(redemptionsRepoMock);
  });

  it("should list all redemptions when no filter is provided", async () => {
    const mockRedemptions = [
      { id: "red-1", points_spent: 50 },
      { id: "red-2", points_spent: 30 }
    ];
    vi.mocked(redemptionsRepoMock.listRedemptions).mockResolvedValue(mockRedemptions as any);

    const result = await useCase.execute();

    expect(result).toBe(mockRedemptions);
    expect(redemptionsRepoMock.listRedemptions).toHaveBeenCalledWith(undefined);
  });

  it("should list redemptions for a specific user when userId is provided", async () => {
    const mockRedemptions = [
      { id: "red-1", user_id: "user-123", points_spent: 50 }
    ];
    vi.mocked(redemptionsRepoMock.listRedemptions).mockResolvedValue(mockRedemptions as any);

    const result = await useCase.execute("user-123");

    expect(result).toBe(mockRedemptions);
    expect(redemptionsRepoMock.listRedemptions).toHaveBeenCalledWith("user-123");
  });
});

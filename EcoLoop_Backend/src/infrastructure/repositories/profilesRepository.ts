import { IProfilesRepository } from "../../domain/repositories/IProfilesRepository";
import { Profile } from "../../domain/entities";
import prisma from "../db/prismaClient";
import { NotFoundError } from "../../domain/errors";

export class PrismaProfilesRepository implements IProfilesRepository {
  async listProfiles(filter?: { role?: string }): Promise<Profile[]> {
    const where: any = {};
    if (filter?.role) where.role = filter.role;
    return prisma.profiles.findMany({ where, orderBy: { created_at: "desc" } }) as any;
  }

  async getProfileById(id: string): Promise<Profile | null> {
    return prisma.profiles.findUnique({ where: { id } }) as any;
  }

  async findProfileByEmail(email: string): Promise<Profile | null> {
    return prisma.profiles.findFirst({ where: { email } }) as any;
  }

  async createProfile(data: {
    email: string;
    password_hash: string;
    full_name?: string | null;
    role?: string;
    eco_points?: number;
  }): Promise<Profile> {
    return prisma.profiles.create({
      data: {
        email: data.email,
        password_hash: data.password_hash,
        full_name: data.full_name ?? null,
        role: (data.role as any) ?? "user",
        eco_points: data.eco_points ?? 0,
      },
    }) as any;
  }

  async updateProfile(
    id: string,
    data: Partial<Omit<Profile, "id" | "password_hash" | "created_at" | "updated_at">> & { updated_at?: Date }
  ): Promise<Profile> {
    try {
      return await prisma.profiles.update({ where: { id }, data }) as any;
    } catch (error: any) {
      if (error && (error.code === "P2025" || error.name === "NotFoundError")) {
        throw new NotFoundError("Perfil no encontrado");
      }
      throw error;
    }
  }
}

export const profilesRepository = new PrismaProfilesRepository();
export default profilesRepository;

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile() {
    try {
      return await this.prisma.profile.findFirstOrThrow({
        include: {
          links: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
          experiences: {
            orderBy: { order: 'asc' },
            include: {
              achievements: { orderBy: { order: 'asc' } },
            },
          },
          projects: { orderBy: { order: 'asc' } },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('Profile not found. Seed may have failed.');
      }
      throw e;
    }
  }
}
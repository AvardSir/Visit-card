import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: { profile: { findFirstOrThrow: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      profile: {
        findFirstOrThrow: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  it('calls findFirstOrThrow with full include and orderBy asc on every list relation', async () => {
    const fakeProfile = { id: 'profile-main' };
    prisma.profile.findFirstOrThrow.mockResolvedValue(fakeProfile);

    const result = await service.getProfile();

    expect(prisma.profile.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prisma.profile.findFirstOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          links: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
          experiences: {
            orderBy: { order: 'asc' },
            include: { achievements: { orderBy: { order: 'asc' } } },
          },
          projects: { orderBy: { order: 'asc' } },
        }),
      }),
    );
    expect(result).toBe(fakeProfile);
  });

  it('maps Prisma P2025 to NotFoundException with "Profile not found" message', async () => {
    const p2025 = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.22.0',
    });
    prisma.profile.findFirstOrThrow.mockRejectedValue(p2025);

    await expect(service.getProfile()).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getProfile()).rejects.toThrow(/Profile not found/i);
  });

  it('rethrows non-P2025 errors untouched', async () => {
    const boom = new Error('connection lost');
    prisma.profile.findFirstOrThrow.mockRejectedValue(boom);

    await expect(service.getProfile()).rejects.toBe(boom);
  });
});
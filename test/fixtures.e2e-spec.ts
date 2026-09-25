import { PrismaClient } from '@prisma/client';
import { seedTestProfile, clearTestProfile } from './fixtures';

describe('fixtures (smoke)', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await clearTestProfile(prisma);
    await prisma.$disconnect();
  });

  it('seeds idempotently and clears', async () => {
    await seedTestProfile(prisma);
    await seedTestProfile(prisma); // повторный вызов не должен плодить записи

    const profileCount = await prisma.profile.count({ where: { id: 'test-profile' } });
    expect(profileCount).toBe(1);

    await clearTestProfile(prisma);
    const after = await prisma.profile.count({ where: { id: 'test-profile' } });
    expect(after).toBe(0);
  });
});
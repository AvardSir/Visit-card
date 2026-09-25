import { PrismaClient } from '@prisma/client';

const PROFILE_ID = 'test-profile';

export async function seedTestProfile(prisma: PrismaClient): Promise<void> {
  // Фиксированные id с префиксом test- — изоляция от prisma/seed.ts и идемпотентность.
  // Upsert по profile.id: повторный вызов не плодит записи (грабля #2 в тестовом контексте).
  await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    update: {},
    create: {
      id: PROFILE_ID,
      name: 'E2E Test User',
      description: 'Fixture profile for E2E tests.',
      links: {
        create: [
          { id: 'test-link-gh', label: 'GitHub', url: 'https://github.com/test', order: 0 },
        ],
      },
      skills: {
        create: [
          { id: 'test-skill-ts', name: 'TypeScript', category: 'backend', order: 0 },
          // Граничный случай: category = null (§10).
          { id: 'test-skill-nocat', name: 'Linux', category: null, order: 10 },
        ],
      },
      experiences: {
        create: [
          {
            id: 'test-exp-current',
            company: 'Test Co',
            position: 'Engineer',
            startDate: new Date('2024-01-01T00:00:00Z'),
            endDate: null, // Граничный случай: текущая работа без даты окончания (§10).
            order: 0,
            achievements: {
              create: [{ id: 'test-ach-1', text: 'Did a thing', order: 0 }],
            },
          },
          {
            id: 'test-exp-empty',
            company: 'Old Co',
            position: 'Junior',
            startDate: new Date('2022-01-01T00:00:00Z'),
            endDate: new Date('2023-01-01T00:00:00Z'),
            order: 10,
            // Граничный случай: опыт без достижений — должно вернуться [] (§10).
          },
        ],
      },
      projects: {
        create: [
          { id: 'test-project-main', name: 'Main', url: 'https://example.com/main', description: 'Main project', order: 0 },
          // Граничные случаи: url = null, description = null (§10).
          { id: 'test-project-empty', name: 'No URL', url: null, description: null, order: 10 },
        ],
      },
    },
  });
}

export async function clearTestProfile(prisma: PrismaClient): Promise<void> {
  // Cascade удалит links/skills/experiences/achievements/projects (onDelete: Cascade в схеме).
  await prisma.profile.deleteMany({ where: { id: PROFILE_ID } });
}
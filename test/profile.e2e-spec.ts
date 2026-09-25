import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { seedTestProfile, clearTestProfile } from './fixtures';

const PROFILE_QUERY = `
  query Profile {
    profile {
      id
      name
      description
      links { id label url }
      skills { id name category }
      experiences {
        id
        company
        position
        startDate
        endDate
        achievements { id text }
      }
      projects { id name url description }
    }
  }
`;

describe('profile query (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await clearTestProfile(prisma);
    await app.close();
  });

  beforeEach(async () => {
    // Явная изоляция: каждый тест начинается с известного состояния.
    await clearTestProfile(prisma);
    await seedTestProfile(prisma);
  });

  it('returns profile with links, skills, experiences, achievements, projects', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: PROFILE_QUERY })
      .expect(200);

    expect(res.body.errors).toBeUndefined();
    const profile = res.body.data.profile;

    expect(profile.id).toBe('test-profile');
    expect(profile.name).toBe('E2E Test User');
    expect(profile.description).toBe('Fixture profile for E2E tests.');

    // Ссылки: порядок по order.
    expect(profile.links.map((l: { id: string }) => l.id)).toEqual(['test-link-gh']);

    // Навыки: порядок по order; null category переживает GraphQL.
    expect(profile.skills.map((s: { id: string }) => s.id)).toEqual([
      'test-skill-ts',
      'test-skill-nocat',
    ]);
    const nocat = profile.skills.find((s: { id: string }) => s.id === 'test-skill-nocat');
    expect(nocat.category).toBeNull();

    // Опыт: порядок; endDate = null; отсутствие достижений = [].
    expect(profile.experiences.map((e: { id: string }) => e.id)).toEqual([
      'test-exp-current',
      'test-exp-empty',
    ]);
    const current = profile.experiences.find((e: { id: string }) => e.id === 'test-exp-current');
    expect(current.endDate).toBeNull();
    expect(current.achievements.map((a: { id: string }) => a.id)).toEqual(['test-ach-1']);

    const empty = profile.experiences.find((e: { id: string }) => e.id === 'test-exp-empty');
    expect(empty.achievements).toEqual([]);

    // Проекты: null url / description.
    const noUrl = profile.projects.find((p: { id: string }) => p.id === 'test-project-empty');
    expect(noUrl.url).toBeNull();
    expect(noUrl.description).toBeNull();
  });

  it('returns a clear error when profile is missing', async () => {
    await clearTestProfile(prisma);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: PROFILE_QUERY })
      .expect(200);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/Profile not found/i);
  });
});
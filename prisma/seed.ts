import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const profileId = 'profile-main';

  // --- Profile ---
  await prisma.profile.upsert({
    where: { id: profileId },
    update: {
      name: 'Имя Фамилия',
      description: 'Backend-разработчик. TypeScript, NestJS, Prisma, GraphQL.',
    },
    create: {
      id: profileId,
      name: 'Имя Фамилия',
      description: 'Backend-разработчик. TypeScript, NestJS, Prisma, GraphQL.',
    },
  });

  // --- ProfessionalLink ---
  const links = [
    { id: 'link-github',   label: 'GitHub',   url: 'https://github.com/example',     order: 0 },
    { id: 'link-linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/example', order: 10 },
    { id: 'link-telegram', label: 'Telegram', url: 'https://t.me/example',           order: 20 },
  ];
  for (const link of links) {
    await prisma.professionalLink.upsert({
      where: { id: link.id },
      update: { label: link.label, url: link.url, order: link.order, profileId },
      create: { id: link.id, label: link.label, url: link.url, order: link.order, profileId },
    });
  }

  // --- Skill ---
  const skills = [
    { id: 'skill-ts',      name: 'TypeScript', category: 'backend',  order: 0 },
    { id: 'skill-node',    name: 'Node.js',    category: 'backend',  order: 10 },
    { id: 'skill-nest',    name: 'NestJS',     category: 'backend',  order: 20 },
    { id: 'skill-prisma',  name: 'Prisma',     category: 'database', order: 30 },
    { id: 'skill-graphql', name: 'GraphQL',    category: 'api',      order: 40 },
    { id: 'skill-git',     name: 'Git',        category: null,       order: 50 },
  ];
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: { name: skill.name, category: skill.category, order: skill.order, profileId },
      create: { id: skill.id, name: skill.name, category: skill.category, order: skill.order, profileId },
    });
  }

  // --- Experience ---
  const experiences = [
    {
      id: 'exp-current',
      company: 'ООО Пример',
      position: 'Backend Developer',
      startDate: new Date('2024-09-01'),
      endDate: null,
      order: 0,
    },
    {
      id: 'exp-old',
      company: 'ООО Старое',
      position: 'Intern',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-08-31'),
      order: 10,
    },
  ];
  for (const exp of experiences) {
    await prisma.experience.upsert({
      where: { id: exp.id },
      update: { company: exp.company, position: exp.position, startDate: exp.startDate, endDate: exp.endDate, order: exp.order, profileId },
      create: { id: exp.id, company: exp.company, position: exp.position, startDate: exp.startDate, endDate: exp.endDate, order: exp.order, profileId },
    });
  }

  // --- Achievement (только для exp-current; у exp-old — пусто) ---
  const achievements = [
    { id: 'ach-1', text: 'Разработал GraphQL API на NestJS + Prisma', order: 0, experienceId: 'exp-current' },
    { id: 'ach-2', text: 'Настроил Docker-сборку и деплой на Render',  order: 10, experienceId: 'exp-current' },
    { id: 'ach-3', text: 'Покрыл ключевые сценарии E2E-тестами',      order: 20, experienceId: 'exp-current' },
  ];
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: { text: ach.text, order: ach.order, experienceId: ach.experienceId },
      create: { id: ach.id, text: ach.text, order: ach.order, experienceId: ach.experienceId },
    });
  }

  // --- Project ---
  const projects = [
    { id: 'project-visit-card', name: 'Visit-card',  url: 'https://github.com/example/visit-card', description: 'Backend-визитка на NestJS + Prisma + GraphQL', order: 0 },
    { id: 'project-landing-1',  name: 'Landing 1',   url: 'https://github.com/example/landing-1',  description: null,                                order: 10 },
    { id: 'project-landing-2',  name: 'Landing 2',   url: null,                                    description: 'Внутренний проект без публичного репо', order: 20 },
  ];
  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: { name: project.name, url: project.url, description: project.description, order: project.order, profileId },
      create: { id: project.id, name: project.name, url: project.url, description: project.description, order: project.order, profileId },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
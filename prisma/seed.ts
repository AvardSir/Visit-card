import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Идемпотентность через «сброс + создание»: profile.deleteMany() каскадом
  // сносит links/skills/experiences/projects (onDelete: Cascade, §5.1).
  // Конечное состояние одинаково при каждом запуске.
  await prisma.profile.deleteMany();

  await prisma.profile.create({
    data: {
      id: 'profile-main',
      name: 'Иван',
      description:
        'Разрабатываю веб-приложения на TypeScript. React на фронте, Node.js/NestJS на бэке. Ищу команду.',

      links: {
        create: [
          {
            id: 'link-github',
            label: 'GitHub',
            url: 'https://github.com/AvardSir/',
            order: 0,
          },
          {
            id: 'link-telegram',
            label: 'Telegram',
            url: 'https://t.me/Avard_sir',
            order: 10,
          },
        ],
      },

      skills: {
        create: [
          { id: 'skill-ts',       name: 'TypeScript',  category: 'languages', order: 0   },
          { id: 'skill-js',       name: 'JavaScript',  category: 'languages', order: 10  },
          { id: 'skill-react',    name: 'React',       category: 'frontend',  order: 20  },
          { id: 'skill-vite',     name: 'Vite',        category: 'frontend',  order: 30  },
          { id: 'skill-node',     name: 'Node.js',     category: 'backend',   order: 40  },
          { id: 'skill-express',  name: 'Express',     category: 'backend',   order: 50  },
          { id: 'skill-nest',     name: 'NestJS',      category: 'backend',   order: 60  },
          { id: 'skill-prisma',   name: 'Prisma',      category: 'database',  order: 70  },
          { id: 'skill-graphql',  name: 'GraphQL',     category: 'api',       order: 80  },
          { id: 'skill-socketio', name: 'Socket.IO',   category: 'real-time', order: 90  },
          { id: 'skill-docker',   name: 'Docker',      category: 'devops',    order: 100 },
          { id: 'skill-git',      name: 'Git',         category: 'tools',     order: 110 },
        ],
      },

      // experiences намеренно не создаём — у профиля нет опыта работы.
      // GraphQL вернёт experiences: [] (валидный ответ, §10).

      experiences: {
        create: [
          {
            id: 'exp-vibecall',
            company: 'Self-employed',
            position: 'Fullstack Developer (pet-проект)',
            startDate: new Date('2026-07-23T00:00:00.000Z'),
            endDate: new Date('2026-07-30T00:00:00.000Z'),
            order: 0,
            achievements: {
              create: [
                {
                  id: 'ach-arch',
                  text: 'Спроектировал архитектуру с разделением control plane (backend) и media plane (LiveKit Cloud)',
                  order: 0,
                },
                {
                  id: 'ach-grace',
                  text: 'Реализовал управление комнатами с grace-period при отключении хоста',
                  order: 10,
                },
                {
                  id: 'ach-realtime',
                  text: 'Настроил real-time синхронизацию через Socket.IO и интеграцию LiveKit Server SDK',
                  order: 20,
                },
                {
                  id: 'ach-deploy',
                  text: 'Задеплоил frontend и backend на Render, медиа — через LiveKit Cloud',
                  order: 30,
                },
              ],
            },
          },
        ],
      },

      projects: {
        create: [
          {
            id: 'project-vibecall',
            name: 'VibeCall',
            url: 'https://vibecall-frontend-9m76.onrender.com/',
            description:
              'Web-приложение для видеоконференций без регистрации. React + TypeScript + Node.js + Socket.IO + LiveKit Cloud.',
            order: 0,
          },
          {
            id: 'project-fmf',
            name: 'FMF Landing',
            url: 'https://fmf-landing.onrender.com',
            description:
              'Одностраничный лендинг с CMS на WordPress REST API. React 19 + Vite 8.',
            order: 10,
          },
          {
            id: 'project-test-protey',
            name: 'Test-Protey',
            url: 'https://test-protey.pages.dev',
            description:
              'Сайт мероприятия с расписанием докладов и формой регистрации. React + Vite + Cloudflare Pages.',
            order: 20,
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
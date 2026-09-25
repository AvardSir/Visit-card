const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [profiles, links, skills, experiences, achievements, projects] =
    await Promise.all([
      prisma.profile.count(),
      prisma.professionalLink.count(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.achievement.count(),
      prisma.project.count(),
    ]);

  console.log({
    profiles,
    links,
    skills,
    experiences,
    achievements,
    projects,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
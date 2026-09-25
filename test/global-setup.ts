import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Минимальный парсер .env.test. Свой, чтобы не плодить зависимость dotenv:
// dotenv-cli уже в devDeps и нужен для test:e2e, но импортировать транзитивный
// dotenv напрямую — плохая практика (п.8.6).
function loadEnvFile(path: string): void {
  const content = readFileSync(path, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

export default async function globalSetup(): Promise<void> {
  loadEnvFile(join(process.cwd(), '.env.test'));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.includes('test.db')) {
    throw new Error(
      `Refusing to run E2E: DATABASE_URL must point to test.db, got "${databaseUrl}". ` +
        `Check .env.test — hitting dev.db from tests is a data-loss footgun.`,
    );
  }

  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
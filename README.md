# Visit Card — Backend

Backend-приложение «цифровая визитка»: один GraphQL-запрос `profile` возвращает профиль со вложенными ссылками, навыками, опытом (с достижениями) и проектами.  
Стек: TypeScript / NestJS / Prisma / GraphQL (Apollo Server 4) / SQLite / Docker.

## 🔗 Live Demo

- **Apollo Sandbox:** https://visit-card-gyxw.onrender.com/graphql

> Пример запроса и ответа — см. [GraphQL API](#graphql-api).

## Стек

| Слой | Технология |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10 |
| ORM | Prisma 5 |
| API | GraphQL (code-first, Apollo Server 4) |
| БД | SQLite (файл) |
| Упаковка | Docker (multi-stage, `node:20-slim`) |
| Тесты | Jest + Supertest (unit + E2E) |

## Быстрый старт

### Вариант 1 — Docker (рекомендуется)

```bash
docker compose up --build
```

Открыть http://localhost:3000/graphql.

При старте контейнер сам:

- применяет схему (`prisma db push`),
- выполняет идемпотентный seed,
- поднимает Nest.

Повторный запуск безопасен — seed использует `upsert` и фиксированные `id`, дубликатов не появляется.

### Вариант 2 — локально

```bash
npm ci
cp .env.example .env          # Windows: copy .env.example .env
npx prisma db push
npx prisma db seed
npm run start:dev
```

Открыть http://localhost:3000/graphql.

## Тесты

```bash
npm test          # unit (ProfileService)
npm run test:e2e  # E2E (resolver + вложенность), отдельная test.db
```

## GraphQL API

Схема — один корневой запрос `profile`. Вложенные данные отдаются через `@ResolveField`; данные полностью подготавливаются в сервисе (без N+1).

### Запрос

```graphql
query {
  profile {
    id
    name
    description
    links       { id label url }
    skills      { id name category }
    experiences {
      id
      company
      position
      startDate
      endDate
      achievements { id text }
    }
    projects    { id name url description }
  }
}
```

### Пример ответа

```json
{
  "data": {
    "profile": {
      "id": "profile-main",
      "name": "…",
      "description": "…",
      "links": [
        { "id": "link-github", "label": "GitHub", "url": "https://github.com/…" }
      ],
      "skills": [
        { "id": "skill-ts", "name": "TypeScript", "category": "backend" },
        { "id": "skill-git", "name": "Git", "category": null }
      ],
      "experiences": [
        {
          "id": "exp-1",
          "company": "…",
          "position": "…",
          "startDate": "2025-01-01T00:00:00.000Z",
          "endDate": null,
          "achievements": [
            { "id": "ach-1", "text": "…" }
          ]
        }
      ],
      "projects": [
        {
          "id": "project-main",
          "name": "…",
          "url": "https://github.com/…",
          "description": null
        }
      ]
    }
  }
}
```

## Граничные случаи (покрыты)

- текущая работа без `endDate` → `null`;
- опыт без достижений → `[]`, не `null`;
- навык без категории, проект без URL/описания → `null`;
- пустая БД → ошибка `Profile not found. Seed may have failed.`

## Скриншот Apollo Sandbox

<img width="1280" height="616" alt="image" src="https://github.com/user-attachments/assets/50236eca-6577-4af3-b697-3cfc36144563" />

## Деплой на Render

Сервис собирается из Dockerfile (runtime: Docker), данные SQLite эфемерны — при старте контейнера seed восстанавливает профиль.

### Переменные окружения

| Ключ | Значение | Замечание |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | обязательно |
| `NODE_ENV` | — | не задавать: при `production` Apollo Sandbox отключается |
| `PORT` | — | Render задаёт сам, приложение читает `process.env.PORT` |

## Структура проекта

```text
prisma/         schema.prisma + seed.ts
src/
  main.ts       bootstrap (CORS, PORT, 0.0.0.0)
  app.module.ts GraphQL + Prisma
  prisma/       PrismaModule, PrismaService
  profile/      resolver, service, GraphQL-модели
test/           E2E: фикстуры, globalSetup, спеки
Dockerfile      multi-stage: builder + runner
docker-entrypoint.sh  db push → seed → node
```

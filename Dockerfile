# syntax=docker/dockerfile:1.6

# ============================================================
# Стадия 1: builder
# Собираем TS → JS и отдельно компилируем seed.
# ============================================================
FROM node:20-slim AS builder

# openssl ОБЯЗАТЕЛЬНО до `prisma generate`.
# Без него Prisma не детектит libssl, откатывается на target 1.1.x,
# а в bookworm стоит OpenSSL 3.0 → движок не грузится (грабля #23).
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Зависимости отдельным слоем.
#    Пока не менялись package.json / package-lock.json — npm ci
#    не перезапускается, кеш слоя переиспользуется.
COPY package.json package-lock.json ./
RUN npm ci

# 2. prisma generate ДО сборки приложения.
#    dist/src/main.js в рантайме импортирует @prisma/client —
#    клиент должен существовать на момент npm run build.
#    Явно, потому что npm ci не запускает postinstall-prisma (грабля #5).
COPY prisma ./prisma
RUN npx prisma generate

# 3. Сборка приложения через npm run build (= nest build).
#    tsconfig.build.json исключает test/ и prisma/seed.ts — это осознанно (§15.6).
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# 4. Seed компилируем отдельной командой.
#    tsconfig.build.json его не берёт, а seed нужен рантайму
#    как dist/prisma/seed.js (грабли #9, #15, #16).
#    rootDir "prisma" → dist/prisma/seed.js, а не dist/seed.js.
RUN npx tsc prisma/seed.ts \
    --outDir dist/prisma \
    --rootDir prisma \
    --module commonjs \
    --target ES2022 \
    --esModuleInterop

# Пока — только builder. Runner добавим на шаге 3 после проверки dist/.

# ============================================================
# Стадия 2: runner
# Минимальный образ: prod-зависимости + собранный dist/ + Prisma CLI.
# ============================================================
FROM node:20-slim AS runner

# Та же причина, что в builder: entrypoint делает `prisma db push`,
# а schema-engine — нативный бинарник, которому нужна libssl.
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Прод-зависимости.
#    --omit=dev выкидывает typescript, jest, ts-node, @nestjs/cli.
#    prisma остаётся, потому что лежит в dependencies (§15.2, грабля #17) —
#    entrypoint вызывает `prisma db push` без devDeps.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2. prisma generate в runner.
#    Отклонение от §15.10 (там предлагалось копировать node_modules/.prisma
#    из builder). Причина: копировать один и тот же клиент через границу
#    стейджей — хрупко, а генерация занимает ~1–2 сек.
COPY prisma ./prisma
RUN npx prisma generate

# 3. Собранный код из builder.
#    Nest-приложение и скомпилированный seed — оба под dist/.
COPY --from=builder /app/dist ./dist

# 4. Entrypoint.
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# 5. Порт. Информационный: реально слушаем process.env.PORT ?? 3000 (§16, грабля #7, #8).
EXPOSE 3000

# 6. NODE_ENV НЕ выставляем в production (грабля #6) —
#    иначе Apollo отключит Sandbox, а он нужен для сдачи тестового.
#    Дефолт из .env / Render env vars решает.

CMD ["./docker-entrypoint.sh"]
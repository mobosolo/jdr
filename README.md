# JDR - Front + API Prisma

## Prerequisites

- Node.js 20+ (LTS recommended)
- PostgreSQL running locally

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure `.env`

```env
VITE_API_URL=http://localhost:4000
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/jdr

ADMIN_USER=admin
ADMIN_PASSWORD=change_me
ADMIN_JWT_SECRET=change_me_long_random_value
NODE_ENV=development
```

3. Apply Prisma migrations and generate client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Seed data (optional)

```bash
npx tsx script.ts
```

## Run

- Frontend (Vite):

```bash
npm run dev
```

- API server (Prisma):

```bash
npm run server
```

## Notes

- The project now uses `routes/server.ts` as the single backend.
- Legacy SQL server files in `server/` are no longer part of the active runtime path.

# Marketplace Backend (Express.js + PostgreSQL + Redis)

REST API for the marketplace: auth (JWT + refresh), listings CRUD, favorites, Redis caching, and rate limiting.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Cache / rate limit:** Redis
- **Auth:** JWT (access + refresh with rotation)
- **Testing:** Jest (unit + integration)
- **Lint / format:** ESLint (Airbnb or Standard), Prettier

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for Postgres and Redis)
- npm or yarn

## Quick Start

### 1. Start Postgres and Redis

From the **project root** (where `docker-compose.yml` lives):

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis. Optionally the root `docker-compose.yml` can also start the backend for local dev.

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Environment variables

Copy the example env and fill in values:

```bash
cp .env.example .env
```

Required variables (see [Environment variables](#environment-variables) below).

### 4. Run migrations

```bash
npm run migrate
```

### 5. Seed database (optional)

```bash
npm run seed
```

Add a `seed` script in `package.json` that runs your seed script (e.g. 3 users, 10+ listings, some favorites).

### 6. Start the server

```bash
npm run start:dev
```

API runs at `http://localhost:<PORT>` (e.g. 3000). Health check: `GET /health`.

## Scripts

| Script          | Description                                      |
|----------------|--------------------------------------------------|
| `npm run start:dev` | Start server with hot reload (e.g. ts-node-dev)   |
| `npm run build`     | Compile TypeScript to `dist/`                     |
| `npm run start`     | Run compiled app: `node dist/index.js`           |
| `npm run migrate`   | Run PostgreSQL migrations                         |
| `npm run migrate:down` | Rollback last migration (if supported)         |
| `npm run seed`      | Seed users, listings, favorites                   |
| `npm run test`      | Run Jest (unit + integration)                     |
| `npm run test:watch`| Run tests in watch mode                           |
| `npm run lint`      | Run ESLint                                        |
| `npm run lint:fix`  | ESLint with auto-fix                              |
| `npm run format`    | Run Prettier                                      |

## Environment variables

Create `.env` from `.env.example`. Example:

```env
# Server
NODE_ENV=development
PORT=3000

# Database (matches docker-compose)
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace

# Redis (matches docker-compose)
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cache (configurable, no hardcoded TTL)
CACHE_TTL_SECONDS=120
CACHE_TTL_JITTER_SECONDS=30

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

- **JWT secrets:** Use long, random strings in production; never commit real secrets.
- **DATABASE_URL:** For local Docker: `postgresql://user:password@localhost:5432/marketplace`.
- **REDIS_URL:** For local Docker: `redis://localhost:6379`.
- **CACHE_TTL_***:** Used for listing list and detail cache; see `CACHING_STRATEGY.md` at repo root.

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/auth/signup` | No  | Register (email + password) |
| POST   | `/auth/login`  | No  | Login; returns access + refresh JWT |
| POST   | `/auth/refresh`| No  | New access + refresh (body: refresh token) |
| GET    | `/listings`   | No  | Paginated list; ?page, ?limit, ?q, ?tag, ?min_price, ?max_price |
| GET    | `/listings/:id` | No | Listing detail (cached) |
| POST   | `/listings`   | Yes | Create listing (seller) |
| PUT    | `/listings/:id` | Yes | Update listing (seller only) |
| DELETE | `/listings/:id` | Yes | Delete listing (seller only) |
| POST   | `/listings/:id/favorite` | Yes | Toggle favorite |
| GET    | `/users/me/favorites` | Yes | Current user favorites (paginated) |

Protected routes require header: `Authorization: Bearer <access_token>`.

## Running tests

- **Unit tests:** Services (auth, listings, favorites) with mocks.
- **Integration tests:** API routes against a test database (Docker or in-memory).

```bash
cd backend
npm run test
```

Use a separate test DB (e.g. `DATABASE_URL` for test or in-memory). Start Postgres/Redis via Docker if integration tests hit real DB/Redis.

## Linting and formatting

```bash
npm run lint
npm run lint:fix
npm run format
```

## Project structure (suggested)

```
backend/
├── src/
│   ├── index.ts           # App entry, server listen
│   ├── app.ts             # Express app, routes, middleware
│   ├── config/
│   │   └── env.ts         # Env validation / defaults
│   ├── db/
│   │   ├── client.ts      # Pool / connection
│   │   └── migrations/    # SQL or migration runner files
│   ├── middleware/
│   │   ├── auth.ts        # JWT verify, attach user
│   │   ├── rateLimit.ts   # Redis rate limit
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── listings.ts
│   │   └── favorites.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── listings.ts
│   │   ├── favorites.ts
│   │   └── cache.ts       # Redis cache + invalidation
│   └── utils/
│       └── redis.ts       # Redis client
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Cache and rate limiting

- **Caching:** List and detail listing endpoints are cached in Redis. Keys and TTL are configurable; see root **CACHING_STRATEGY.md**.
- **Invalidation:** On listing create/update/delete, relevant list and detail keys are invalidated.
- **Rate limiting:** Write endpoints (create/update/delete listing, toggle favorite) are rate-limited per IP or per user via Redis (e.g. 10 requests per minute).

## Related docs

- **Root:** `README.md` — repo overview, Docker, links to backend and mobile.
- **Root:** `IMPLEMENTATION_PLAN.md` — phased implementation plan.
- **Root:** `CACHING_STRATEGY.md` — cache key patterns, TTLs, invalidation, stampede mitigation.

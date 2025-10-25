# Digital Pardna - AI Coding Agent Instructions

## Project Overview
Digital Pardna is a financial technology platform for running traditional Caribbean "pardna" (rotating savings) circles with digital tracking, reminders, and receipts. The system manages member contributions, automated payouts, and round scheduling.

## Architecture & Components

### Monorepo Structure (pnpm workspaces)
- **`apps/api`** - Fastify REST API server with Prisma ORM + PostgreSQL
- **`apps/web`** - Next.js 14 frontend (App Router) 
- **`apps/keeper`** - Background cron service for round automation
- **`packages/shared`** - Shared utilities (currently minimal)

### Core Domain Model
The database schema defines the pardna circle lifecycle:
- **Circle**: A savings group with fixed hand amount, payout schedule
- **Membership**: User participation in a circle with payout position
- **Round**: Time-bounded collection period (one per payout cycle)
- **Contribution**: Member payment into a round
- **Payout**: Distribution of collected funds to designated member

## Development Workflows

### Starting the Stack
```bash
# API server (port 4000)
pnpm dev:api

# Frontend (port 3000) 
pnpm dev:web

# Background keeper service
pnpm dev:keeper
```

### Database Operations
```bash
# Push schema changes and regenerate client
cd apps/api && pnpm prisma:push

# Seed test data
cd apps/api && pnpm seed
```

## Project-Specific Conventions

### Code Style
- **Ultra-compact formatting**: Single-line functions, minimal whitespace
- **No semicolons**: TypeScript/JavaScript without trailing semicolons
- **Inline styles**: React components use style objects, not CSS classes
- **BigInt for currency**: All monetary amounts stored as minor units (e.g., cents)

### API Patterns
- **Fastify plugins**: Routes defined as `FastifyPluginAsync` in `apps/api/src/routes/`
- **Zod validation**: Request schemas validated with Zod before processing
- **Prisma transactions**: Multi-step operations wrapped in `prisma.$transaction()`
- **Error responses**: Standard `{ error: "message" }` format

### State Management
- **Round status flow**: `planned` → `open` → `funded` → `payed`
- **Contribution status**: `pending` → `succeeded` (payments currently simulated)
- **Automatic transitions**: Keeper service monitors due dates and updates round status

## Key Integration Points

### Database Schema Relationships
- `Circle` → `Membership` → `User` (many-to-many through memberships)
- `Circle` → `Round` → `Contribution`/`Payout` (one-to-many cascading)
- Unique constraints on `(circle_id, payout_position)` and `(circle_id, index_num)`

### Frontend-API Communication
- API base URL via `NEXT_PUBLIC_API_URL` environment variable
- RESTful endpoints: `/v1/circles`, `/v1/circles/:id/rounds/:idx`
- Direct fetch() calls, no API client library

### Keeper Service Logic
- Runs every minute via `node-cron`
- Finds overdue rounds with full contributions
- Transitions `open` → `funded` when all members have paid

## Critical Business Rules

### Payout Position Logic
- Members assigned sequential payout positions (0, 1, 2...)
- Round index determines who receives payout: `payeeMembership = members[roundIndex]`
- Cannot process payout until all contributions received

### Amount Calculations
- Hand amounts stored as `BigInt` minor units (e.g., 5000 = $50.00)
- Total payout = sum of all contributions in round
- Currency support: JMD (Jamaican Dollar), USD

### Circle Lifecycle
1. Create circle with members and payout positions
2. Start circle → generates all rounds with calculated due dates  
3. Members contribute to active round
4. Keeper detects full contributions → marks round as funded
5. Manual payout triggers transfer and closes round

## Environment Setup
- PostgreSQL database required for API
- Environment variables: `DATABASE_URL`, `PORT`, `NEXT_PUBLIC_API_URL`
- TypeScript configuration in `tsconfig.base.json` (ES2022 target)
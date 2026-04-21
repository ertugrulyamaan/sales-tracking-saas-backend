# Sales Tracking SaaS API

A sales tracking backend service built with NestJS, Prisma, and PostgreSQL.

## Features

- JWT-based authentication
- Multi-workspace support
- Sales and refund record management
- Weekly target management
- Daily/weekly analytics summary endpoints
- Swagger API documentation

## Tech Stack

- `NestJS`
- `Prisma`
- `PostgreSQL`
- `Passport JWT`
- `class-validator`

## Requirements

- Node.js 20+
- npm 10+
- Docker (optional, for local PostgreSQL)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/sales_tracking?schema=public"
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN="7d"
PORT=8080
```

## Start Database (Docker)

```bash
docker compose up -d
```

Default values from `docker-compose.yml`:
- Host: `localhost`
- Port: `5434`
- DB: `sales_tracking`
- User: `postgres`
- Password: `postgres`

## Prisma Commands

```bash
npx prisma generate
npx prisma migrate dev
```

## Run the Project

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

The application runs on `http://localhost:8080` by default.

## API Documentation

Swagger UI:

`http://localhost:8080/api-docs`

## Modules and Main Endpoint Groups

- `auth`: register, login, me
- `workspaces`: create, list, detail, update
- `sales`: create, increment, list, detail
- `refunds`: create, increment, list, detail
- `targets`: create target, list, detail
- `analytics`: daily summary, weekly summary

## Scripts

```bash
npm run start:dev    # watch mode
npm run build        # build
npm run start:prod   # production
npm run lint         # eslint --fix
npm run format       # prettier
```

## Note

This repository is currently backend-focused; frontend and comprehensive test strategy can be handled separately.

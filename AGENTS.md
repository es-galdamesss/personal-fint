# AGENTS.md

## Purpose

This file defines the mandatory rules for agents working on this project. Follow it to avoid unauthorized changes in stack, architecture, routes, business rules, or project scope.

Read extra documentation only when it is relevant to the assigned task.

## Skills

Before starting a task, check if there are relevant skills available in `.agents/skills` or the configured skills directory.

Use only skills that clearly help with the assigned task. Do not read unrelated skills. If a skill contains many references, read only the sections relevant to the current task.

## Required Stack

Use:

* Next.js full stack
* TypeScript
* Prisma ORM
* PostgreSQL in Docker
* Docker / Docker Compose
* SonarQube

Do not use:

* npm
* yarn
* SQLite
* MongoDB
* MySQL
* Separate Express backend
* Authentication/login
* Multi-currency

The system currency is fixed: CLP.

## Current Scope

Current priority:

```text
Next.js + pnpm + Prisma + PostgreSQL in Docker + SonarQube
```

## Scope Control

Agents must inspect only the files and folders required for the assigned task.

Do not scan the entire codebase unless explicitly requested.

If more context is needed, report the specific files needed but once completed the task.

## Strict Rules

0. Load a relevant skill before starting any task.
0. Read ##Scope Control.
1. Do not change the tech stack.
2. Do not use npm.
3. Do not create a separate backend.
4. Do not add login/authentication.
5. Do not add multi-currency.
6. Do not change CLP as fixed currency.
7. Do not change main routes without approval.
8. Do not modify the Prisma model without approval.
9. Do not create new main views without approval.
10. Do not implement Jenkins yet.
11. Do not store calculated values in PostgreSQL.
12. Do not create infinite recurring expenses in the database.
13. Do not add cron, workers, or external schedulers for recurring expenses in the MVP.
14. Keep testable business logic in `domain/`.
15. Keep UI components in `components/`.
16. Use Prisma Client for database access.
17. Keep PostgreSQL in Docker.
18. Avoid overengineering.

## Architecture

This is a full stack Next.js application.

Do not create a separate backend project.

Backend code must live in:

```text
app/api/
```

Business logic should live in:

```text
domain/
services/
```

Database access must use Prisma Client.

PostgreSQL must run through Docker Compose. Do not depend on a local PostgreSQL installation.

## Project Structure

```text
app/          -> Next.js routes, pages, layouts, API routes
components/   -> reusable UI components
domain/       -> pure business rules
services/     -> application logic and Prisma coordination
lib/          -> Prisma client, utilities, validations
prisma/       -> schema, migrations, seed
tests/        -> unit tests
docs/         -> project documentation
```

If the project was created with `app/` at root level, do not move it into `src/` without approval.

## Main Routes

Do not create new main views without approval.

Defined routes:

```text
/dashboard
/movements
/movements/new
/settings
```

## Commands

Always use pnpm.

Expected commands:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm test:coverage
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma migrate deploy
```

Do not generate:

```text
package-lock.json
yarn.lock
```

Valid lockfile:

```text
pnpm-lock.yaml
```

## Reference Documentation

Read only when needed for the assigned task:

```text
docs/PRODUCT.md      -> product scope, views, features, business rules
docs/DATA_MODEL.md   -> Prisma models and database rules
docs/DEVOPS.md       -> Docker, SonarQube, DevOps setup
```

Examples:

* UI/view task: read `docs/PRODUCT.md`.
* Prisma/database/service task: read `docs/DATA_MODEL.md`.
* Docker/SonarQube task: read `docs/DEVOPS.md`.
* Minor style/text fix: do not read all docs unless needed.


## Quality Criteria


Prioritize:

* Simple code
* Clear structure
* Modular design
* Testable business rules
* Correct Prisma usage
* Correct pnpm usage
* Clean Docker setup
* SonarQube readiness

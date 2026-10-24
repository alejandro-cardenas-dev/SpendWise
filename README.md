# 💸 SpendWise

A full-stack personal finance tracker. Record income and expenses, organize them
in categories with optional monthly budgets, and get notified before you overspend.

**Live demo:** _add your link after deploying_ · **API docs:** `/api/docs/`

<!-- Add screenshots to docs/screenshots/ and uncomment:
![Dashboard](docs/screenshots/dashboard.png)
![Transactions](docs/screenshots/transactions.png)
-->

## Features

- **Authentication.** Register, log in, log out. JWT access and refresh tokens, with
  automatic silent refresh in the browser and protected routes.
- **Categories.** Per-user, with an emoji, a type (expense or income), an optional
  monthly limit, and archiving. A default set is created on registration.
- **Transactions.** Full CRUD with filters (category, type, date range, text search),
  pagination and ordering.
- **Budget notifications.** A warning at 80% of a category's monthly limit and an
  alert at 100%, never duplicated for the same category, month and threshold.
  A bell in the navbar shows an unread badge and polls every 30 seconds.
- **Dashboard.** Income, expenses and balance for any month; spending by category
  (donut chart); a 6-month trend; budget progress bars (green, yellow, red);
  latest transactions.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Django 5.2, Django REST Framework, SimpleJWT, django-filter, django-cors-headers, drf-spectacular |
| Database | SQLite in development, PostgreSQL in Docker and production |
| Frontend | Next.js (App Router, JavaScript), Tailwind CSS, TanStack Query, Axios, react-hook-form, Recharts |
| Testing | pytest, pytest-django (76 backend tests) |
| Deployment | Docker, Docker Compose, Gunicorn, WhiteNoise |

## Architecture

```
┌──────────────────┐   HTTP + JSON    ┌──────────────────────┐        ┌──────────┐
│  Next.js (UI)    │ ───────────────► │  Django REST API     │ ─ORM─► │ Postgres │
│  :3000           │ ◄─────────────── │  :8000               │ ◄───── │ / SQLite │
└──────────────────┘                  └──────────────────────┘        └──────────┘
 holds the tokens, shows data          owns ALL the rules: validation,
                                       data ownership, notifications
```

Backend request flow: `URL → ViewSet → Serializer → Model → Database`. Business rules
live in `services.py` and are triggered by signals, not by views, so they can be
tested without HTTP.

## Getting started

### Option A: Docker (one command)

Requires Docker with the Compose plugin.

```bash
cp .env.example .env
# Edit .env: set SECRET_KEY and POSTGRES_PASSWORD (instructions inside the file)

docker compose up --build
```

- App: http://localhost:3000
- API docs (Swagger): http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/ (create a user first, see below)

```bash
# Optional: create an admin user
docker compose exec backend python manage.py createsuperuser

# Stop (keeps your data) / stop and delete the database volume
docker compose down
docker compose down -v
```

Use `localhost`, not `127.0.0.1`: the CORS allow-list is configured for `http://localhost:3000`.

### Option B: Local development

Requires Python 3.12+ and Node.js 20.9+ (22 LTS recommended).

**Backend**

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # then set SECRET_KEY (see the table below)
python manage.py migrate
python manage.py runserver         # http://localhost:8000
```

**Frontend** (second terminal)

```bash
cd Frontend
npm install
cp .env.local.example .env.local
npm run dev                        # http://localhost:3000
```

## Environment variables

**Backend** (`Backend/.env`, or the container environment)

| Variable | Default | Purpose |
|---|---|---|
| `SECRET_KEY` | insecure dev key | Django signing key. Always set it outside development. |
| `DEBUG` | `False` | Never `True` in production. |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated hostnames the API answers to. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Exact frontend origin(s), scheme included. |
| `CSRF_TRUSTED_ORIGINS` | empty | API origin(s) with scheme, needed for the admin on a real domain. |
| `DATABASE_URL` | `sqlite:///db.sqlite3` | `postgres://user:pass@host:5432/dbname` for PostgreSQL. |
| `USE_HTTPS` | `False` | `True` behind a TLS proxy: secure cookies, HTTPS redirect, HSTS. |
| `RUN_MIGRATIONS` | `1` | Docker only. `0` skips `migrate` on container start. |

**Frontend** (`Frontend/.env.local`)

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | API base URL. Baked in at **build** time. |

## Running the tests

```bash
cd Backend
pytest
```

The suite covers authentication, data isolation between users, validation, budget
notification thresholds, duplicate prevention, and the dashboard aggregations.

To run the same tests against PostgreSQL:

```bash
docker compose exec backend pytest
```

## API overview

Interactive documentation: `/api/docs/` (Swagger UI), schema at `/api/schema/`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register/` · `login/` · `logout/` · `refresh/` · `GET/PATCH /api/auth/me/` |
| Categories | `GET/POST /api/categories/` · `GET/PATCH/DELETE /api/categories/{id}/` |
| Transactions | `GET/POST /api/transactions/` · `GET/PATCH/DELETE /api/transactions/{id}/` |
| Notifications | `GET /api/notifications/` · `POST /api/notifications/{id}/read/` · `POST /api/notifications/read-all/` · `GET /api/notifications/unread-count/` |
| Dashboard | `GET /api/dashboard/?month=YYYY-MM` |
| Health | `GET /api/health/` |

Transaction filters: `category`, `type`, `date_from`, `date_to`, `min_amount`,
`max_amount`, `search`, `ordering`, `page`.

## Project structure

```
SpendWise/
├── Backend/
│   ├── config/              settings, root URLs
│   └── apps/
│       ├── common/          IsOwner permission, owner-scoped viewset mixin, date helpers
│       ├── users/           email-based custom user, JWT endpoints
│       ├── categories/      model, default categories, budget status
│       ├── transactions/    model, filters, dashboard aggregations
│       └── notifications/   model, threshold service, signals
├── Frontend/
│   ├── app/                 routes: (auth) public group, (app) protected group
│   ├── components/          reusable UI
│   ├── context/             AuthContext
│   ├── hooks/               TanStack Query hooks
│   ├── lib/                 Axios instance with refresh interceptor, formatters
│   └── services/            one module per API resource
├── docs/DEPLOYMENT.md
└── docker-compose.yml
```

## Technical decisions

**Custom user model with email login.** Done before the first migration, because
changing `AUTH_USER_MODEL` later is painful. Emails are stored lowercase so
`Ana@x.com` and `ana@x.com` can never be two accounts.

**JWT with rotation and blacklist.** Access tokens last 15 minutes; refresh tokens
rotate on every use and the old one is blacklisted, so logout really invalidates the
session. The Axios interceptor refreshes in a *single flight*: if five requests fail
with 401 at once, one refresh runs and all five wait for it. Two parallel refreshes
with the same token would make the second fail, because rotation already blacklisted it.

**Tokens live in `localStorage`.** Simple and adequate for this project, but readable
by any XSS bug. The production-grade alternative is httpOnly cookies set by the server.

**Data isolation in four layers.** Authentication; every queryset filtered by
`request.user` (a shared mixin, so other users' objects return 404 rather than 403 and
never reveal they exist); an `IsOwner` object permission as a second line; and a
category field that only accepts the requester's own categories.

**A transaction's type comes from its category.** There is one source of truth, so a
transaction can't be "income" inside an expense category. The consequence is that a
category's type can't change once it has transactions.

**Money is `Decimal` end to end.** The API sends amounts as strings (`"25.50"`), the
frontend never does arithmetic on them (`Number()` appears only for display and
drawing charts), and database `CheckConstraint`s back up the serializer validation.

**Notifications: service plus thin signal.** `check_budget_thresholds(category, month)`
holds all the rules and is a plain function, so it is tested directly. A five-line signal
calls it after every transaction save or delete, so the admin and the shell are covered
too. Duplicates are prevented twice: `get_or_create`, and a database `UniqueConstraint`
on (user, category, month, type) that also covers two simultaneous requests. One large
transaction that jumps from 0% to 120% creates both the warning and the limit alert.

**Dashboard is one endpoint.** `GET /api/dashboard/` returns every widget in a single
request, computed by the database (`Sum` with conditional filters, `annotate`,
`TruncMonth`) instead of Python loops. Gaps in the 6-month trend are zero-filled so the
chart's axis is continuous.

**Server state in TanStack Query.** Mutations invalidate related query keys by prefix
(a transaction change refreshes transactions, dashboard and notifications), so the UI
never needs manual cache bookkeeping. The bell polls a cheap `unread-count` endpoint
every 30 seconds, and loads the full list only while the dropdown is open.

**Client-side route guard.** Tokens are in `localStorage`, which the server can't read,
so a layout guards the protected route group. This is a UX layer only; the real
protection is the API returning 401. Next.js instant-navigation validation is set to
manual for the same reason: pages are client-rendered behind a login.

**Docker.** The backend runs Gunicorn with WhiteNoise for static files, as a non-root
user, and waits for PostgreSQL's health check before running migrations. The frontend
uses Next.js `standalone` output in a multi-stage build. `NEXT_PUBLIC_API_URL` is a build
argument because Next.js inlines it into the bundle.

## Known limitations

- Changing a category's limit does not re-evaluate notifications until the next
  transaction in that category.
- Notifications are history: they are not removed when spending drops, so a second
  warning is never created for the same category, month and threshold.
- The notification check runs inside the request. At large scale it would move to a
  background task.
- Currency is fixed to USD for display.
- There are no frontend automated tests yet; the frontend was verified manually.
- Tokens in `localStorage` (see above).

## Roadmap

Recurring transactions · CSV export · savings goals · profile settings with currency ·
dark mode · frontend tests · CI pipeline.
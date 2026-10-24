# Deployment guide

A typical low-cost setup:

```
Browser ──► Frontend (Vercel or similar) ──► Backend container ──► Managed PostgreSQL
            Next.js                           Django + Gunicorn
```

The backend and frontend are deployed separately, so the two hostnames must be told
about each other (CORS, and the API URL baked into the frontend). Platform dashboards
change often; the steps below say what to configure, and you should check each
platform's docs for where.

## 1. Before you deploy

```bash
# The frontend must build cleanly
cd Frontend && npm run build

# The whole stack must run and pass its tests on PostgreSQL
docker compose up --build
docker compose exec backend pytest
```

## 2. Database

Create a managed PostgreSQL instance and copy its connection URL. It will be the
backend's `DATABASE_URL` (`postgres://user:password@host:5432/dbname`). Use the
provider's internal URL if the backend runs on the same platform.

## 3. Backend

Any host that runs a Dockerfile works (Render, Railway, Fly.io...). Point it at
`Backend/` and its `Dockerfile`. The container applies migrations on start and listens on
port 8000. If the platform assigns a port through `$PORT`, change the Gunicorn bind in
the `Dockerfile` accordingly.

| Variable | Value |
|---|---|
| `SECRET_KEY` | A long random string: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` |
| `DATABASE_URL` | From step 2 |
| `ALLOWED_HOSTS` | The API hostname only, no scheme: `api.example.com` |
| `CORS_ALLOWED_ORIGINS` | The frontend origin: `https://spendwise.example.com` (no trailing slash, no path) |
| `CSRF_TRUSTED_ORIGINS` | The API origin: `https://api.example.com` |
| `USE_HTTPS` | `True` |

Set the platform's health check path to `/api/health/`.

Then create an admin user from the platform's shell:

```bash
python manage.py createsuperuser
```

## 4. Frontend

Deploy `Frontend/` (on Vercel: set the project's root directory to `Frontend`).

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.example.com/api` |

This value is **baked in at build time**. If you change it, redeploy (rebuild); restarting
is not enough.

## 5. After the first deploy

1. Open `https://api.example.com/api/docs/` (Swagger loads) and `/api/health/`.
2. Register on the frontend, add a category with a limit, then add transactions until a
   notification appears.
3. Check the browser console for CORS errors.
4. Run the security check against the production settings:
```bash
   python manage.py check --deploy
```
5. Once everything works, raise `SECURE_HSTS_SECONDS` to `31536000`.

## 6. Maintenance

- **Expired tokens pile up** in the blacklist tables. Clean them periodically with a
  scheduled job (cron or your platform's job runner):
```bash
  python manage.py flushexpiredtokens
```
- **Backups.** Enable automated backups on the managed database and test a restore once.
- **Several backend instances.** Migrations run on every container start. Set
  `RUN_MIGRATIONS=0` and run `python manage.py migrate` as a separate release step instead.
- **Free tiers** often put idle services to sleep, so the first request after a pause can
  take a while. This is expected.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Browser console: CORS error | `CORS_ALLOWED_ORIGINS` doesn't exactly match the frontend origin (scheme, host, no trailing slash). |
| API returns 400 "Invalid HTTP_HOST header" | The hostname is missing from `ALLOWED_HOSTS`. |
| Frontend still calls `localhost:8000` | `NEXT_PUBLIC_API_URL` was set after the build. Redeploy. |
| Admin login: "CSRF verification failed" | `CSRF_TRUSTED_ORIGINS` is missing the API origin (with `https://`). |
| Admin or Swagger has no styling | Static files weren't collected. Rebuild the image. |
| Redirect loop or insecure-cookie issues | `USE_HTTPS=True`, but the platform proxy doesn't send `X-Forwarded-Proto`. Check its docs. |
| Logged out on every refresh | The frontend can't reach the API. Check the Network tab for failing `me/` or `refresh/` calls. |
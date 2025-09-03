# FullStack Challenge

A full‑stack logistics dashboard for managing delivery routes and orders.

- Backend: Django 5, Django REST Framework, SimpleJWT, Channels, PostgreSQL
- Frontend: React + Vite + TypeScript, Redux Toolkit Query, Tailwind
- Runtime: Docker Compose (PostgreSQL + Django ASGI via Gunicorn/Uvicorn)

## Setup instructions

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm (for local frontend dev)

### Environment variables
The following files are added to repo for easier demo. But should be removed in production repo.

- `.env/db`
```
POSTGRES_DB=logistics
POSTGRES_USER=logistics
POSTGRES_PASSWORD=logistics
```

- `.env/backend`
```
POSTGRES_DB=logistics
POSTGRES_USER=logistics
POSTGRES_PASSWORD=logistics
POSTGRES_HOST=db
POSTGRES_PORT=5432
# For production, set your own secret key via env and use DEBUG=false.
# SECRET_KEY=<your-secret-key>
```

Note: The current `settings.py` includes a dev `SECRET_KEY` and `DEBUG=True`. Do not use those defaults in production.

### Start services (Docker)
From the repository root:

```bash
docker compose up --build -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin: http://localhost:8000/admin
- A PostgreSQL volume is created at `./pgdata`.

The backend container runs migrations and loads sample fixtures on start:
- Users: `backend/user/fixtures/users.json`
- Delivery data: `backend/delivery/fixtures/{routes.json,orders.json}`

Fixture passwords are hashed values of "test".

- The app is served to your browser from `http://localhost:3000` by NGINX inside the container, but API calls still go to `http://localhost:8000/api` because they run in the browser, not inside Docker.
- For production, the API base URL should be an enviroment variable and wiring it at build time.

## API documentation
All endpoints are prefixed with `/api`. Authentication uses JWT Bearer tokens (SimpleJWT). Default pagination for list endpoints is 10 items per page unless noted.

### Auth
- POST `/api/auth/register`
  - Body:
    ```json
    { "email": "user@example.com", "password": "string", "password2": "string" }
    ```

- POST `/api/auth/login`
  - Body:
    ```json
    { "email": "user@example.com", "password": "string" }
    ```
  - Response (SimpleJWT):
    ```json
    { "refresh": "<token>", "access": "<token>" }
    ```

- POST `/api/auth/logout`
  - Body:
    ```json
    { "refresh": "<token>" }
    ```
  - Effect: Blacklists the provided refresh token.

Include the access token on subsequent requests:
```
Authorization: Bearer <access>
```

### Routes
- GET `/api/routes`
  - Query params: `status` (PLANNED|IN_PROGRESS|COMPLETED|CANCELLED), `page`, `search`
  - Response (paginated):
    ```json
    {
      "count": 123,
      "next": "...",
      "previous": null,
      "results": [
        {
          "id": 1,
          "name": "Route A",
          "driver_name": "Alice",
          "status": "IN_PROGRESS",
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T01:00:00Z",
          "order_count": 10,
          "completion_percentage": 70.0
        }
      ]
    }
    ```

- GET `/api/routes/{id}`
  - Returns a single Route with computed fields `order_count` and `completion_percentage`.

- PUT `/api/routes/{id}/status`
  - Body:
    ```json
    { "status": "PLANNED|IN_PROGRESS|COMPLETED|CANCELLED" }
    ```

- GET `/api/routes/{id}/orders`
  - Query params: `search`
  - Response: Array of `Order` for the route (unpaginated).

- GET `/api/routes/export.csv`
  - Query params: `q` (search)
  - Response: `text/csv` attachment of all matching routes.

### Orders
- GET `/api/orders/{id}`
  - Returns a single `Order`.

- PUT `/api/orders/{id}/status`
  - Body:
    ```json
    { "status": "PENDING|ASSIGNED|IN_TRANSIT|DELIVERED|FAILED" }
    ```

### Data models
- Route
  - Fields: `id`, `name`, `driver_name`, `status`, `created_at`, `updated_at`
  - Status enum: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
  - Computed (read-only in responses): `order_count`, `completion_percentage`

- Order
  - Fields: `id`, `route` (FK id), `code`, `customer_name`, `address`, `status`, `created_at`, `updated_at`
  - Status enum: `PENDING`, `ASSIGNED`, `IN_TRANSIT`, `DELIVERED`, `FAILED`

## Frontend overview
- React + Vite + TypeScript
- State/data: Redux Toolkit Query (`frontend/src/app/api.ts`)
- Auth handling: Adds `Authorization: Bearer <access>` to requests and redirects to `/login` on 401.
- Main screens: `Dashboard` (routes list + filters + CSV export), `RouteDetail` (orders per route), `Login`.

## Design decisions and trade-offs
- Django REST Framework for rapid API development and built-in pagination/filtering.
- SimpleJWT for stateless auth; chose blacklist for logout. Trade-off: requires storing/blacklisting refresh tokens.
- Channels configured with in-memory layer for simplicity; not enabled on URL routing by default. Trade-off: not horizontally scalable; suitable for dev only.
- PostgreSQL full-text search is used search functioanlity as a demo. It has its comlexities and should be used carefully.
- Frontend uses RTK Query for declarative data fetching, caching, and tag-based invalidation. Trade-off: coupling API shapes to client types.
- CSV export implemented server-side for consistent formatting and to avoid large client-side processing.

## Known limitations
- WebSocket client integration is not implemented in the frontend yet.
- Frontend only implements login; register and logout UI flows are not implemented.
- Backend static files are not served by Gunicorn. For production, serve Django static files via NGINX (e.g., proxying to Gunicorn/Uvicorn and serving `/static/` from a collected directory).
- `SECRET_KEY` and `DEBUG=True` are set in code; insecure for production.
- CORS is wide open (`CORS_ALLOW_ALL_ORIGINS=True`).
- Route orders endpoint is unpaginated and may return large payloads.
- No refresh endpoint exposed for access token renewal (commented out in URLs).
- Channels uses in-memory backend; no Redis layer configured.
- Limited test coverage.

## Future improvements
- Enable `TokenRefreshView` and optionally refresh rotation.
- Split settings for `dev`/`prod`, move secrets to env, set `DEBUG=False` in prod, restrict `ALLOWED_HOSTS`, tighten CORS.
- Add Redis-backed channel layer and enable websocket routes if real-time updates are needed.
- Implement frontend websocket client and real-time updates.
- Implement frontend register and logout flows.
- Add pagination to `/routes/{id}/orders`.
- Improve filtering/sorting on list endpoints.
- Add role-based permissions and admin-only operations for status changes.
- Add integration/unit tests (API + frontend), CI, and linters.
- Add health checks for services and database readiness probes.
- Containerize frontend or add a reverse proxy (e.g., Nginx) for a production deployment, and serve Django static files from NGINX.

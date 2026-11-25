# Mini CRM — React + Express + PostgreSQL

A beginner-friendly customer management app with customer CRUD, search, status tracking, dashboard counts, and a PostgreSQL database.

## Requirements
- Node.js 18+
- PostgreSQL 14+
- npm

## 1. Create the database
Open pgAdmin or `psql` and run:

```sql
CREATE DATABASE mini_crm;
```

Then open the `mini_crm` database and execute the contents of `server/schema.sql`. This creates the `customers` table and inserts three sample customers.

## 2. Configure the backend
In a terminal:

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and update the PostgreSQL username/password:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mini_crm
```

Start the backend:

```bash
npm run dev
```

The API runs at http://localhost:5000. Check http://localhost:5000/api/health to verify the database connection.

## 3. Start the frontend
Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually http://localhost:5173).

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/customers` | List customers |
| GET | `/api/customers/:id` | Get one customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/health` | Check API and database |

Search example: `GET /api/customers?search=alex`

## Database fields
`customers`: `id`, `name`, `email`, `phone`, `company`, `status`, `created_at`.

## Notes
- The API uses parameterized SQL queries to avoid SQL injection.
- Email is unique; duplicate email addresses return HTTP 409.
- This is a learning project. Before production, add authentication, authorization, rate limiting, stronger validation, migrations, and deployment-specific CORS configuration.

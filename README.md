# Dayflow HR Platform

Dayflow is a React and Express HR platform with employee authentication, email verification, HR approvals, employee profiles, attendance, leave, and payroll views.

## Local development

1. Create a PostgreSQL database named `dayflow` or set `DATABASE_URL` to a hosted PostgreSQL connection string.
2. Copy `Backend/.env.example` to `Backend/.env` and set the database, `AUTH_TOKEN_SECRET`, and Gmail SMTP App Password values.
3. Install and start the API:

```powershell
cd Backend
npm install
npm start
```

4. Start the frontend in another terminal:

```powershell
cd dayflow
npm install
npm run dev
```

Open `http://localhost:5173`. For another device on the same network, use the LAN URL printed by Vite and set `dayflow/.env` `VITE_API_URL` to the backend LAN URL.

## Hosted PostgreSQL

### Neon setup

1. Create a project at `neon.tech`.
2. In the Neon SQL Editor, create or select the project database. The default Neon database is usually named `neondb`.
3. Copy the **pooled** connection string from Neon. It looks like this:

```env
DATABASE_URL=postgresql://user:password@ep-example-pooler.region.aws.neon.tech/neondb?sslmode=require
```

4. Add the connection string to the backend hosting service's environment variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/dayflow?sslmode=require
DATABASE_SSL=true
```

The API creates the required tables on first startup, so no manual table export is required. Deploy `Backend` with `npm start`, set `PORT`, `AUTH_TOKEN_SECRET`, and the SMTP variables, then set the frontend build variable `VITE_API_URL` to the deployed API URL. Do not commit the Neon connection string because it contains the database password.

## Demo account

```text
Employee ID: DF-1048
Email: alex@dayflow.com
Password: Dayflow123!
```

HR demo account:

```text
Employee ID: HR-1001
Email: hr@dayflow.com
Password: HR12345!
```


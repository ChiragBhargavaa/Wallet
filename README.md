
## What you can do

- **Sign up and log in** with email and password (Google sign-in is optional if you configure it).
- **Add money** through a fake “bank” flow so your balance goes up.
- **Send money** to someone else who uses the app.
- **Merchants** use a separate login path; the merchant screen is still basic.

The “bank” and transfers are **simulated** so you can try the flows on your own machine without real payments.

---

## Try it on your computer

You’ll need **Node.js** (version 18 or newer) and **PostgreSQL** running somewhere you can connect to.

1. **Install packages** — in the project folder, run:

   ```bash
   npm install
   ```

2. **Tell the app where your database is** — add a file named `.env` in the **root** of the project (same level as `package.json`) with your database URL, for example:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/wallet"
   ```

   Replace `USER`, `PASSWORD`, `HOST`, and `wallet` with your Postgres username, password, host, and database name.

3. **Prepare the database** — from the project root:

   ```bash
   cd packages/db
   npx prisma migrate deploy
   npx prisma generate
   cd ../..
   ```

4. **Start the app** — back at the project root:

   ```bash
   npm run dev
   ```

5. **Open it in the browser** — when the dev server starts, it prints the URLs to use. By default the main Wallet app uses **port 3001** and the merchant app uses **port 3000**.

---

## Optional: fake “bank” server (add money & transfers)

Some features expect a small helper service that pretends to be a bank and confirms deposits and transfers. It runs on **port 6900** on your machine.

If you skip it, parts of the demo may still work with fallbacks, but for the full picture you’ll want to run the code in the `apps/webhooks` folder once its dependencies are set up in that folder’s `package.json` (see that file’s folder if you’re developing this further).

---

## Settings you might add later

These go in the same `.env` file if you need them:

- **`NEXTAUTH_SECRET`** or **`JWT_SECRET`** — a long random string so login sessions stay secure. Required for auth to work properly in many setups.
- **`NEXTAUTH_URL`** — the full address of the app, exactly as users open it in the browser (including scheme and port if needed).
- **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`** — only if you want “Sign in with Google.” Google login only works for people who **already registered** in the app with that email.

If you don’t set the bank webhook URLs, the app uses defaults aimed at the optional helper service on **port 6900**; set `BANK_WEBHOOK_URL` and `PEER_TRANSFER_WEBHOOK_URL` explicitly if your setup differs.

---

## What’s in this project (simple map)

- **`apps/user-app`** — The main Wallet website you’ll use most (port **3001**).
- **`apps/merchant-app`** — A second site for merchant-related UI (port **3000**).
- **`apps/webhooks`** — Small server that simulates bank callbacks for the demo.
- **`packages/db`** — Database layout and connection shared by the apps.
- **`packages/ui`** — Shared visual pieces (like the animated background on the home page).

The rest of the folders are shared tooling (linting, TypeScript settings) used while building the project.

---

## Handy commands (for people editing the code)

| Command | What it does |
|--------|----------------|
| `npm run dev` | Run the apps in development mode |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |

---

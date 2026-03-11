# DigiSpex — Deploy to Vercel (Free)

No terminal. No Node.js install. Just a browser.

---

## Step 1 — Create a free database on Neon

1. Go to **https://neon.tech** and sign up (free)
2. Click **New Project** → give it any name (e.g. `digispex`)
3. Choose any region close to you → click **Create Project**
4. On the dashboard, click **SQL Editor**
5. Open the file **`schema.sql`** from this folder in any text editor, copy everything, paste it into the SQL Editor, click **Run**
6. Go to **Connection Details** → copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   Save this — you'll need it in Step 3.

---

## Step 2 — Upload this project to GitHub

1. Go to **https://github.com** and sign up / log in
2. Click the **+** icon → **New repository**
3. Name it `digispex`, set it to **Private**, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Drag and drop **everything inside this folder** (all files and folders) → click **Commit changes**

---

## Step 3 — Deploy on Vercel

1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **Add New → Project**
3. Find your `digispex` repo → click **Import**
4. Vercel will auto-detect the settings — leave everything as-is
5. Scroll down to **Environment Variables** and add these two:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | *(paste your Neon connection string from Step 1)* |
   | `SESSION_SECRET` | *(any long random text, e.g. `digispex-super-secret-2025-abc123xyz`)* |

6. Click **Deploy** — wait ~30 seconds

Your store is live at `https://digispex.vercel.app` (or whatever Vercel assigns)!

---

## Built-in accounts

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@digispex.ph    | admin123  |
| Owner | owner@digispex.ph    | owner123  |

Change these passwords after your first login via the admin panel.

---

## Updating your store later

Just edit files on GitHub (click any file → pencil icon → edit → commit).
Vercel automatically redeploys within ~30 seconds every time you save.

---

## If something goes wrong

- **"Internal Server Error"** → Check your `DATABASE_URL` environment variable in Vercel settings
- **Database errors** → Make sure you ran `schema.sql` in Neon's SQL Editor
- **Page not found** → Check Vercel's deployment logs (Vercel dashboard → your project → Deployments → click the latest one)

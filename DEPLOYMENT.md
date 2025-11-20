# TinyLink Deployment Guide

Complete step-by-step instructions for deploying TinyLink to production.

## Option 1: Vercel + Neon (Recommended)

This is the easiest and fastest deployment method with excellent free tiers.

### Step 1: Set Up Neon PostgreSQL

1. **Create Neon Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up with GitHub (recommended)

2. **Create Database**
   - Click "New Project"
   - Choose a project name: `tinylink-db`
   - Select a region (choose closest to your users)
   - Click "Create Project"

3. **Get Connection String**
   - After creation, you'll see the connection string
   - Copy the connection string that looks like:
     ```
     postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
     ```
   - Save this for later

### Step 2: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TinyLink"
   git branch -M main
   git remote add origin https://github.com/yourusername/tinylink.git
   git push -u origin main
   ```

2. **Verify Files**
   - Make sure `.env` is in `.gitignore` (it already is)
   - Verify `package.json` has all scripts

### Step 3: Deploy to Vercel

1. **Go to Vercel**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Repository**
   - Click "Add New" → "Project"
   - Select your `tinylink` repository
   - Click "Import"

3. **Configure Environment Variables**
   - In the deployment configuration, click "Environment Variables"
   - Add these variables:
   
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   (Use your Neon connection string from Step 1)
   
   ```
   NEXT_PUBLIC_BASE_URL=https://tinylink-yourusername.vercel.app
   ```
   (You'll update this after first deployment with your actual Vercel URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

5. **Update Base URL**
   - After deployment, copy your Vercel URL (e.g., `https://tinylink-abc123.vercel.app`)
   - Go to Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_BASE_URL` with your actual URL
   - Redeploy (Deployments → three dots → Redeploy)

### Step 4: Run Database Migrations

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Your Project**
   ```bash
   vercel link
   ```
   - Select your Vercel account and project

4. **Run Migrations**
   ```bash
   vercel env pull .env.local
   npm run migrate:deploy
   ```

   Alternatively, you can run migrations from your local machine:
   ```bash
   # Set DATABASE_URL to your Neon connection string
   export DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   npm run migrate:deploy
   ```

5. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

### Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test creating a link
3. Test redirect: `https://your-url.vercel.app/yourcode`
4. Test health check: `https://your-url.vercel.app/healthz`

✅ **You're done!** Your TinyLink is now live.

---

## Option 2: Railway + PostgreSQL

Railway provides a simple all-in-one deployment with built-in PostgreSQL.

### Step 1: Set Up Railway

1. **Create Account**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `tinylink` repository

3. **Add PostgreSQL**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a database

### Step 2: Configure Environment Variables

1. **Get Database URL**
   - Click on your PostgreSQL service
   - Go to "Connect" tab
   - Copy the "Postgres Connection URL"

2. **Add Variables to Your App**
   - Click on your app service
   - Go to "Variables" tab
   - Add:
     - `DATABASE_URL`: (paste your Postgres URL)
     - `NEXT_PUBLIC_BASE_URL`: `https://your-app.railway.app` (you'll get this after deployment)

### Step 3: Deploy

1. **Trigger Deployment**
   - Railway automatically deploys on push to main
   - Or click "Deploy" manually

2. **Get Your URL**
   - After deployment, go to "Settings" → "Generate Domain"
   - Copy your Railway domain

3. **Update Base URL**
   - Go back to "Variables"
   - Update `NEXT_PUBLIC_BASE_URL` with your Railway domain
   - Redeploy

### Step 4: Run Migrations

1. **Via Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway run npm run migrate:deploy
   ```

2. **Or via Local Machine**
   ```bash
   export DATABASE_URL="postgresql://..."
   npm run migrate:deploy
   npm run seed
   ```

---

## Option 3: Render + Neon

### Step 1: Set Up Neon (Same as Option 1)

Follow "Step 1: Set Up Neon PostgreSQL" from Option 1.

### Step 2: Deploy to Render

1. **Create Account**
   - Go to [https://render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `tinylink`
     - Environment: `Node`
     - Build Command: `npm install && npm run prisma:generate && npm run build`
     - Start Command: `npm start`

3. **Add Environment Variables**
   - In the Environment tab, add:
     - `DATABASE_URL`: (your Neon connection string)
     - `NEXT_PUBLIC_BASE_URL`: (will be `https://tinylink.onrender.com`)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5 minutes)

### Step 3: Run Migrations

Use your local machine with Neon connection string:
```bash
export DATABASE_URL="postgresql://..."
npm run migrate:deploy
npm run seed
```

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Health check works: `GET /healthz` returns `{ "ok": true, "version": "1.0" }`
- [ ] Can create links via UI
- [ ] Can create links via API: `POST /api/links`
- [ ] List all links works: `GET /api/links`
- [ ] Stats page works: `/code/:code`
- [ ] Redirect works: `/:code` → 302 to target URL
- [ ] Click count increments on redirect
- [ ] Can delete links
- [ ] After deletion, redirect returns 404
- [ ] Custom codes work
- [ ] Duplicate codes return 409
- [ ] Invalid URLs return 400
- [ ] Invalid codes return 400

---

## Troubleshooting

### Build Fails on Vercel/Railway/Render

**Error**: `Prisma Client not generated`

**Solution**: Ensure `postinstall` script in `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Fails

**Error**: `Can't reach database server`

**Solution**: 
- Verify `DATABASE_URL` is set correctly
- For Neon, ensure `?sslmode=require` is in the connection string
- Check database is running and accessible from deployment platform

### Redirects Don't Work

**Error**: 404 on `/:code`

**Solution**:
- Ensure migrations have run: `npm run migrate:deploy`
- Check database has data: log in to Neon/Railway dashboard
- Verify code exists in database

### Environment Variables Not Working

**Error**: `process.env.NEXT_PUBLIC_BASE_URL is undefined`

**Solution**:
- For `NEXT_PUBLIC_*` variables, you must redeploy after setting them
- Verify variables are set in your platform's dashboard
- Don't use quotes around values in dashboard

---

## Updating Your Deployment

To deploy updates:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Auto-Deploy**
   - Vercel/Railway/Render will automatically deploy
   - Monitor build logs for errors

3. **Manual Deploy**
   - Vercel: Go to Deployments → three dots → Redeploy
   - Railway: Click "Deploy" in your service
   - Render: Click "Manual Deploy" → "Deploy latest commit"

---

## Cost Summary

All platforms offer free tiers suitable for this project:

| Platform | Free Tier | Limits |
|----------|-----------|--------|
| Neon | Free | 3 GB storage, 1 compute |
| Vercel | Free | 100 GB bandwidth/month |
| Railway | $5 credit/month | ~500 hours |
| Render | Free | 750 hours/month |

For the take-home assignment, free tiers are more than sufficient.

---

## Support

If you encounter issues:

1. Check platform status pages
2. Review build logs in platform dashboard
3. Test locally first: `npm run build && npm start`
4. Verify environment variables match `.env.example`

---

**Last Updated**: [Current Date]

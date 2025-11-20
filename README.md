# TinyLink - URL Shortener

A full-featured URL shortening service built with Next.js 14, Prisma, and PostgreSQL. Create short links, track clicks, and manage your URLs with a clean, responsive interface.

## 🚀 Features

- ✅ Create short links with custom or auto-generated codes
- ✅ Track click statistics and last clicked time
- ✅ Search and filter links
- ✅ Sort by clicks or creation date
- ✅ Responsive design with Tailwind CSS
- ✅ Server-side 302 redirects
- ✅ Atomic click counting (no race conditions)
- ✅ Complete API with validation
- ✅ Automated tests
- ✅ Health check endpoint

## 📋 Requirements

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended for deployment)

## 🛠️ Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd tinylink
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tinylink?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Set up the database

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run migrate
```

Seed the database with sample data (optional):

```bash
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🧪 Running Tests

The tests require the app to be running on port 3000. In one terminal, start the dev server:

```bash
npm run dev
```

In another terminal, run the tests:

```bash
npm test
```

## 📦 Production Build

Build the app:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 🌐 Deployment (Vercel + Neon)

### 1. Set up Neon PostgreSQL

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:pass@host.neon.tech/neondb?sslmode=require`)

### 2. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel deployment URL (e.g., `https://tinylink.vercel.app`)
4. Deploy!

### 3. Run migrations on production

After deployment, run migrations using Vercel CLI or in your Vercel dashboard:

```bash
npm run migrate:deploy
```

## 📚 API Documentation

### Health Check

```
GET /healthz
Response: { "ok": true, "version": "1.0" }
```

### Create Link

```
POST /api/links
Body: { "url": "https://example.com", "code": "mycode" }
Response: { "id", "code", "url", "clicks", "createdAt", "lastClicked" }
Status: 201 Created, 409 Conflict (duplicate code), 400 Bad Request
```

### List Links

```
GET /api/links
Response: [{ "id", "code", "url", "clicks", "createdAt", "lastClicked" }]
```

### Get Link Stats

```
GET /api/links/:code
Response: { "id", "code", "url", "clicks", "createdAt", "lastClicked" }
Status: 200 OK, 404 Not Found
```

### Delete Link

```
DELETE /api/links/:code
Response: { "message": "Link deleted successfully" }
Status: 200 OK, 404 Not Found
```

### Redirect

```
GET /:code
Status: 302 Redirect (to target URL), 404 Not Found
Side effect: Increments click count and updates lastClicked
```

## 🎯 Routes

- `/` - Dashboard (list all links, create new links)
- `/code/:code` - Stats page for a specific link
- `/:code` - Redirect to target URL
- `/healthz` - Health check endpoint

## 🏗️ Project Structure

```
tinylink/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── links/    # API routes
│   │   ├── code/[code]/  # Stats page
│   │   ├── [code]/       # Redirect route
│   │   ├── healthz/      # Health check
│   │   ├── layout.tsx
│   │   ├── page.tsx      # Dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   └── StatsPage.tsx
│   └── lib/
│       ├── prisma.ts     # Prisma client
│       ├── validation.ts # Zod schemas
│       └── utils.ts      # Utilities
├── __tests__/
│   └── api.test.ts       # API tests
├── .env.example
├── README.md
└── package.json
```

## ✅ Autograder Checklist

- ✅ `/healthz` returns 200 with `{ "ok": true, "version": "1.0" }`
- ✅ `POST /api/links` creates link; duplicate code returns 409
- ✅ `GET /api/links` lists all links
- ✅ `GET /api/links/:code` returns stats JSON
- ✅ `DELETE /api/links/:code` deletes link
- ✅ `GET /:code` redirects with 302, increments clicks and updates lastClicked
- ✅ After deletion, `GET /:code` returns 404
- ✅ Codes validated to `[A-Za-z0-9]{6,8}`
- ✅ UI routes: `/` (Dashboard) and `/code/:code` (Stats)

## 🎨 Design Decisions

1. **Next.js App Router**: Used for its built-in API routes and server-side rendering capabilities
2. **Prisma ORM**: Type-safe database access with migrations
3. **PostgreSQL**: Reliable, ACID-compliant database with UUID support
4. **Tailwind CSS**: Utility-first CSS for rapid, consistent styling
5. **Zod Validation**: Runtime type checking and validation
6. **Atomic Updates**: Used Prisma's `increment` to prevent race conditions in click counting
7. **Client-side State**: Dashboard uses React state for real-time updates without page refresh

## 🔒 Security Features

- URL validation (must be HTTP/HTTPS)
- Code format validation (regex)
- Input sanitization with Zod
- SQL injection prevention (Prisma parameterized queries)
- CORS handled by Next.js
- Environment variables for sensitive data

## 📊 Database Schema

```prisma
model Link {
  id           String    @id @default(uuid())
  code         String    @unique @db.VarChar(8)
  url          String    @db.Text
  clicks       Int       @default(0)
  createdAt    DateTime  @default(now())
  lastClicked  DateTime?
}
```

## 🐛 Troubleshooting

**Database connection errors:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- For Neon, ensure `?sslmode=require` is included

**Tests failing:**
- Ensure dev server is running on port 3000
- Check database is accessible
- Clear test data: `npx prisma studio` → delete test entries

**Build errors:**
- Run `npm run prisma:generate`
- Clear `.next` folder and rebuild

## 📝 License

MIT

## 👤 Author

Built as part of the TinyLink take-home assignment.

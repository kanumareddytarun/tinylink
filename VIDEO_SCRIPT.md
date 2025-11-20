# TinyLink - Video Walkthrough Script (2-4 minutes)

## Introduction (30 seconds)

"Hi! I'm going to walk you through my TinyLink URL shortener implementation. This is a full-stack Next.js application that meets all the requirements from the assignment specification. Let me show you the architecture and key features."

## Architecture Overview (45 seconds)

"The project uses Next.js 14 with the App Router, Prisma ORM for database access, and PostgreSQL for data persistence. The structure is clean and modular:

- API routes handle all backend logic under `/app/api/links`
- The redirect logic lives in `/app/[code]/route.ts` as a dynamic route
- Two main pages: the dashboard at the root and a stats page at `/code/[code]`
- All validation is centralized in the `lib/validation.ts` file using Zod schemas

The database has a single `links` table with fields for code, URL, clicks, and timestamps."

## Key Features Demo (60 seconds)

"Let me show you the main features:

1. **Creating links**: Users can create short links with custom codes or auto-generated ones. The form has inline validation and shows errors immediately. If a duplicate code is used, the API returns a 409 status code as required.

2. **Dashboard**: Shows all links in a sortable table with search functionality. You can click on any code to see detailed stats, copy the short URL, or delete links with confirmation.

3. **Redirect mechanism**: When someone visits `/:code`, the app performs a server-side 302 redirect and atomically increments the click count using Prisma's increment feature. This prevents race conditions.

4. **Stats page**: Shows detailed information for each link including total clicks, creation date, and last clicked time.

5. **Health check**: The `/healthz` endpoint returns the required JSON response for automated testing."

## Code Quality & Testing (45 seconds)

"The code follows best practices:

- All codes are validated with the regex `[A-Za-z0-9]{6,8}` as specified
- URLs must include http:// or https://
- Atomic database updates prevent race conditions
- The redirect route uses Next.js server-side rendering for true 302 redirects
- I've included comprehensive tests that cover all autograder requirements: health check, CRUD operations, duplicate handling, and the redirect flow

You can run `npm test` to verify everything passes. The tests check status codes, response formats, and the click increment behavior."

## Deployment (30 seconds)

"For deployment, the README includes step-by-step instructions for Vercel and Neon Postgres. The `.env.example` file shows all required environment variables. The migration system uses Prisma, so setup is just `npm run migrate` locally or `npm run migrate:deploy` in production. I've also included a seed script with sample data."

## Conclusion (10 seconds)

"That covers the main features and implementation. The complete code is on GitHub, and you can test the deployed version at the URL I submitted. Thanks for reviewing my submission!"

---

## Key Points to Emphasize

- ✅ Exact adherence to API specifications (routes, status codes, response formats)
- ✅ Server-side 302 redirects (not client-side)
- ✅ Atomic click counting
- ✅ Code validation matching the regex
- ✅ 409 for duplicate codes
- ✅ 404 after deletion
- ✅ Comprehensive tests
- ✅ Clean, modular code structure
- ✅ Production-ready deployment setup

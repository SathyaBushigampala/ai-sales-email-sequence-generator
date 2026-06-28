# AI Sales Email Sequence Generator

A complete, production-ready AI-powered email sequence generator for brandsparkx.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database/ORM**: PostgreSQL (currently configured as SQLite for local development compatibility) + Prisma
- **Auth**: NextAuth.js (credentials provider)
- **AI**: Groq API (LLaMA 3.3) via server-only routes
- **Styling**: Tailwind CSS with next-themes for Dark Mode
- **Validation**: Zod + React Hook Form
- **Charts**: Recharts
- **Exports**: `@react-pdf/renderer` (PDF), `docx` (Word), TXT

## Architecture Overview
The application uses Next.js App Router for all frontend views and backend API routes.
- **Frontend**: Clean, responsive UI with Tailwind CSS. State managed via React Hooks.
- **API Routes**: Next.js Serverless Functions (`src/app/api/...`) process form submissions, fetch data, and interact with the AI.
- **AI Call Path**: The client submits a form -> POST `/api/generate` -> Validated with Zod -> Prompt constructed using "v4" schema -> Groq API called -> Response parsed robustly -> Saved to database -> Returned to client.

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required variables (especially `GROQ_API_KEY`).
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure `DATABASE_URL` is set appropriately based on your database provider.*

3. **Database Setup**:
   The project is currently configured to use SQLite for easy local development without Docker. To use PostgreSQL (as required for production):
   - Open `prisma/schema.prisma` and change `provider = "sqlite"` back to `provider = "postgresql"`.
   - Change `Json` to `String` back to `Json` for PostgreSQL native JSON support.
   - Run the migration against your Postgres instance:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

## Production Deployment (Vercel + Supabase/Railway)
1. **Database**: Provision a Postgres database on Supabase or Railway. Obtain the connection string.
2. **Vercel**: Import the GitHub repository into Vercel.
3. **Environment Variables**: Add `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `GROQ_API_KEY` to Vercel's environment variables settings.
4. **Build Command**: Vercel will automatically run `npm run build` and `npx prisma generate`.
5. **Migrations**: Ensure you run `npx prisma migrate deploy` in your CI/CD pipeline or manually against the production database to create the schema.

## API Documentation
- `POST /api/auth/register` - Create a new user account.
- `POST /api/generate` - Generate an AI email sequence. Expects prospect profile, objective, and constraints. Auth required.
- `GET /api/history` - Fetch user's generation history. Auth required.
- `GET /api/history/[id]` - Fetch a specific generation. Auth required.
- `DELETE /api/history/[id]` - Delete a specific generation. Auth required.
- `POST /api/feedback` - Submit feedback for a generation. Auth required.
- `GET /api/templates` - Fetch available templates. Auth required.
- `POST /api/templates` - Create a template. Admin Auth required.
- `GET /api/admin/analytics` - Fetch system-wide analytics. Admin Auth required.
- `GET /api/export/[id]?format=pdf|docx|txt` - Export a generation. Auth required.

## Testing Checklist
- [x] Sign up → log in → generate a sequence → see 5 emails with subjects/bodies/CTAs
- [x] Rate the generation, regenerate, confirm a different result
- [x] Export as PDF, DOCX, and TXT — open each and confirm content is correct
- [x] View history, open a past item, delete one
- [x] Apply a template, confirm form auto-fills
- [x] Log in as admin, view analytics, confirm charts render with real data
- [x] Resize browser to mobile/tablet/desktop — confirm layout holds
- [x] Toggle dark mode — confirm no unstyled/broken elements
- [x] Try accessing `/admin/analytics` as a non-admin — confirm redirect/block

## Known Issues
- *(None - Build finished successfully)*

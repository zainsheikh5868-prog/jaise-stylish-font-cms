# Autonomous Stylish Name Platform

A two-portal, database-driven web utility: a public Unicode font/username generator and a standalone autonomous CMS/admin panel. The UI is intentionally dark, minimal and compact to match the supplied admin references without copying their proprietary code or content.

## Architectural interpretation

“Zero third-party dependencies” and “Supabase integration” conflict if Supabase is consumed as a hosted SaaS. This project therefore treats **autonomy** as: no external CMS, no external editing dashboard, no manual content redeploy, no external image host, and no required analytics UI. Supabase is only the persistence/auth/storage layer and can be **self-hosted** if absolute infrastructure independence is required. The application itself remains the only operational control panel.

## Information architecture

Public portal:

- `/` — primary live font/name generator, username generator, FAQ block and schemas.
- `/blog` — published article archive.
- `/blog/[slug]` — database-rendered article with BlogPosting metadata.
- `/sitemap.xml` — database-generated sitemap.
- `/robots.txt` — database-generated crawl directives.
- Redirects and disabled routes are enforced in middleware.

Admin portal:

- `/admin` — Active Users, Live Articles, sitemap/indexable URL count and system health.
- `/admin/pages` — route enable/disable and page metadata.
- `/admin/content` — global/page microcopy.
- `/admin/blog` — article content, status, tags, publish date and post-level SEO.
- `/admin/seo` — site-wide metadata and canonical defaults.
- `/admin/sitemap` — sitemap path inclusion, frequency and priority.
- `/admin/scripts` — global/page head/body script and pixel injection.
- `/admin/ads` — header/sidebar/inline/bottom/custom ad slots.
- `/admin/redirects` — live 301/302 redirects.
- `/admin/media` — storage upload, preview, delete and copy URL.
- `/admin/faqs` — ordered FAQ content; public FAQPage schema is generated automatically.
- `/admin/popups` — banner/modal/affiliate notices with immediate, delay and exit-intent triggers.
- `/admin/robots` — visual robots.txt rules.
- `/admin/backups` — authenticated JSON snapshot export and restore.
- `/admin/settings` — branding/footer/public settings.

## Directory layout

```text
app/
  admin/
    [section]/page.js
    backups/page.js
    login/page.js
    media/page.js
    page.js
  api/
    analytics/route.js
    backup/route.js
    restore/route.js
  blog/
    [slug]/page.js
    page.js
  robots.txt/route.js
  sitemap.xml/route.js
  globals.css
  layout.js
  page.js
components/
  AdminShell.jsx
  FontGenerator.jsx
  ResourceEditor.jsx
  RuntimeIngestor.jsx
lib/
  admin-resources.js
  auth-server.js
  font-engine.js
  supabase-browser.js
  supabase-server.js
sql/
  bootstrap-admin.sql
  schema.sql
middleware.js
next.config.mjs
```

## Unicode engine

`lib/font-engine.js` is pure JavaScript and has no runtime font API dependency. It includes mathematical bold/italic/sans/mono, double-struck, Fraktur, script/cursive, circled, fullwidth, parenthesized, tiny caps, superscript/subscript, upside-down, Zalgo/glitch, Japanese aesthetic formatting and 48+ decorated derivatives. `generateStyles()` returns more than 60 copyable variants from one input.

The engine is implemented independently from public Unicode standards and does not copy proprietary source code from reference websites.

## Full-stack wiring

- Admin CRUD writes directly to PostgreSQL through Supabase with RLS.
- Public pages read only enabled/published rows.
- Runtime script/pixel injection reads the active script table.
- Popups are rendered from the popup table using route and trigger conditions.
- Ad components resolve active slot code from the ad table.
- Middleware reads live redirects and page enabled state, so changes do not require a build.
- `/sitemap.xml` and `/robots.txt` are generated from live database rows.
- FAQ schema is generated from the exact visible FAQ rows.
- BlogPosting and WebApplication schemas are generated server-side.
- Media goes to the `media` storage bucket and is managed only from `/admin/media`.
- Backup/restore endpoints require an authenticated admin and keep the service-role key server-only.
- First-party pageview/heartbeat analytics powers the dashboard without requiring Google Analytics.

## Setup

1. Create or self-host Supabase.
2. Run `sql/schema.sql` in the SQL editor.
3. Create the first Auth user using the Supabase Auth bootstrap method available in your deployment.
4. Put that Auth user UUID into `sql/bootstrap-admin.sql` and run it.
5. Copy `.env.example` to `.env.local` and populate the values.
6. Install and run:

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
npm start
```

## Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in a browser bundle.

## SEO notes

The project uses semantic server-rendered HTML for crawl-critical content. Generator interaction is client-side only. Sitemap, redirects, robots rules, canonical defaults, FAQ schema and post metadata are stored in the CMS. Keep user-generated/decorative outputs out of the indexed URL space unless each page has substantial unique explanatory content; mass-indexing thin generated pages is poor SEO architecture.

Google has changed how prominently some structured data types are displayed over time. Structured data should describe visible content accurately rather than being added solely to force a rich result.

## Production hardening checklist

Before public launch, add infrastructure-level rate limiting/WAF rules for `/api/analytics` and authentication endpoints; configure database PITR/backups in addition to CMS JSON exports; add CSP tailored to the exact third-party scripts you choose to inject; sanitize untrusted rich HTML if editor access is delegated; create staging and production projects; and add automated E2E tests for publish, redirect, upload, restore and route-disable workflows.

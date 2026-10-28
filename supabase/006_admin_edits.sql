-- title24directory.com — admin listing edits (Prompt 11)
--
-- 1. raters.admin_edited_at — when an admin last changed the listing. Public-safe
--    (a timestamp, no content); the sitemap uses it for lastmod and the admin
--    dashboard shows "Edited by admin — <date>".
--
-- 2. rater_admin_edits — the as-submitted values, captured the FIRST time an
--    admin edit changes a listing and never overwritten afterwards.
--
--    This is a separate table on purpose. `raters` is readable by the public
--    anon key for approved rows, column by column — an original_description
--    column there would be fetchable from the browser even though no page
--    renders it. This table has RLS on and NO policies, so only the service
--    role (the admin server actions) can read or write it.
--
-- Every statement is IF NOT EXISTS / duplicate-safe, so this can be re-run.
--
-- The app tolerates this migration not having run yet: the dashboard simply
-- shows no "edited" notes, and saving an edit refuses with a message rather than
-- changing a listing without preserving its original.

BEGIN;

ALTER TABLE raters ADD COLUMN IF NOT EXISTS admin_edited_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS rater_admin_edits (
  rater_id        UUID PRIMARY KEY REFERENCES raters(id) ON DELETE CASCADE,
  original        JSONB NOT NULL,          -- as-submitted editable fields
  first_edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_edited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edit_count      INT NOT NULL DEFAULT 1
);

ALTER TABLE rater_admin_edits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rater_admin_edits FROM anon, authenticated;

-- Belt and braces on the listings table itself: the public never writes to
-- raters directly (Get Listed inserts through the service role), so take the
-- write grants away from the public roles entirely. RLS already blocks them;
-- this means a future permissive policy can't open them by accident.
REVOKE INSERT, UPDATE, DELETE ON raters FROM anon, authenticated;

COMMIT;

-- verification ---------------------------------------------------------------
-- Expect: admin_edited_at present on raters.
SELECT column_name, data_type FROM information_schema.columns
 WHERE table_name = 'raters' AND column_name = 'admin_edited_at';

-- Expect: rater_admin_edits with rls_on = true and zero policies.
SELECT c.relname, c.relrowsecurity AS rls_on,
       (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname) AS policies
  FROM pg_class c WHERE c.relname = 'rater_admin_edits';

-- Expect: no rows — anon/authenticated hold no write grant on raters and no
-- grant at all on rater_admin_edits.
SELECT grantee, table_name, privilege_type
  FROM information_schema.role_table_grants
 WHERE grantee IN ('anon','authenticated')
   AND ((table_name = 'raters' AND privilege_type IN ('INSERT','UPDATE','DELETE'))
        OR table_name = 'rater_admin_edits');

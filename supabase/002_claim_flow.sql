-- title24directory.com — claim / correct / remove flow
-- Required before publishing listings that were seeded from public research
-- rather than submitted by the business itself.

BEGIN;

-- 1. Mark where a listing came from. Existing rows are self-submitted.
ALTER TABLE raters ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'self';
DO $$ BEGIN
  ALTER TABLE raters ADD CONSTRAINT raters_source_check CHECK (source IN ('self','seeded'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Requests from businesses about their listing.
CREATE TABLE IF NOT EXISTS listing_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  rater_id     UUID REFERENCES raters(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('claim','correct','remove')),
  business_name TEXT,
  contact_name TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  message      TEXT,
  handled      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS listing_requests_handled_idx ON listing_requests (handled, created_at DESC);

-- 3. Lock it down. Writes go through the server action's service client only,
--    exactly like the Get Listed form. Nothing here is publicly readable —
--    these rows carry contact details and should never be enumerable.
ALTER TABLE listing_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS listing_requests_no_public_read  ON listing_requests;
DROP POLICY IF EXISTS listing_requests_no_public_write ON listing_requests;

COMMIT;

-- verification
SELECT relname AS tbl, relrowsecurity AS rls_on FROM pg_class
 WHERE relname IN ('raters','listing_requests') ORDER BY 1;
SELECT source, count(*) FROM raters GROUP BY source;

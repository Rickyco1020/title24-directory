-- title24directory.com — verified removal requests
--
-- Anyone could previously file a "remove this listing" request for any listing:
-- the rater_id is printed on the public card, and nothing proved the requester
-- had anything to do with the business. This adds a confirmation loop — the
-- request is only actionable once the address already on file for that listing
-- clicks through and confirms.

BEGIN;

ALTER TABLE listing_requests ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'not_required';
DO $$ BEGIN
  ALTER TABLE listing_requests ADD CONSTRAINT listing_requests_verification_status_check
    CHECK (verification_status IN ('not_required','pending','verified','unverifiable'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Random, single-use, service-role-only. Never rendered to the public.
ALTER TABLE listing_requests ADD COLUMN IF NOT EXISTS verify_token   TEXT;
-- The on-file address the confirmation went to, so the admin can see who vouched.
ALTER TABLE listing_requests ADD COLUMN IF NOT EXISTS verify_sent_to TEXT;
ALTER TABLE listing_requests ADD COLUMN IF NOT EXISTS verified_at    TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS listing_requests_verify_token_idx
  ON listing_requests (verify_token) WHERE verify_token IS NOT NULL;

-- Existing rows predate the loop; leave them as-is rather than retroactively
-- marking them unverified.
UPDATE listing_requests SET verification_status = 'not_required'
 WHERE verification_status IS NULL;

COMMIT;

-- verification
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'listing_requests'
   AND column_name IN ('verification_status','verify_token','verify_sent_to','verified_at')
 ORDER BY 1;

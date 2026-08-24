-- title24directory.com — fold the 'ecc' service value into 'hers'
--
-- HERS and ECC are the same role. The 2025 California Energy Code renames the
-- Home Energy Rating System program to Energy Code Compliance; the certification,
-- the field verification, and the people doing it are unchanged. The directory
-- listed them as two categories, which meant one business could show two badges
-- for the same service and a searcher could filter themselves away from raters
-- who were only tagged the other way.
--
-- After this runs, 'hers' is the only stored value. The application still reads
-- 'ecc' as an alias (lib/categories.ts), so running this is safe in either order
-- relative to the deploy, and re-running it is a no-op.
--
-- Run in the Supabase SQL editor:
--   supabase.com/dashboard/project/hmauqghukiluiqammpzf/sql

BEGIN;

-- Before: how many rows are affected, and how many already carry both values.
--   SELECT count(*) FILTER (WHERE 'ecc' = ANY(services))                        AS has_ecc,
--          count(*) FILTER (WHERE 'ecc' = ANY(services) AND 'hers' = ANY(services)) AS has_both
--   FROM raters;

WITH expanded AS (
  SELECT r.id,
         CASE WHEN s = 'ecc' THEN 'hers' ELSE s END AS svc,
         min(ord) AS ord
  FROM raters r,
       unnest(r.services) WITH ORDINALITY AS t(s, ord)
  WHERE 'ecc' = ANY(r.services)
  GROUP BY r.id, CASE WHEN s = 'ecc' THEN 'hers' ELSE s END
),
merged AS (
  SELECT id, array_agg(svc ORDER BY ord) AS services
  FROM expanded
  GROUP BY id
)
UPDATE raters r
SET services = m.services
FROM merged m
WHERE r.id = m.id;

COMMIT;

-- After — both must return 0:
--   SELECT count(*) FROM raters WHERE 'ecc' = ANY(services);
--   SELECT count(*) FROM raters WHERE array_length(services, 1) <> (
--     SELECT count(DISTINCT s) FROM unnest(services) AS s
--   );

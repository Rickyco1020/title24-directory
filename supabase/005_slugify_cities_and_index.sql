-- Two things the app-side city fix cannot do on its own.
--
-- 1. BACKFILL. `cities_served` is queried with `@>` against slugs ('irvine'),
--    but the Get Listed form used to store whatever the rater typed ('Irvine',
--    ' Irvine ', 'IRVINE'). Those rows never matched a city query — the rater
--    was invisible on their own city page. New submissions are normalised in
--    app/get-listed/actions.ts (parseCitiesServed); this brings existing rows
--    into line so old and new listings are keyed the same way.
--
--    Conservative on purpose: it lowercases, trims, strips punctuation and
--    collapses whitespace to hyphens — the same transformation as slugify() in
--    lib/california-data.ts. It does not guess at misspellings, and it is
--    idempotent, so a value that is already a slug is left alone and re-running
--    the whole file is a no-op.
--
-- 2. INDEXES. Every city and county page now runs two array-containment
--    predicates per row. At ~50 listings that is free; at a few thousand it is a
--    sequential scan on each of 540+ statically generated pages.

-- ---- 1. backfill -----------------------------------------------------------

CREATE OR REPLACE FUNCTION t24_slugify(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(
    both '-' FROM
    regexp_replace(
      regexp_replace(
        regexp_replace(lower(trim(input)), '[^a-z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

UPDATE raters
SET cities_served = (
  SELECT array_agg(DISTINCT s ORDER BY s)
  FROM (
    SELECT t24_slugify(c) AS s
    FROM unnest(cities_served) AS c
  ) t
  WHERE s <> ''
)
WHERE cities_served IS NOT NULL
  AND cities_served <> '{}'
  -- Only rows that would actually change, so re-running touches nothing.
  AND EXISTS (
    SELECT 1 FROM unnest(cities_served) AS c WHERE c <> t24_slugify(c)
  );

-- Counties are queried the same way and deserve the same guarantee.
UPDATE raters
SET counties_served = (
  SELECT array_agg(DISTINCT s ORDER BY s)
  FROM (
    SELECT t24_slugify(c) AS s
    FROM unnest(counties_served) AS c
  ) t
  WHERE s <> ''
)
WHERE counties_served IS NOT NULL
  AND counties_served <> '{}'
  AND EXISTS (
    SELECT 1 FROM unnest(counties_served) AS c WHERE c <> t24_slugify(c)
  );

-- ---- 2. indexes ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS raters_cities_served_gin
  ON raters USING GIN (cities_served);

CREATE INDEX IF NOT EXISTS raters_counties_served_gin
  ON raters USING GIN (counties_served);

CREATE INDEX IF NOT EXISTS raters_services_gin
  ON raters USING GIN (services);

-- Routines store only their recurrence rule; occurrences are computed in
-- src/lib/recurrence.ts. A routine_completions row means that occurrence
-- is done.
CREATE TABLE routines (
  id serial PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title text NOT NULL,
  category_id integer REFERENCES categories(id) ON DELETE SET NULL,
  freq text NOT NULL CHECK (freq IN ('day', 'week', 'month', 'year')),
  "interval" integer NOT NULL CHECK ("interval" BETWEEN 1 AND 99),
  -- ISO weekdays (1 = Monday ... 7 = Sunday), only used when freq = 'week'.
  weekdays smallint[],
  -- Day of the month for freq = 'month' and 'year': 1-31, or -1 for the
  -- last day. Days past a month's length fall back to that month's last day.
  month_day smallint CHECK (month_day = -1 OR month_day BETWEEN 1 AND 31),
  -- Month of the year (1-12) for freq = 'year'.
  year_month smallint CHECK (year_month BETWEEN 1 AND 12),
  anchor_date date NOT NULL,
  keep_open boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (freq <> 'week' OR (weekdays IS NOT NULL AND cardinality(weekdays) > 0)),
  CHECK (freq <> 'month' OR month_day IS NOT NULL),
  CHECK (freq <> 'year' OR (month_day IS NOT NULL AND year_month IS NOT NULL))
);

CREATE INDEX routines_user_id_idx ON routines (user_id);

CREATE TABLE routine_completions (
  routine_id integer NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  occurrence_date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (routine_id, occurrence_date)
);

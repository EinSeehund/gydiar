-- App-owned tables: categories, projects, tasks.
-- Run this after the better-auth tables (user, session, account, verification,
-- rateLimit) have been created, since these tables reference "user".
-- See README.md "Database setup" for the full order of operations.

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  color varchar(7),
  slug text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE (user_id, name),
  UNIQUE (user_id, slug)
);

CREATE INDEX categories_user_id_idx ON categories (user_id);

CREATE TABLE projects (
  id serial PRIMARY KEY,
  name varchar(150) NOT NULL,
  completed_at timestamptz,
  slug text NOT NULL,
  description text,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE (user_id, slug)
);

CREATE INDEX projects_user_id_idx ON projects (user_id);

CREATE TABLE tasks (
  id serial PRIMARY KEY,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'archived')),
  parent_task_id integer REFERENCES tasks(id) ON DELETE CASCADE,
  category_id integer REFERENCES categories(id) ON DELETE SET NULL,
  project_id integer REFERENCES projects(id) ON DELETE SET NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX tasks_user_id_idx ON tasks (user_id);
CREATE INDEX idx_tasks_category ON tasks (category_id);
CREATE INDEX idx_tasks_project ON tasks (project_id);

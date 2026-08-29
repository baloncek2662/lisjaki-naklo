CREATE TABLE tournament_state (
  id TEXT PRIMARY KEY CHECK (id = 'active'),
  state_json TEXT NOT NULL,
  revision INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE tournament_snapshots (
  revision INTEGER PRIMARY KEY,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

INSERT INTO tournament_state (id, state_json, revision, updated_at, updated_by)
VALUES (
  'active',
  '{"version":1,"id":"turnir-lisjaki-naklo","name":"Turnir odbojke na mivki – Lisjaki Naklo","createdAt":"2026-08-29T00:00:00.000Z","updatedAt":"2026-08-29T00:00:00.000Z","phase":"registration","targetCombinedScore":15,"courts":2,"players":[],"rounds":[],"finals":null}',
  1,
  '2026-08-29T00:00:00.000Z',
  'database migration'
);

INSERT INTO tournament_snapshots (revision, state_json, updated_at, updated_by)
SELECT revision, state_json, updated_at, updated_by
FROM tournament_state
WHERE id = 'active';

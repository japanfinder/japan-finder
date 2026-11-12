CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS request_items (id TEXT PRIMARY KEY, request_id TEXT NOT NULL, client_id TEXT NOT NULL, url TEXT NOT NULL, name TEXT NOT NULL, listed_price INTEGER, status TEXT NOT NULL DEFAULT 'pending', reason TEXT NOT NULL DEFAULT '', approved_price INTEGER, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(request_id) REFERENCES requests(id));
CREATE INDEX IF NOT EXISTS idx_items_request ON request_items(request_id);

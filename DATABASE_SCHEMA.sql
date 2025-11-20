-- TinyLink Database Schema
-- This is the SQL version of the Prisma schema (for reference)
-- Use Prisma migrations instead: npm run migrate

CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_clicked TIMESTAMP WITH TIME ZONE
);

-- Index for fast code lookups (used in redirects)
CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);

-- Comments for documentation
COMMENT ON TABLE links IS 'Stores all shortened URLs and their metadata';
COMMENT ON COLUMN links.code IS 'Short code (6-8 alphanumeric characters)';
COMMENT ON COLUMN links.url IS 'Target URL for redirection';
COMMENT ON COLUMN links.clicks IS 'Total number of times this link was clicked';
COMMENT ON COLUMN links.last_clicked IS 'Timestamp of the most recent click';

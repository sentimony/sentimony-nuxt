-- ============================================
-- Release 2: Tags Schema for Sentimony Records
-- ============================================

-- 1. Tag Types Table
-- Stores categories of tags: musicians, styles, countries, etc.
CREATE TABLE IF NOT EXISTS tag_types (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  title_plural VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tags Table
-- Individual tags with references to their type
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  type_id INT REFERENCES tag_types(id) ON DELETE CASCADE,
  description TEXT,
  image_url VARCHAR(500),
  country_code VARCHAR(5),  -- ISO country code for 'countries' type (UA, DE, IL)
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Release Tags Junction Table
-- Many-to-many relationship between releases and tags
CREATE TABLE IF NOT EXISTS release_tags (
  id SERIAL PRIMARY KEY,
  release_slug VARCHAR(100) NOT NULL,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(release_slug, tag_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tags_type_id ON tags(type_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_visible ON tags(visible) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_release_tags_release ON release_tags(release_slug);
CREATE INDEX IF NOT EXISTS idx_release_tags_tag ON release_tags(tag_id);

-- ============================================
-- Initial Data: Tag Types
-- ============================================

INSERT INTO tag_types (slug, title, title_plural, sort_order) VALUES
  ('musicians', 'Musician', 'Musicians', 1),
  ('styles', 'Style', 'Styles', 2),
  ('countries', 'Country', 'Countries', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tag_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_tags ENABLE ROW LEVEL SECURITY;

-- Public read access (for anon users)
CREATE POLICY "Allow public read access on tag_types"
  ON tag_types FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access on tags"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (visible = true);

CREATE POLICY "Allow public read access on release_tags"
  ON release_tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role has full access (for server-side operations)
CREATE POLICY "Allow service role full access on tag_types"
  ON tag_types FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access on tags"
  ON tags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access on release_tags"
  ON release_tags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

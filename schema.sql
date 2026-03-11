-- DigiSpex Database Schema
-- PostgreSQL

-- Session store (required by connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR NOT NULL COLLATE "default",
  "sess"   JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Users (customers, admins, owners)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  uid         VARCHAR(64) UNIQUE NOT NULL,   -- e.g. 'builtin_admin', 'u_1234567890'
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(200) UNIQUE NOT NULL,
  password    VARCHAR(200) NOT NULL,         -- bcrypt hash
  role        VARCHAR(20) NOT NULL DEFAULT 'customer', -- customer | admin | owner
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Carts (per user)
CREATE TABLE IF NOT EXISTS carts (
  id          SERIAL PRIMARY KEY,
  user_uid    VARCHAR(64) NOT NULL,
  product_id  VARCHAR(120) NOT NULL,
  qty         INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_uid, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  order_id    VARCHAR(64) UNIQUE NOT NULL,   -- app-generated e.g. 'DS-1234567890'
  user_uid    VARCHAR(64) NOT NULL,
  customer    JSONB NOT NULL DEFAULT '{}',   -- { name, email }
  items       JSONB NOT NULL DEFAULT '[]',   -- array of cart items with snapshot
  total       NUMERIC(12,2) NOT NULL DEFAULT 0,
  status      VARCHAR(40) NOT NULL DEFAULT 'processing',
  placed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PC Builds (per user)
CREATE TABLE IF NOT EXISTS builds (
  id          SERIAL PRIMARY KEY,
  user_uid    VARCHAR(64) UNIQUE NOT NULL,
  slots       JSONB NOT NULL DEFAULT '{}'   -- { CPU: 'pid', GPU: 'pid', ... }
);

-- Wishlists (per user)
CREATE TABLE IF NOT EXISTS wishlists (
  id          SERIAL PRIMARY KEY,
  user_uid    VARCHAR(64) UNIQUE NOT NULL,
  product_ids JSONB NOT NULL DEFAULT '[]'   -- array of product id strings
);

-- Notifications (per user)
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_uid    VARCHAR(64) NOT NULL,
  notif_id    VARCHAR(64) NOT NULL,
  type        VARCHAR(40) NOT NULL,
  title       VARCHAR(200),
  body        VARCHAR(500),
  order_id    VARCHAR(64),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages (customer ↔ admin)
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  thread_id   VARCHAR(64) NOT NULL,
  order_id    VARCHAR(64),
  sender_uid  VARCHAR(64) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,         -- customer | admin
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin data: stock status overrides
CREATE TABLE IF NOT EXISTS stock_status (
  product_id  VARCHAR(120) PRIMARY KEY,
  status      VARCHAR(30) NOT NULL DEFAULT 'normal', -- normal|sale|lowstock|outofstock
  qty         INTEGER NOT NULL DEFAULT 0
);

-- Admin data: custom products (admin-added)
CREATE TABLE IF NOT EXISTS custom_products (
  id          SERIAL PRIMARY KEY,
  product_id  VARCHAR(120) UNIQUE NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',  -- full product object
  image_data  TEXT,                         -- base64 or URL
  description TEXT,
  hidden      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin data: hidden built-in products
CREATE TABLE IF NOT EXISTS hidden_products (
  product_id  VARCHAR(120) PRIMARY KEY
);

-- Admin data: packages (PC build packages)
CREATE TABLE IF NOT EXISTS packages (
  id          SERIAL PRIMARY KEY,
  package_id  VARCHAR(120) UNIQUE NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(60) NOT NULL,
  product_id  VARCHAR(120),
  product_name VARCHAR(200),
  old_status  VARCHAR(30),
  new_status  VARCHAR(30),
  admin_uid   VARCHAR(64),
  extra       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed built-in admin and owner accounts
-- Passwords are bcrypt of 'admin123' and 'owner123'
-- You can regenerate with: node -e "const b=require('bcryptjs');console.log(b.hashSync('admin123',10))"
INSERT INTO users (uid, name, email, password, role, created_at)
VALUES
  ('builtin_admin', 'DigiSpex Admin', 'admin@digispex.ph',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'admin', '2025-01-01 00:00:00+00'),
  ('builtin_owner', 'DigiSpex Owner', 'owner@digispex.ph',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC8OXKCZkoX4/OeoeQa2',
   'owner', '2025-01-01 00:00:00+00')
ON CONFLICT (uid) DO NOTHING;

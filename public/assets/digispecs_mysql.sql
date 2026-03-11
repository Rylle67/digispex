CREATE DATABASE IF NOT EXISTS digispex
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE digispex;

-- ── Drop tables in FK-safe order ─────────────────────────────
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS builds;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS pending_verify;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;


-- ══════════════════════════════════════════════════════════════
--  PRODUCTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE products (
  id            VARCHAR(80)    NOT NULL,
  name          VARCHAR(200)   NOT NULL,
  cat           ENUM('CPU','GPU','Motherboard','RAM','Storage','PSU','Cooling','Case','Laptop')
                               NOT NULL,
  price_usd     DECIMAL(10,4)  NOT NULL COMMENT 'Base price in USD (multiply × 57 for PHP)',
  specs         TEXT           NOT NULL,
  description   TEXT           NULL,

  -- CPU / Motherboard compatibility fields
  socket        VARCHAR(20)    NULL COMMENT 'AM4 | AM5 | LGA1700 | LGA1851',
  tdp           SMALLINT       NULL COMMENT 'CPU thermal design power (watts)',
  mem_type      VARCHAR(10)    NULL COMMENT 'DDR4 | DDR5 — for CPU, MB, RAM',

  -- GPU / PSU power fields
  power_draw    SMALLINT       NULL COMMENT 'GPU power consumption (watts)',
  wattage       SMALLINT       NULL COMMENT 'PSU rated wattage',

  -- Laptop-specific fields
  brand         VARCHAR(60)    NULL,
  use_case      VARCHAR(40)    NULL COMMENT 'gaming | ultrabook | office | creator | budget',
  display_in    DECIMAL(4,1)   NULL COMMENT 'Display size in inches',

  -- Admin flags
  is_custom     TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '1 = added via admin panel',

  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_products_cat   (cat),
  INDEX idx_products_name  (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  INVENTORY  (stock status per product)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE inventory (
  product_id    VARCHAR(80)    NOT NULL,
  status        ENUM('normal','sale','lowstock','outofstock')
                               NOT NULL DEFAULT 'normal',
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (product_id),
  CONSTRAINT fk_inv_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  USERS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE users (
  id            VARCHAR(40)    NOT NULL,
  username      VARCHAR(50)    NOT NULL,
  email         VARCHAR(120)   NOT NULL,
  password_hash VARCHAR(255)   NOT NULL COMMENT 'bcrypt hash — never store plaintext',
  name          VARCHAR(100)   NOT NULL,
  role          ENUM('customer','admin')
                               NOT NULL DEFAULT 'customer',
  verified      TINYINT(1)     NOT NULL DEFAULT 0,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the hardcoded admin account (password = 'admin123' bcrypt)
INSERT INTO users (id, username, email, password_hash, name, role, verified)
VALUES (
  'admin1',
  'admin',
  'admin@digispex.com',
  '$2b$10$wJ9mH5xKqB2nPvL3dRtG.eZ1YqXmK8pN4sA6jC0uV7iTgW5bD9kOy', -- change in production
  'Admin',
  'admin',
  1
);


-- ══════════════════════════════════════════════════════════════
--  PENDING EMAIL VERIFICATIONS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE pending_verify (
  id            VARCHAR(40)    NOT NULL,
  username      VARCHAR(50)    NOT NULL,
  email         VARCHAR(120)   NOT NULL,
  password_hash VARCHAR(255)   NOT NULL,
  name          VARCHAR(100)   NOT NULL,
  otp_code      CHAR(6)        NOT NULL,
  expires_at    DATETIME       NOT NULL,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_pending_username (username),
  UNIQUE KEY uq_pending_email    (email),
  INDEX idx_pending_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Auto-clean expired OTPs (run as a scheduled event or cron)
CREATE EVENT IF NOT EXISTS clean_expired_otps
  ON SCHEDULE EVERY 15 MINUTE
  DO DELETE FROM pending_verify WHERE expires_at < NOW();


-- ══════════════════════════════════════════════════════════════
--  ORDERS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE orders (
  id                VARCHAR(30)    NOT NULL COMMENT 'e.g. DS-1A2B3C4D',
  user_id           VARCHAR(40)    NULL COMMENT 'NULL for guest checkout',
  customer_name     VARCHAR(100)   NOT NULL,
  customer_email    VARCHAR(120)   NULL,
  customer_phone    VARCHAR(30)    NULL,
  address           VARCHAR(255)   NULL,
  city              VARCHAR(80)    NULL,
  zip               VARCHAR(20)    NULL,
  total_php         DECIMAL(12,2)  NOT NULL,
  status            ENUM('processing','shipped','delivered','cancelled')
                                   NOT NULL DEFAULT 'processing',
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_orders_user    (user_id),
  INDEX idx_orders_status  (status),
  INDEX idx_orders_created (created_at DESC),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  ORDER ITEMS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE order_items (
  id              BIGINT         NOT NULL AUTO_INCREMENT,
  order_id        VARCHAR(30)    NOT NULL,
  product_id      VARCHAR(80)    NOT NULL COMMENT 'Snapshot — product may be deleted later',
  product_name    VARCHAR(200)   NOT NULL COMMENT 'Snapshot of name at time of order',
  product_cat     VARCHAR(40)    NULL,
  qty             SMALLINT       NOT NULL DEFAULT 1,
  unit_price_usd  DECIMAL(10,4)  NOT NULL COMMENT 'Price at time of order (before PHP conversion)',
  unit_price_php  DECIMAL(10,2)  NOT NULL COMMENT 'PHP price at time of order',

  PRIMARY KEY (id),
  INDEX idx_oi_order (order_id),
  CONSTRAINT fk_oi_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  CART ITEMS  (server-side cart per user)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE cart_items (
  id              BIGINT         NOT NULL AUTO_INCREMENT,
  user_id         VARCHAR(40)    NOT NULL,
  product_id      VARCHAR(80)    NOT NULL,
  qty             SMALLINT       NOT NULL DEFAULT 1,
  added_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id)     REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  BUILDS  (saved PC builder configs per user)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE builds (
  id              VARCHAR(40)    NOT NULL,
  user_id         VARCHAR(40)    NOT NULL,
  name            VARCHAR(100)   NOT NULL DEFAULT 'My Build',

  -- Each slot stores the chosen product_id (nullable = not selected)
  cpu_id          VARCHAR(80)    NULL,
  gpu_id          VARCHAR(80)    NULL,
  motherboard_id  VARCHAR(80)    NULL,
  ram_id          VARCHAR(80)    NULL,
  storage_id      VARCHAR(80)    NULL,
  psu_id          VARCHAR(80)    NULL,
  cooling_id      VARCHAR(80)    NULL,
  case_id         VARCHAR(80)    NULL,

  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_builds_user (user_id),
  CONSTRAINT fk_builds_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  PRODUCT IMAGES  (uploaded via admin panel)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE product_images (
  product_id      VARCHAR(80)    NOT NULL,
  filename        VARCHAR(255)   NOT NULL,
  mime_type       VARCHAR(60)    NULL,
  file_size_kb    INT            NULL,
  uploaded_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (product_id),
  CONSTRAINT fk_pimg_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  AUDIT LOG
-- ══════════════════════════════════════════════════════════════
CREATE TABLE audit_log (
  id              BIGINT         NOT NULL AUTO_INCREMENT,
  event_type      ENUM(
                    'status_change',
                    'order_placed',
                    'order_status_changed',
                    'product_added',
                    'product_edited',
                    'product_deleted',
                    'login',
                    'logout'
                  )              NOT NULL,
  actor_id        VARCHAR(40)    NULL COMMENT 'user_id who performed the action',
  actor_name      VARCHAR(100)   NULL,
  target_id       VARCHAR(80)    NULL COMMENT 'product_id or order_id',
  target_name     VARCHAR(200)   NULL,
  old_value       VARCHAR(100)   NULL COMMENT 'e.g. old stock status',
  new_value       VARCHAR(100)   NULL COMMENT 'e.g. new stock status',
  extra           JSON           NULL COMMENT 'Any additional context',
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_audit_type    (event_type),
  INDEX idx_audit_actor   (actor_id),
  INDEX idx_audit_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════
--  SEED PRODUCTS  (full catalog from catalog.js)
-- ══════════════════════════════════════════════════════════════

-- CPUs — Intel Arrow Lake (LGA1851)
INSERT INTO products (id, name, cat, price_usd, specs, socket, tdp, mem_type) VALUES
('cpu_ultra9_285k',  'Intel Core Ultra 9 285K',   'CPU', 589, '24C (8P+16E) / 5.7GHz / LGA1851 / 125W', 'LGA1851', 125, 'DDR5'),
('cpu_ultra7_265k',  'Intel Core Ultra 7 265K',   'CPU', 394, '20C (8P+12E) / 5.5GHz / LGA1851 / 125W', 'LGA1851', 125, 'DDR5'),
('cpu_ultra5_245k',  'Intel Core Ultra 5 245K',   'CPU', 309, '14C (6P+8E) / 5.2GHz / LGA1851 / 125W',  'LGA1851', 125, 'DDR5'),
('cpu_ultra5_245kf', 'Intel Core Ultra 5 245KF',  'CPU', 289, '14C / 5.2GHz / LGA1851 / No iGPU',       'LGA1851', 125, 'DDR5');

-- CPUs — Intel 14th Gen (LGA1700)
INSERT INTO products (id, name, cat, price_usd, specs, socket, tdp) VALUES
('cpu1',           'Intel Core i9-14900K',   'CPU', 439, '24C / 6.0GHz / LGA1700 / 253W', 'LGA1700', 253),
('cpu_i9_14900kf', 'Intel Core i9-14900KF',  'CPU', 399, '24C / 6.0GHz / LGA1700 / No iGPU', 'LGA1700', 253),
('cpu_i9_14900',   'Intel Core i9-14900',    'CPU', 349, '24C / 5.8GHz / LGA1700 / 65W', 'LGA1700', 65),
('cpu3',           'Intel Core i7-14700K',   'CPU', 349, '20C / 5.6GHz / LGA1700 / 253W', 'LGA1700', 253),
('cpu_i7_14700kf', 'Intel Core i7-14700KF',  'CPU', 319, '20C / 5.6GHz / LGA1700 / No iGPU', 'LGA1700', 253),
('cpu5',           'Intel Core i5-14600K',   'CPU', 229, '14C / 5.3GHz / LGA1700 / 181W', 'LGA1700', 181),
('cpu_i5_14600kf', 'Intel Core i5-14600KF',  'CPU', 209, '14C / 5.3GHz / LGA1700 / No iGPU', 'LGA1700', 181),
('cpu_i5_14500',   'Intel Core i5-14500',    'CPU', 189, '14C / 5.0GHz / LGA1700 / 65W', 'LGA1700', 65),
('cpu_i5_14400f',  'Intel Core i5-14400F',   'CPU', 149, '10C / 4.7GHz / LGA1700 / No iGPU', 'LGA1700', 65),
('cpu_i3_14100f',  'Intel Core i3-14100F',   'CPU', 99,  '4C / 4.7GHz / LGA1700 / No iGPU', 'LGA1700', 58),
('cpu6',           'Intel Core i5-12400F',   'CPU', 89,  '6C / 4.4GHz / LGA1700 / No iGPU', 'LGA1700', 65);

-- CPUs — AMD Ryzen 9000 (AM5)
INSERT INTO products (id, name, cat, price_usd, specs, socket, tdp, mem_type) VALUES
('cpu_r9_9950x', 'AMD Ryzen 9 9950X', 'CPU', 649, '16C / 5.7GHz / AM5 / 170W', 'AM5', 170, 'DDR5'),
('cpu_r9_9900x', 'AMD Ryzen 9 9900X', 'CPU', 449, '12C / 5.6GHz / AM5 / 120W', 'AM5', 120, 'DDR5'),
('cpu_r7_9700x', 'AMD Ryzen 7 9700X', 'CPU', 359, '8C / 5.5GHz / AM5 / 65W',  'AM5', 65,  'DDR5'),
('cpu_r5_9600x', 'AMD Ryzen 5 9600X', 'CPU', 249, '6C / 5.4GHz / AM5 / 65W',  'AM5', 65,  'DDR5');

-- CPUs — AMD Ryzen 7000 X3D (AM5)
INSERT INTO products (id, name, cat, price_usd, specs, socket, tdp, mem_type) VALUES
('cpu_r9_7950x3d', 'AMD Ryzen 9 7950X3D', 'CPU', 649, '16C / 5.7GHz / AM5 / 3D V-Cache / 120W', 'AM5', 120, 'DDR5'),
('cpu2',           'AMD Ryzen 9 7950X',   'CPU', 529, '16C / 5.7GHz / AM5 / 170W', 'AM5', 170, 'DDR5'),
('cpu8',           'AMD Ryzen 9 7900X',   'CPU', 319, '12C / 5.6GHz / AM5 / 170W', 'AM5', 170, 'DDR5'),
('cpu_r7_7800x3d', 'AMD Ryzen 7 7800X3D', 'CPU', 389, '8C / 5.0GHz / AM5 / 3D V-Cache / 120W', 'AM5', 120, 'DDR5'),
('cpu4',           'AMD Ryzen 7 7700X',   'CPU', 239, '8C / 5.4GHz / AM5 / 105W', 'AM5', 105, 'DDR5'),
('cpu_r7_7700',    'AMD Ryzen 7 7700',    'CPU', 199, '8C / 5.3GHz / AM5 / 65W', 'AM5', 65, 'DDR5'),
('cpu7',           'AMD Ryzen 5 7600X',   'CPU', 169, '6C / 5.3GHz / AM5 / 105W', 'AM5', 105, 'DDR5'),
('cpu_r5_7600',    'AMD Ryzen 5 7600',    'CPU', 139, '6C / 5.1GHz / AM5 / 65W', 'AM5', 65, 'DDR5');

-- CPUs — AMD Ryzen 5000 (AM4)
INSERT INTO products (id, name, cat, price_usd, specs, socket, tdp, mem_type) VALUES
('cpu_r9_5950x',  'AMD Ryzen 9 5950X',   'CPU', 269, '16C / 4.9GHz / AM4 / 105W', 'AM4', 105, 'DDR4'),
('cpu9',          'AMD Ryzen 9 5900X',   'CPU', 199, '12C / 4.8GHz / AM4 / 105W', 'AM4', 105, 'DDR4'),
('cpu10',         'AMD Ryzen 7 5800X3D', 'CPU', 229, '8C / 4.5GHz / AM4 / 3D V-Cache', 'AM4', 105, 'DDR4'),
('cpu12',         'AMD Ryzen 7 5700X',   'CPU', 139, '8C / 4.6GHz / AM4 / 65W', 'AM4', 65, 'DDR4'),
('cpu_r7_5700x3d','AMD Ryzen 7 5700X3D', 'CPU', 179, '8C / 4.1GHz / AM4 / 3D V-Cache', 'AM4', 105, 'DDR4'),
('cpu11',         'AMD Ryzen 5 5600X',   'CPU', 109, '6C / 4.6GHz / AM4 / 65W', 'AM4', 65, 'DDR4'),
('cpu_r5_5600',   'AMD Ryzen 5 5600',    'CPU', 89,  '6C / 4.4GHz / AM4 / 65W', 'AM4', 65, 'DDR4'),
('cpu_r5_5500',   'AMD Ryzen 5 5500',    'CPU', 69,  '6C / 4.2GHz / AM4 / 65W', 'AM4', 65, 'DDR4');

-- GPUs — NVIDIA RTX 50 Series
INSERT INTO products (id, name, cat, price_usd, specs, power_draw) VALUES
('gpu_5090',   'NVIDIA GeForce RTX 5090',    'GPU', 1999, '32GB GDDR7 / 21760 CUDA / 575W',  575),
('gpu_5080',   'NVIDIA GeForce RTX 5080',    'GPU', 999,  '16GB GDDR7 / 10752 CUDA / 360W',  360),
('gpu_5070ti', 'NVIDIA GeForce RTX 5070 Ti', 'GPU', 749,  '16GB GDDR7 / 8960 CUDA / 300W',   300),
('gpu_5070',   'NVIDIA GeForce RTX 5070',    'GPU', 549,  '12GB GDDR7 / 6144 CUDA / 250W',   250);

-- GPUs — NVIDIA RTX 40 Series
INSERT INTO products (id, name, cat, price_usd, specs, power_draw) VALUES
('gpu1',       'NVIDIA GeForce RTX 4090',        'GPU', 1599, '24GB GDDR6X / 16384 CUDA / 450W', 450),
('gpu_4080',   'NVIDIA GeForce RTX 4080 Super',  'GPU', 999,  '16GB GDDR6X / 10240 CUDA / 320W', 320),
('gpu_4070s',  'NVIDIA GeForce RTX 4070 Super',  'GPU', 599,  '12GB GDDR6X / 7168 CUDA / 220W',  220),
('gpu_4070',   'NVIDIA GeForce RTX 4070',        'GPU', 499,  '12GB GDDR6X / 5888 CUDA / 200W',  200),
('gpu_4060ti', 'NVIDIA GeForce RTX 4060 Ti',     'GPU', 399,  '16GB GDDR6 / 4352 CUDA / 160W',   160),
('gpu_4060',   'NVIDIA GeForce RTX 4060',        'GPU', 299,  '8GB GDDR6 / 3072 CUDA / 115W',    115);

-- GPUs — AMD RX 7000 Series
INSERT INTO products (id, name, cat, price_usd, specs, power_draw) VALUES
('gpu_rx7900xtx', 'AMD Radeon RX 7900 XTX', 'GPU', 999, '24GB GDDR6 / 96 CUs / 355W',  355),
('gpu_rx7900xt',  'AMD Radeon RX 7900 XT',  'GPU', 849, '20GB GDDR6 / 84 CUs / 300W',  300),
('gpu_rx7800xt',  'AMD Radeon RX 7800 XT',  'GPU', 499, '16GB GDDR6 / 60 CUs / 263W',  263),
('gpu_rx7700xt',  'AMD Radeon RX 7700 XT',  'GPU', 349, '12GB GDDR6 / 54 CUs / 245W',  245),
('gpu_rx7600',    'AMD Radeon RX 7600',      'GPU', 249, '8GB GDDR6 / 32 CUs / 165W',   165);

-- Motherboards — AM5
INSERT INTO products (id, name, cat, price_usd, specs, socket, mem_type) VALUES
('mb4',          'ASUS ROG Crosshair X670E Hero',  'Motherboard', 499, 'X670E / AM5 / DDR5 / ATX',  'AM5', 'DDR5'),
('mb11',         'MSI MEG X670E ACE',              'Motherboard', 549, 'X670E / AM5 / DDR5 / E-ATX','AM5', 'DDR5'),
('mb_x870e_hero','ASUS ROG Crosshair X870E Hero',  'Motherboard', 579, 'X870E / AM5 / DDR5 / ATX',  'AM5', 'DDR5'),
('mb_b650',      'MSI MAG B650 Tomahawk WiFi',     'Motherboard', 229, 'B650 / AM5 / DDR5 / ATX',   'AM5', 'DDR5');

-- Motherboards — AM4
INSERT INTO products (id, name, cat, price_usd, specs, socket, mem_type) VALUES
('mb8',  'ASUS ROG Strix B550-F Gaming', 'Motherboard', 189, 'B550 / AM4 / DDR4 / ATX', 'AM4', 'DDR4'),
('mb9',  'MSI MAG B550 Tomahawk',        'Motherboard', 149, 'B550 / AM4 / DDR4 / ATX', 'AM4', 'DDR4'),
('mb10', 'Gigabyte X570 AORUS Elite',    'Motherboard', 199, 'X570 / AM4 / DDR4 / ATX', 'AM4', 'DDR4');

-- Motherboards — LGA1700
INSERT INTO products (id, name, cat, price_usd, specs, socket, mem_type) VALUES
('mb3',      'ASUS ROG Maximus Z790 Hero',    'Motherboard', 599, 'Z790 / LGA1700 / DDR5 / ATX', 'LGA1700', 'DDR5'),
('mb5',      'MSI MEG Z790 ACE',              'Motherboard', 449, 'Z790 / LGA1700 / DDR5 / ATX', 'LGA1700', 'DDR5'),
('mb_z790_pro','MSI PRO Z790-P WiFi DDR4',   'Motherboard', 199, 'Z790 / LGA1700 / DDR4 / ATX', 'LGA1700', 'DDR4');

-- Motherboards — LGA1851
INSERT INTO products (id, name, cat, price_usd, specs, socket, mem_type) VALUES
('mb_z890_hero','ASUS ROG Maximus Z890 Hero', 'Motherboard', 649, 'Z890 / LGA1851 / DDR5 / ATX', 'LGA1851', 'DDR5'),
('mb_z890_pro', 'MSI MEG Z890 ACE',           'Motherboard', 499, 'Z890 / LGA1851 / DDR5 / E-ATX','LGA1851','DDR5');

-- RAM — DDR5
INSERT INTO products (id, name, cat, price_usd, specs, mem_type) VALUES
('ram1',          'G.Skill Trident Z5 RGB 64GB DDR5-6400',  'RAM', 199, '64GB (2×32) DDR5-6400 CL32', 'DDR5'),
('ram6',          'G.Skill Trident Z5 RGB 32GB DDR5-6000',  'RAM', 129, '32GB (2×16) DDR5-6000 CL30', 'DDR5'),
('ram_gz5_64_6400','G.Skill Trident Z5 RGB 64GB DDR5-6400', 'RAM', 229, '64GB (2×32) DDR5-6400 CL32', 'DDR5'),
('ram_corsair_32_ddr5','Corsair Dominator Titanium 32GB DDR5-6000','RAM',149,'32GB (2×16) DDR5-6000 CL30','DDR5');

-- RAM — DDR4
INSERT INTO products (id, name, cat, price_usd, specs, mem_type) VALUES
('ram4',  'Corsair Vengeance LPX 32GB DDR4-3600',  'RAM', 79,  '32GB (2×16) DDR4-3600 CL18', 'DDR4'),
('ram5',  'G.Skill Ripjaws V 32GB DDR4-3200',      'RAM', 65,  '32GB (2×16) DDR4-3200 CL16', 'DDR4'),
('ram7',  'Kingston Fury Beast 16GB DDR4-3200',     'RAM', 35,  '16GB (2×8) DDR4-3200 CL16',  'DDR4');

-- Storage
INSERT INTO products (id, name, cat, price_usd, specs) VALUES
('ssd1',           'Samsung 990 Pro 2TB NVMe',      'Storage', 179, 'PCIe 4.0 ×4 / 7450 MB/s read'),
('ssd_t705_2tb',   'Crucial T705 2TB NVMe',         'Storage', 189, 'PCIe 5.0 ×4 / 14500 MB/s read'),
('ssd_mx500_2tb',  'Crucial MX500 2TB SATA',        'Storage', 99,  'SATA III / 560 MB/s read'),
('ssd_990pro_4tb', 'Samsung 990 Pro 4TB NVMe',      'Storage', 299, 'PCIe 4.0 ×4 / 7450 MB/s read'),
('ssd_wd_sn850x',  'WD Black SN850X 2TB NVMe',      'Storage', 159, 'PCIe 4.0 ×4 / 7300 MB/s read'),
('ssd_mp600_2tb',  'Corsair MP600 Pro LPX 2TB',     'Storage', 169, 'PCIe 4.0 ×4 / 7100 MB/s read');

-- PSUs
INSERT INTO products (id, name, cat, price_usd, specs, wattage) VALUES
('psu1',         'Corsair HX1500i',                     'PSU', 349, '1500W / 80+ Platinum / Fully Modular', 1500),
('psu_be_1600',  'be quiet! Dark Power Pro 13 1600W',   'PSU', 399, '1600W / 80+ Titanium / Fully Modular', 1600),
('psu_rm1000x',  'Corsair RM1000x',                     'PSU', 179, '1000W / 80+ Gold / Fully Modular',     1000),
('psu_rm750x',   'Corsair RM750x',                      'PSU', 129, '750W / 80+ Gold / Fully Modular',      750),
('psu_rm650x',   'Corsair RM650x',                      'PSU', 109, '650W / 80+ Gold / Fully Modular',      650),
('psu_sf750',    'Corsair SF750 SFX',                   'PSU', 159, '750W / 80+ Platinum / Fully Modular',  750);

-- Cooling
INSERT INTO products (id, name, cat, price_usd, specs) VALUES
('cool1',          'NZXT Kraken Z73 360mm AIO',          'Cooling', 279, '360mm / 3×120mm fans / LCD display'),
('cool3',          'Corsair iCUE H150i Elite Capellix',  'Cooling', 199, '360mm AIO / 3×120mm fans / RGB'),
('cool_arctic_240','Arctic Liquid Freezer III 240',       'Cooling', 89,  '240mm AIO / 2×120mm fans'),
('cool_thermalright','Thermalright Peerless Assassin 120','Cooling', 39,  'Dual tower air / 2×120mm fans'),
('cool_rog_360',   'ASUS ROG Ryujin III 360',             'Cooling', 299, '360mm AIO / 3×120mm / Embedded pump fan'),
('cool_deepcool',  'DeepCool AK620',                      'Cooling', 65,  'Dual tower air / 2×120mm fans');

-- Cases
INSERT INTO products (id, name, cat, price_usd, specs) VALUES
('case1',            'Lian Li PC-O11 Dynamic EVO',      'Case', 169, 'Mid Tower / Dual Chamber / ATX / Tempered Glass'),
('case3',            'NZXT H7 Flow',                    'Case', 129, 'Mid Tower / High Airflow / ATX'),
('case_darkflash',   'Darkflash DLM22',                 'Case', 49,  'Mid Tower / Tempered Glass / Micro-ATX'),
('case_corsair_7000d','Corsair 7000D Airflow',          'Case', 249, 'Full Tower / High Airflow / E-ATX'),
('case_fractal',     'Fractal Design North',            'Case', 109, 'Mid Tower / Mesh + Wood front / ATX'),
('case_phanteks',    'Phanteks Eclipse P400A',          'Case', 89,  'Mid Tower / High Airflow / ATX');

-- Seed inventory rows (all start as 'normal')
INSERT INTO inventory (product_id, status)
SELECT id, 'normal' FROM products
ON DUPLICATE KEY UPDATE status = status;


-- ══════════════════════════════════════════════════════════════
--  USEFUL VIEWS
-- ══════════════════════════════════════════════════════════════

-- Full product listing with current stock status
CREATE OR REPLACE VIEW v_products AS
SELECT
  p.*,
  COALESCE(i.status, 'normal') AS stock_status,
  ROUND(p.price_usd * 57, 2)   AS price_php,
  pi.filename                   AS image_file
FROM products p
LEFT JOIN inventory      i  ON i.product_id  = p.id
LEFT JOIN product_images pi ON pi.product_id = p.id;

-- Order summary with item count
CREATE OR REPLACE VIEW v_orders AS
SELECT
  o.*,
  COUNT(oi.id)   AS item_count,
  u.username,
  u.email        AS user_email
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN users        u  ON u.id        = o.user_id
GROUP BY o.id;

-- Inventory dashboard stats
CREATE OR REPLACE VIEW v_inventory_stats AS
SELECT
  COUNT(*)                                        AS total_products,
  SUM(COALESCE(i.status,'normal') = 'normal')     AS in_stock,
  SUM(COALESCE(i.status,'normal') = 'sale')       AS on_sale,
  SUM(COALESCE(i.status,'normal') = 'lowstock')   AS low_stock,
  SUM(COALESCE(i.status,'normal') = 'outofstock') AS out_of_stock
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id;


-- ══════════════════════════════════════════════════════════════
--  COMMON QUERIES (reference)
-- ══════════════════════════════════════════════════════════════

/*
-- Get all products with stock status and PHP price:
SELECT * FROM v_products ORDER BY cat, name;

-- Get a user's cart with product details:
SELECT c.qty, p.name, p.cat, p.price_usd, ROUND(p.price_usd*57,2) AS price_php
FROM cart_items c
JOIN products p ON p.id = c.product_id
WHERE c.user_id = 'USER_ID';

-- Get cart total (PHP):
SELECT
  ROUND(SUM(p.price_usd * c.qty) * 57, 2) AS subtotal_php,
  ROUND(IF(SUM(p.price_usd * c.qty) > 500, 0, 30) * 57, 2) AS shipping_php,
  ROUND(SUM(p.price_usd * c.qty) * 0.12 * 57, 2) AS vat_php
FROM cart_items c
JOIN products p ON p.id = c.product_id
WHERE c.user_id = 'USER_ID';

-- Get all orders for admin panel:
SELECT * FROM v_orders ORDER BY created_at DESC;

-- Get order with line items:
SELECT o.*, oi.product_name, oi.qty, oi.unit_price_php
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = 'ORDER_ID';

-- Inventory dashboard:
SELECT * FROM v_inventory_stats;

-- Update stock status:
INSERT INTO inventory (product_id, status) VALUES ('gpu1', 'lowstock')
ON DUPLICATE KEY UPDATE status = 'lowstock';

-- Bulk mark out of stock:
INSERT INTO inventory (product_id, status)
SELECT id, 'outofstock' FROM products WHERE cat = 'GPU'
ON DUPLICATE KEY UPDATE status = 'outofstock';

-- Recent audit entries:
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;
*/


-- ══════════════════════════════════════════════════════════════
--  STOCK QUANTITY TRACKING (v2 — real-time inventory)
--
--  Added to the inventory table: stock_qty column tracks
--  the numeric count of units available.
--  The existing `status` ENUM remains for display labels.
--  Both are kept in sync by the application layer and the
--  stored procedure below.
-- ══════════════════════════════════════════════════════════════

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS stock_qty     SMALLINT UNSIGNED NOT NULL DEFAULT 10
    COMMENT 'Numeric units available (0 = out of stock)',
  ADD COLUMN IF NOT EXISTS low_threshold SMALLINT UNSIGNED NOT NULL DEFAULT 5
    COMMENT 'Qty at or below which status auto-becomes lowstock';

-- ── Indexes for fast lookups ──────────────────────────────────
ALTER TABLE inventory
  ADD INDEX IF NOT EXISTS idx_inv_qty    (stock_qty),
  ADD INDEX IF NOT EXISTS idx_inv_status (status);


-- ══════════════════════════════════════════════════════════════
--  STORED PROCEDURE: sp_deduct_stock
--
--  Atomically deducts qty from a product's stock_qty.
--  Automatically updates the status ENUM:
--    qty = 0          → 'outofstock'
--    0 < qty ≤ thresh → 'lowstock'
--    qty > thresh     → keep existing status (unless recovering)
--
--  Safe: GREATEST(0, ...) prevents negative stock.
--
--  Parameters:
--    p_product_id   — the product to deduct from
--    p_qty          — units purchased (must be > 0)
--    OUT p_ok       — 1 = success, 0 = insufficient stock
--    OUT p_remaining — stock_qty after deduction
--
--  Usage:
--    CALL sp_deduct_stock('gpu1', 2, @ok, @remaining);
--    SELECT @ok, @remaining;
-- ══════════════════════════════════════════════════════════════

DROP PROCEDURE IF EXISTS sp_deduct_stock;

DELIMITER $$
CREATE PROCEDURE sp_deduct_stock(
  IN  p_product_id  VARCHAR(80),
  IN  p_qty         SMALLINT UNSIGNED,
  OUT p_ok          TINYINT,
  OUT p_remaining   SMALLINT UNSIGNED
)
BEGIN
  DECLARE v_current  SMALLINT UNSIGNED DEFAULT 0;
  DECLARE v_threshold SMALLINT UNSIGNED DEFAULT 5;

  -- Read current stock inside a transaction for safety
  START TRANSACTION;

    SELECT stock_qty, low_threshold
      INTO v_current, v_threshold
      FROM inventory
     WHERE product_id = p_product_id
       FOR UPDATE;   -- row-level lock prevents concurrent over-deduction

    IF v_current < p_qty THEN
      -- Not enough stock — roll back and return failure
      ROLLBACK;
      SET p_ok        = 0;
      SET p_remaining = v_current;
    ELSE
      -- Safe to deduct
      UPDATE inventory
         SET stock_qty  = GREATEST(0, stock_qty - p_qty),
             status     = CASE
               WHEN (stock_qty - p_qty) <= 0           THEN 'outofstock'
               WHEN (stock_qty - p_qty) <= v_threshold THEN 'lowstock'
               ELSE status           -- keep sale/normal/lowstock as-is unless recovering
             END,
             updated_at = NOW()
       WHERE product_id = p_product_id;

      -- Read back the actual remaining qty
      SELECT stock_qty INTO p_remaining
        FROM inventory
       WHERE product_id = p_product_id;

      COMMIT;
      SET p_ok = 1;
    END IF;
END$$
DELIMITER ;


-- ══════════════════════════════════════════════════════════════
--  STORED PROCEDURE: sp_set_stock_qty
--
--  Admin panel: manually set stock_qty to an exact value.
--  Status is recalculated automatically.
-- ══════════════════════════════════════════════════════════════

DROP PROCEDURE IF EXISTS sp_set_stock_qty;

DELIMITER $$
CREATE PROCEDURE sp_set_stock_qty(
  IN p_product_id  VARCHAR(80),
  IN p_qty         SMALLINT UNSIGNED,
  IN p_actor_id    VARCHAR(40)   -- user_id of admin performing the update
)
BEGIN
  DECLARE v_threshold SMALLINT UNSIGNED DEFAULT 5;
  DECLARE v_old_qty   SMALLINT UNSIGNED DEFAULT 0;
  DECLARE v_new_status ENUM('normal','sale','lowstock','outofstock');

  SELECT stock_qty, low_threshold INTO v_old_qty, v_threshold
    FROM inventory
   WHERE product_id = p_product_id;

  SET v_new_status = CASE
    WHEN p_qty = 0           THEN 'outofstock'
    WHEN p_qty <= v_threshold THEN 'lowstock'
    ELSE 'normal'
  END;

  INSERT INTO inventory (product_id, stock_qty, status)
    VALUES (p_product_id, p_qty, v_new_status)
    ON DUPLICATE KEY UPDATE
      stock_qty  = p_qty,
      status     = v_new_status,
      updated_at = NOW();

  -- Audit trail
  INSERT INTO audit_log (event_type, actor_id, target_id, old_value, new_value)
    VALUES ('status_change', p_actor_id, p_product_id,
            CONCAT('qty:', v_old_qty),
            CONCAT('qty:', p_qty, ' status:', v_new_status));
END$$
DELIMITER ;


-- ══════════════════════════════════════════════════════════════
--  STORED PROCEDURE: sp_restore_stock
--
--  Called when an order is cancelled — adds qty back.
-- ══════════════════════════════════════════════════════════════

DROP PROCEDURE IF EXISTS sp_restore_stock;

DELIMITER $$
CREATE PROCEDURE sp_restore_stock(
  IN p_product_id  VARCHAR(80),
  IN p_qty         SMALLINT UNSIGNED
)
BEGIN
  DECLARE v_threshold SMALLINT UNSIGNED DEFAULT 5;

  SELECT low_threshold INTO v_threshold
    FROM inventory
   WHERE product_id = p_product_id;

  UPDATE inventory
     SET stock_qty  = LEAST(9999, stock_qty + p_qty),
         status     = CASE
           WHEN (stock_qty + p_qty) <= 0            THEN 'outofstock'
           WHEN (stock_qty + p_qty) <= v_threshold  THEN 'lowstock'
           ELSE 'normal'
         END,
         updated_at = NOW()
   WHERE product_id = p_product_id;
END$$
DELIMITER ;


-- ══════════════════════════════════════════════════════════════
--  UPDATED VIEW: v_products (includes stock_qty)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_products AS
SELECT
  p.*,
  COALESCE(i.status,    'normal') AS stock_status,
  COALESCE(i.stock_qty, 10)       AS stock_qty,
  ROUND(p.price_usd * 57, 2)      AS price_php,
  pi.filename                      AS image_file
FROM products p
LEFT JOIN inventory      i  ON i.product_id  = p.id
LEFT JOIN product_images pi ON pi.product_id = p.id;


-- ══════════════════════════════════════════════════════════════
--  COMMON QUERIES — Stock Management (reference)
-- ══════════════════════════════════════════════════════════════

/*
-- Deduct 2 units of gpu1 safely:
CALL sp_deduct_stock('gpu1', 2, @ok, @remaining);
SELECT @ok AS success, @remaining AS units_left;

-- Admin sets gpu1 to exactly 15 units:
CALL sp_set_stock_qty('gpu1', 15, 'admin1');

-- Restore 2 units after order cancellation:
CALL sp_restore_stock('gpu1', 2);

-- View all products with qty and status:
SELECT id, name, cat, stock_qty, status FROM v_products ORDER BY stock_qty ASC;

-- Find all products with 5 or fewer units:
SELECT id, name, stock_qty, status
  FROM inventory
 WHERE stock_qty <= 5
 ORDER BY stock_qty ASC;

-- Products that just went out of stock (last 24 hrs):
SELECT al.target_id, al.new_value, al.created_at
  FROM audit_log al
 WHERE al.event_type = 'status_change'
   AND al.new_value LIKE '%outofstock%'
   AND al.created_at > NOW() - INTERVAL 1 DAY
 ORDER BY al.created_at DESC;
*/

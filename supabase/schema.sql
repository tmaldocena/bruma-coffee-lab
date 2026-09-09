-- ============================================================
-- BRUMA COFFEE LAB — Esquema de base de datos (Supabase / Postgres)
-- Diseñado mono-cliente, pero con venue_id desde el día 1
-- para poder pasar a multi-tenant sin migraciones dolorosas.
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1) VENUES (locales / clientes del SaaS)
-- Hoy solo va a existir una fila (Bruma), pero todo lo demás
-- referencia venue_id para que sumar un segundo local sea
-- solo "insertar una fila", no rediseñar tablas.
-- ------------------------------------------------------------
create table venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                -- ej: 'bruma'
  name text not null,                       -- ej: 'Bruma Coffee Lab'
  logo_url text,
  instagram text,
  address text,
  currency_format text not null default 'es-AR', -- para toLocaleString en el front
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) VENUE_SETTINGS (config puntual, 1 a 1 con venue)
-- Separada de venues para no ensuciar la tabla principal
-- con datos operativos que cambian seguido (wifi, horario).
-- ------------------------------------------------------------
create table venue_settings (
  venue_id uuid primary key references venues(id) on delete cascade,
  wifi_ssid text,
  wifi_password text,
  opening_hours text,          -- texto libre por ahora ("Lun a Vie 8-20h")
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3) CATEGORIES (Desayunos, Entradas, Bebidas Calientes, etc.)
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  slug text not null,           -- para filtros/URLs: 'bebidas-calientes'
  icon text,                    -- emoji o nombre de ícono, ej: '☕'
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique (venue_id, slug)
);

-- ------------------------------------------------------------
-- 4) PRODUCTS (los ítems del menú)
-- ------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2),                          -- null = "a confirmar" (ver seed.sql)
  is_featured boolean not null default false,   -- ícono TOP / grano destacado
  is_available boolean not null default true,   -- "agotado hoy" sin borrar el ítem
  sort_order int not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_venue on products(venue_id);

-- ------------------------------------------------------------
-- 5) PROMO_BLOCKS (Happy Hour, Trilogía Bruma, Métodos, etc.)
-- No son productos comunes: tienen horario, precio fijo
-- combinado, o texto compuesto de varias variantes.
-- ------------------------------------------------------------
create table promo_blocks (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  type text not null check (type in ('happy_hour', 'combo', 'banner')),
  title text not null,
  description text,
  price numeric(12,2),               -- null si no aplica (ej: banner informativo)
  schedule jsonb,                    -- ej: {"days":["mon","tue","wed","thu","fri"],"from":"15:00","to":"18:00"}
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TRIGGERS: updated_at automático en products
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Regla general: lectura pública abierta (el menú lo ve
-- cualquiera sin login), escritura solo para usuarios
-- autenticados (el dueño / staff con cuenta en Supabase Auth).
-- ============================================================

alter table venues enable row level security;
alter table venue_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table promo_blocks enable row level security;

-- Lectura pública
create policy "public_read_venues" on venues for select using (true);
create policy "public_read_venue_settings" on venue_settings for select using (true);
create policy "public_read_categories" on categories for select using (is_visible = true);
create policy "public_read_products" on products for select using (true);
create policy "public_read_promo_blocks" on promo_blocks for select using (is_active = true);

-- Escritura solo autenticado (cualquier usuario logueado admin por ahora;
-- cuando haya multi-tenant real, esto se refina con una tabla venue_members)
create policy "auth_write_venues" on venues for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_venue_settings" on venue_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth_write_promo_blocks" on promo_blocks for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Nota: "public_read_categories"/"products" arriba hacen SELECT abierto,
-- pero por defecto Postgres evalúa TODAS las policies de select con OR,
-- así que un usuario autenticado también puede leer sin problema.

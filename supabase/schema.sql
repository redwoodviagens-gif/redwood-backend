create table if not exists flight_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  phone text,
  email text,
  origin text not null,
  destination text not null,
  departure_date date,
  return_date date,
  adults int default 1,
  price numeric,
  probability int,
  trend text,
  provider text,
  campaign text,
  source text,
  raw jsonb
);

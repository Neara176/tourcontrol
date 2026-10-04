create table if not exists public.tours (
  owner_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  price_high numeric(12, 2) not null default 0 check (price_high >= 0),
  color text not null,
  primary key (owner_id, id)
);

create table if not exists public.bookings (
  owner_id uuid not null references auth.users (id) on delete cascade,
  id bigint not null,
  tour_id text not null,
  tour_name text not null,
  color text not null,
  datetime text not null,
  guest text not null,
  phone text not null default '',
  pax integer not null check (pax > 0),
  revenue numeric(12, 2) not null check (revenue >= 0),
  paid boolean not null default false,
  expense numeric(12, 2) check (expense is null or expense >= 0),
  notes text not null default '',
  cancelled boolean not null default false,
  primary key (owner_id, id)
);

create table if not exists public.app_settings (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  season integer[] not null default array[11, 12, 1, 2, 3],
  migration_complete boolean not null default false,
  constraint valid_season_months check (
    season <@ array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  )
);

alter table public.tours enable row level security;
alter table public.bookings enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "Owners manage their tours" on public.tours;
create policy "Owners manage their tours" on public.tours
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners manage their bookings" on public.bookings;
create policy "Owners manage their bookings" on public.bookings
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners manage their settings" on public.app_settings;
create policy "Owners manage their settings" on public.app_settings
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

grant select, insert, update, delete on public.tours to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
grant select, insert, update, delete on public.app_settings to authenticated;

create or replace function public.replace_tours(p_rows jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null or p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'A signed-in owner and a JSON array are required';
  end if;

  delete from public.tours where owner_id = auth.uid();
  insert into public.tours (owner_id, id, name, price, price_high, color)
  select auth.uid(), item.id, item.name, item.price, item.price_high, item.color
  from jsonb_to_recordset(p_rows) as item(
    id text,
    name text,
    price numeric,
    price_high numeric,
    color text
  );
end;
$$;

create or replace function public.replace_bookings(p_rows jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null or p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'A signed-in owner and a JSON array are required';
  end if;

  delete from public.bookings where owner_id = auth.uid();
  insert into public.bookings (
    owner_id, id, tour_id, tour_name, color, datetime, guest, phone,
    pax, revenue, paid, expense, notes, cancelled
  )
  select
    auth.uid(), item.id, item.tour_id, item.tour_name, item.color, item.datetime,
    item.guest, coalesce(item.phone, ''), item.pax, item.revenue,
    coalesce(item.paid, false), item.expense, coalesce(item.notes, ''),
    coalesce(item.cancelled, false)
  from jsonb_to_recordset(p_rows) as item(
    id bigint,
    tour_id text,
    tour_name text,
    color text,
    datetime text,
    guest text,
    phone text,
    pax integer,
    revenue numeric,
    paid boolean,
    expense numeric,
    notes text,
    cancelled boolean
  );
end;
$$;

revoke all on function public.replace_tours(jsonb) from public, anon;
revoke all on function public.replace_bookings(jsonb) from public, anon;
grant execute on function public.replace_tours(jsonb) to authenticated;
grant execute on function public.replace_bookings(jsonb) to authenticated;

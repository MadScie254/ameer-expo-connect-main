alter table public.registrations
  add column if not exists reference_code text unique;

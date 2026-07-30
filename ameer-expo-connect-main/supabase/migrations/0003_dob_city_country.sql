alter table public.registrations
  add column if not exists reference_code text unique,
  add column if not exists date_of_birth date,
  add column if not exists city text,
  add column if not exists country text;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'registrations'
      and column_name = 'reference_code'
  ) then
    alter table "public"."registrations" add column "reference_code" text unique;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'registrations'
      and column_name = 'date_of_birth'
  ) then
    alter table "public"."registrations" add column "date_of_birth" date;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'registrations'
      and column_name = 'city'
  ) then
    alter table "public"."registrations" add column "city" text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'registrations'
      and column_name = 'country'
  ) then
    alter table "public"."registrations" add column "country" text;
  end if;
end $$;

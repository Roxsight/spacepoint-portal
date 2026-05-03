alter table public.instructor_gates enable row level security;
alter table public.profiles enable row level security;

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

drop policy if exists "Admin can view all gates" on public.instructor_gates;
create policy "Admin can view all gates" on public.instructor_gates
for select using (
  public.current_user_is_admin()
);

drop policy if exists "Admin can update all gates" on public.instructor_gates;
create policy "Admin can update all gates" on public.instructor_gates
for update using (
  public.current_user_is_admin()
);

drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles" on public.profiles
for select using (
  auth.uid() = id
  or public.current_user_is_admin()
);

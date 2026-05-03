alter table public.instructor_gates enable row level security;

create unique index if not exists instructor_gates_user_gate_number_key
  on public.instructor_gates (user_id, gate_number);

create or replace function public.create_instructor_gates_after_onboarding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'instructor'
    and new.onboarding_complete = true
    and (
      old.role is distinct from new.role
      or old.onboarding_complete is distinct from new.onboarding_complete
    )
  then
    insert into public.instructor_gates (user_id, gate_number, status)
    values
      (new.id, 1, 'active'),
      (new.id, 2, 'locked'),
      (new.id, 3, 'locked'),
      (new.id, 4, 'locked'),
      (new.id, 5, 'locked')
    on conflict (user_id, gate_number) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists create_instructor_gates_after_onboarding on public.profiles;

create trigger create_instructor_gates_after_onboarding
after update on public.profiles
for each row
when (new.role = 'instructor' and new.onboarding_complete = true)
execute function public.create_instructor_gates_after_onboarding();

create or replace function public.unlock_next_gate(user_id uuid, gate_number int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.instructor_gates
  set status = 'passed'
  where instructor_gates.user_id = unlock_next_gate.user_id
    and instructor_gates.gate_number = unlock_next_gate.gate_number;

  if gate_number < 5 then
    update public.instructor_gates
    set status = 'active'
    where instructor_gates.user_id = unlock_next_gate.user_id
      and instructor_gates.gate_number = unlock_next_gate.gate_number + 1
      and instructor_gates.status = 'locked';
  end if;
end;
$$;

drop policy if exists "Admin full access to gates" on public.instructor_gates;

create policy "Admin full access to gates" on public.instructor_gates
for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

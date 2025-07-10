-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
create extension if not exists "uuid-ossp";

-- Tabela de funções/papéis
create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  permissions text[] not null default '{}',
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

-- Trigger para atualizar o updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language 'plpgsql';

create trigger update_roles_updated_at
  before update on roles
  for each row
  execute function update_updated_at_column();

-- Tabela de usuários
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) not null unique,
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  role_id uuid references roles(id),
  is_active boolean not null default true,
  language varchar(10) not null default 'pt',
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();

-- Inserir funções padrão
insert into roles (name, permissions) values
  ('admin', array['manage_users', 'manage_roles', 'manage_holidays', 'manage_settings', 'manage_vacations']),
  ('manager', array['manage_vacations', 'view_reports', 'manage_team']),
  ('supervisor', array['manage_vacations', 'view_reports']),
  ('employee', array['view_profile', 'manage_own_vacations']),
  ('user', array['view_profile', 'manage_own_vacations'])
on conflict (name) do nothing;

-- Criar políticas de segurança
alter table roles enable row level security;
alter table users enable row level security;

-- Políticas para roles
create policy "Admins can manage roles"
  on roles
  for all
  to authenticated
  using (exists (
    select 1 from users u
    where u.id = auth.uid()
    and exists (
      select 1 from roles r
      where r.id = u.role_id
      and 'manage_roles' = any(r.permissions)
    )
  ));

create policy "Everyone can view roles"
  on roles
  for select
  to authenticated
  using (true);

-- Políticas para users
create policy "Admins can manage users"
  on users
  for all
  to authenticated
  using (exists (
    select 1 from users u
    where u.id = auth.uid()
    and exists (
      select 1 from roles r
      where r.id = u.role_id
      and 'manage_users' = any(r.permissions)
    )
  ));

create policy "Users can view their own profile"
  on users
  for select
  to authenticated
  using (id = auth.uid());

-- Funções auxiliares
create or replace function get_user_permissions(user_id uuid)
returns text[] as $$
begin
  return (
    select r.permissions
    from users u
    join roles r on r.id = u.role_id
    where u.id = user_id
  );
end;
$$ language plpgsql security definer; 
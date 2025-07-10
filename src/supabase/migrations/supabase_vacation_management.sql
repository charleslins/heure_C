-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
create extension if not exists "uuid-ossp";

-- Tabela de solicitações de férias
create table if not exists vacation_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  status varchar(20) check (status in ('pending', 'approved', 'rejected')) default 'pending',
  comment text,
  admin_comment text,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

-- Trigger para atualizar o updated_at
create trigger update_vacation_requests_updated_at
  before update on vacation_requests
  for each row
  execute function update_updated_at_column();

-- View para solicitações pendentes com informações do usuário
create or replace view pending_vacation_requests as
select 
  vr.id,
  vr.user_id,
  p.name as user_name,
  vr.date,
  vr.comment,
  vr.created_at
from vacation_requests vr
join profiles p on p.id = vr.user_id
where vr.status = 'pending'
order by vr.date;

-- Políticas de segurança
alter table vacation_requests enable row level security;

-- Usuários podem ver suas próprias solicitações
create policy "Users can view their own vacation requests"
  on vacation_requests
  for select
  to authenticated
  using (user_id = auth.uid());

-- Usuários podem criar novas solicitações
create policy "Users can create vacation requests"
  on vacation_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Usuários podem atualizar suas solicitações pendentes
create policy "Users can update their pending vacation requests"
  on vacation_requests
  for update
  to authenticated
  using (user_id = auth.uid() and status = 'pending');

-- Admins podem ver todas as solicitações
create policy "Admins can view all vacation requests"
  on vacation_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Admins podem atualizar qualquer solicitação
create policy "Admins can update any vacation request"
  on vacation_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Função para notificar usuário quando solicitação é atualizada
create or replace function notify_vacation_request_update()
returns trigger as $$
begin
  -- Aqui você pode adicionar lógica para enviar notificações
  -- Por exemplo, inserir em uma tabela de notificações
  return new;
end;
$$ language plpgsql;

-- Trigger para notificações
create trigger vacation_request_status_changed
  after update of status on vacation_requests
  for each row
  when (old.status is distinct from new.status)
  execute function notify_vacation_request_update(); 
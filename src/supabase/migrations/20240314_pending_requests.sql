-- Migration: Criar estrutura de solicitações pendentes
-- Description: Adiciona tabela e view para gerenciar solicitações pendentes
-- Version: 1.0.0

begin;

-- Criar tabela de solicitações
create table if not exists pending_requests (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    request_type varchar(50) not null check (request_type in ('vacation', 'sick_leave', 'other')),
    start_date date not null,
    end_date date not null,
    status varchar(20) not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    comment text,
    admin_comment text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Trigger para atualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger pending_requests_updated_at
    before update on pending_requests
    for each row
    execute function update_updated_at();

-- View para solicitações pendentes com informações do usuário
create or replace view pending_requests_view as
select 
    pr.id,
    pr.user_id,
    p.name as user_name,
    pr.request_type,
    pr.start_date,
    pr.end_date,
    pr.status,
    pr.comment,
    pr.admin_comment,
    pr.created_at,
    pr.updated_at
from pending_requests pr
join profiles p on p.id = pr.user_id
where pr.status = 'pending'
order by pr.created_at desc;

-- Políticas de segurança (RLS)
alter table pending_requests enable row level security;

-- Usuários podem ver suas próprias solicitações
create policy "Users can view their own requests"
    on pending_requests for select
    to authenticated
    using (user_id = auth.uid());

-- Usuários podem criar suas próprias solicitações
create policy "Users can create their own requests"
    on pending_requests for insert
    to authenticated
    with check (user_id = auth.uid());

-- Usuários podem atualizar suas próprias solicitações pendentes
create policy "Users can update their own pending requests"
    on pending_requests for update
    to authenticated
    using (user_id = auth.uid() and status = 'pending');

-- Admins podem ver todas as solicitações
create policy "Admins can view all requests"
    on pending_requests for select
    to authenticated
    using (
        exists (
            select 1 from profiles
            where id = auth.uid()
            and role = 'admin'
        )
    );

-- Admins podem atualizar qualquer solicitação
create policy "Admins can update any request"
    on pending_requests for update
    to authenticated
    using (
        exists (
            select 1 from profiles
            where id = auth.uid()
            and role = 'admin'
        )
    );

commit; 
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

-- Função para calcular dias úteis entre duas datas
create or replace function business_days_between(start_date date, end_date date)
returns integer as $$
declare
    days integer := 0;
    current_date date := start_date;
begin
    while current_date <= end_date loop
        -- Se não for sábado (6) ou domingo (0)
        if extract(dow from current_date) not in (0, 6) then
            days := days + 1;
        end if;
        current_date := current_date + 1;
    end loop;
    return days;
end;
$$ language plpgsql;

-- Função para validar solicitação
create or replace function validate_request()
returns trigger as $$
begin
    -- Verificar se a data inicial é menor que a data final
    if new.start_date > new.end_date then
        raise exception 'Data inicial não pode ser maior que a data final';
    end if;

    -- Verificar se não existe sobreposição de datas para o mesmo usuário
    if exists (
        select 1 from pending_requests
        where user_id = new.user_id
        and id != new.id -- ignorar o próprio registro em caso de update
        and status = 'pending'
        and (
            (new.start_date between start_date and end_date) or
            (new.end_date between start_date and end_date) or
            (start_date between new.start_date and new.end_date) or
            (end_date between new.start_date and new.end_date)
        )
    ) then
        raise exception 'Existe sobreposição com outra solicitação pendente';
    end if;

    return new;
end;
$$ language plpgsql;

-- Trigger para validação antes de inserir/atualizar
create trigger validate_request_trigger
    before insert or update on pending_requests
    for each row
    execute function validate_request();

-- Função para notificar sobre mudanças de status
create or replace function notify_request_status_change()
returns trigger as $$
begin
    if new.status != old.status then
        -- TODO: Implementar notificações
        -- 1. Enviar email
        -- 2. Criar notificação no sistema
        -- 3. Registrar log de mudança
    end if;
    return new;
end;
$$ language plpgsql;

-- Trigger para notificações de mudança de status
create trigger notify_request_status_change_trigger
    after update of status on pending_requests
    for each row
    execute function notify_request_status_change(); 
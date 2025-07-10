-- Tabela de Cantões Suíços
CREATE TABLE cantons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(2) NOT NULL UNIQUE, -- ZH, VD, TI, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Municípios Suíços
CREATE TABLE municipalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    canton_id INTEGER REFERENCES cantons(id) ON DELETE CASCADE,
    postal_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, canton_id)
);

-- Estender a tabela profiles existente para incluir informações regionais
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS canton_id INTEGER REFERENCES cantons(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS municipality_id INTEGER REFERENCES municipalities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_schedule JSONB; -- Horário de trabalho

-- Tabela de Feriados Regionais
CREATE TABLE regional_holidays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    holiday_type VARCHAR(20) CHECK (holiday_type IN ('national', 'cantonal', 'municipal')),
    canton_id INTEGER REFERENCES cantons(id),
    municipality_id INTEGER REFERENCES municipalities(id),
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_regional_scope CHECK (
        (holiday_type = 'national' AND canton_id IS NULL AND municipality_id IS NULL) OR
        (holiday_type = 'cantonal' AND canton_id IS NOT NULL AND municipality_id IS NULL) OR
        (holiday_type = 'municipal' AND canton_id IS NOT NULL AND municipality_id IS NOT NULL)
    )
);

-- Inserir dados iniciais dos cantões suíços
INSERT INTO cantons (name, code) VALUES
('Zürich', 'ZH'),
('Bern', 'BE'),
('Vaud', 'VD'),
('Aargau', 'AG'),
('Sankt Gallen', 'SG'),
('Genève', 'GE'),
('Luzern', 'LU'),
('Ticino', 'TI'),
('Valais', 'VS'),
('Fribourg', 'FR'),
('Basel-Stadt', 'BS'),
('Basel-Landschaft', 'BL'),
('Solothurn', 'SO'),
('Thurgau', 'TG'),
('Graubünden', 'GR'),
('Neuchâtel', 'NE'),
('Schwyz', 'SZ'),
('Zug', 'ZG'),
('Schaffhausen', 'SH'),
('Jura', 'JU'),
('Appenzell Ausserrhoden', 'AR'),
('Appenzell Innerrhoden', 'AI'),
('Obwalden', 'OW'),
('Nidwalden', 'NW'),
('Glarus', 'GL'),
('Uri', 'UR')
ON CONFLICT (code) DO NOTHING;

-- Inserir alguns municípios principais como exemplo
INSERT INTO municipalities (name, canton_id, postal_code) VALUES
-- Zürich
('Zürich', (SELECT id FROM cantons WHERE code = 'ZH'), '8001'),
('Winterthur', (SELECT id FROM cantons WHERE code = 'ZH'), '8400'),
('Uster', (SELECT id FROM cantons WHERE code = 'ZH'), '8610'),
-- Bern
('Bern', (SELECT id FROM cantons WHERE code = 'BE'), '3000'),
('Thun', (SELECT id FROM cantons WHERE code = 'BE'), '3600'),
-- Vaud
('Lausanne', (SELECT id FROM cantons WHERE code = 'VD'), '1000'),
('Montreux', (SELECT id FROM cantons WHERE code = 'VD'), '1820'),
-- Genève
('Genève', (SELECT id FROM cantons WHERE code = 'GE'), '1200'),
-- Ticino
('Lugano', (SELECT id FROM cantons WHERE code = 'TI'), '6900'),
('Bellinzona', (SELECT id FROM cantons WHERE code = 'TI'), '6500')
ON CONFLICT (name, canton_id) DO NOTHING;

-- Inserir alguns feriados nacionais suíços
INSERT INTO regional_holidays (name, date, holiday_type) VALUES
('Neujahr', '2024-01-01', 'national'),
('Berchtoldstag', '2024-01-02', 'national'),
('Tag der Arbeit', '2024-05-01', 'national'),
('Nationalfeiertag', '2024-08-01', 'national'),
('Weihnachten', '2024-12-25', 'national'),
('Stephanstag', '2024-12-26', 'national')
ON CONFLICT DO NOTHING;

-- Inserir alguns feriados cantonais como exemplo
INSERT INTO regional_holidays (name, date, holiday_type, canton_id) VALUES
('Sechseläuten', '2024-04-15', 'cantonal', (SELECT id FROM cantons WHERE code = 'ZH')),
('Jeûne genevois', '2024-09-12', 'cantonal', (SELECT id FROM cantons WHERE code = 'GE')),
('Berchtoldstag', '2024-01-02', 'cantonal', (SELECT id FROM cantons WHERE code = 'BE'))
ON CONFLICT DO NOTHING;

-- Políticas de segurança (RLS - Row Level Security)
ALTER TABLE cantons ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_holidays ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Allow read access to cantons" ON cantons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to municipalities" ON municipalities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to regional_holidays" ON regional_holidays FOR SELECT TO authenticated USING (true);

-- Permitir escrita apenas para administradores
CREATE POLICY "Allow admin write access to cantons" ON cantons FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Allow admin write access to municipalities" ON municipalities FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Allow admin write access to regional_holidays" ON regional_holidays FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Função para criar usuário automaticamente após registro
CREATE OR REPLACE FUNCTION handle_new_employee()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, role, canton_id, municipality_id, employee_id, hire_date, position)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE((NEW.raw_user_meta_data->>'canton_id')::INTEGER, NULL),
        COALESCE((NEW.raw_user_meta_data->>'municipality_id')::INTEGER, NULL),
        NEW.raw_user_meta_data->>'employee_id',
        COALESCE((NEW.raw_user_meta_data->>'hire_date')::DATE, CURRENT_DATE),
        NEW.raw_user_meta_data->>'position'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_employee(); 
-- Primeiro, remover as referências nas profiles
UPDATE profiles 
SET municipality_id = NULL, 
    canton_id = NULL;

-- Agora podemos limpar os dados existentes
DELETE FROM municipalities;
DELETE FROM cantons;

-- Inserir cantões
INSERT INTO cantons (name, code) VALUES
  ('Genève', 'GE'),
  ('Vaud', 'VD'),
  ('Neuchâtel', 'NE'),
  ('Valais', 'VS'),
  ('Zurich', 'ZH'),
  ('Berne', 'BE');

-- Inserir municípios
INSERT INTO municipalities (name, canton_id, postal_code) VALUES
  -- Genève
  ('Genève', (SELECT id FROM cantons WHERE code = 'GE'), '1200'),
  
  -- Vaud
  ('Lausanne', (SELECT id FROM cantons WHERE code = 'VD'), '1000'),
  ('Renens', (SELECT id FROM cantons WHERE code = 'VD'), '1020'),
  ('Morges', (SELECT id FROM cantons WHERE code = 'VD'), '1110'),
  
  -- Neuchâtel
  ('Neuchâtel', (SELECT id FROM cantons WHERE code = 'NE'), '2000'),
  
  -- Valais
  ('Sion', (SELECT id FROM cantons WHERE code = 'VS'), '1950'),
  
  -- Zurich
  ('Zürich', (SELECT id FROM cantons WHERE code = 'ZH'), '8000'),
  
  -- Berne
  ('Bern', (SELECT id FROM cantons WHERE code = 'BE'), '3000');

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_municipalities_canton_id ON municipalities(canton_id);
CREATE INDEX IF NOT EXISTS idx_cantons_code ON cantons(code);

-- Opcional: Atualizar os profiles existentes para um município padrão
-- Descomente e ajuste conforme necessário:
-- UPDATE profiles 
-- SET municipality_id = (SELECT id FROM municipalities WHERE name = 'Genève'),
--     canton_id = (SELECT id FROM cantons WHERE code = 'GE')
-- WHERE municipality_id IS NULL; 
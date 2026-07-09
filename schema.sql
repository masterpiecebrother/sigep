-- ============================================================
-- SGEP — Schema do banco de dados (Neon / PostgreSQL)
-- ============================================================
-- Como usar:
--   1. No painel da Vercel, provisione o Neon (Storage > Marketplace).
--   2. Abra o console SQL do Neon (aba "Query" no dashboard da Vercel
--      ou no console do Neon) e cole este arquivo inteiro.
--   3. Execute. As tabelas serão criadas e populadas com os dados iniciais.
-- ============================================================

-- ----- Extensão para UUID (usada na tabela de usuários / auth futuro) -----
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: servidores (equipe do DIGEP)
-- ============================================================
-- Mantém o id inteiro pequeno usado hoje pelo app (1..N).
-- A coluna auth_user_id fica reservada para o login futuro:
-- quando a autenticação for implementada, cada servidor será
-- vinculado a um registro em app_users (abaixo).
CREATE TABLE IF NOT EXISTS servidores (
  id             INTEGER PRIMARY KEY,
  name           TEXT    NOT NULL,
  email          TEXT,
  role           TEXT    NOT NULL DEFAULT 'user',   -- 'admin' | 'user'
  modality       TEXT    DEFAULT 'Presencial',
  hours_per_month INTEGER DEFAULT 160,
  hours_per_year  INTEGER DEFAULT 1920,
  monitoramentos  INTEGER DEFAULT 0,
  auth_user_id    UUID,                             -- reservado p/ login futuro
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: entregas (tasks do Plano Mensal / Anual)
-- ============================================================
CREATE TABLE IF NOT EXISTS entregas (
  id             INTEGER PRIMARY KEY,
  title          TEXT,                              -- processo
  etapas         TEXT,                              -- entrega
  descricao      TEXT DEFAULT '',
  assigned_to    INTEGER REFERENCES servidores(id) ON DELETE SET NULL,
  has_collaborator BOOLEAN DEFAULT false,
  status         TEXT DEFAULT 'Pendente',
  data_criacao   DATE,
  data_fim       DATE,
  data_conclusao TIMESTAMPTZ,
  is_running     BOOLEAN DEFAULT false,
  actual_seconds INTEGER DEFAULT 0,
  peso2          INTEGER DEFAULT 30,
  peso_processo  INTEGER DEFAULT 30,
  complexidade   INTEGER DEFAULT 1,
  pct_realizado  INTEGER DEFAULT 0,
  subentregas    JSONB DEFAULT '[]'::jsonb,
  observacoes    TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entregas_assigned ON entregas(assigned_to);
CREATE INDEX IF NOT EXISTS idx_entregas_status   ON entregas(status);

-- ============================================================
-- TABELA: configuracao (linha única de parâmetros globais)
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracao (
  id             INTEGER PRIMARY KEY DEFAULT 1,
  alpha_parameter   REAL DEFAULT 0.5,
  factor_presencial REAL DEFAULT 1.0,
  factor_parcial    REAL DEFAULT 1.2,
  factor_integral   REAL DEFAULT 1.3,
  entregas_macro    JSONB DEFAULT '[]'::jsonb,
  logo_url          TEXT DEFAULT '',
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT config_single_row CHECK (id = 1)
);

-- ============================================================
-- TABELA: app_users — RESERVADA PARA LOGIN FUTURO
-- ============================================================
-- Ainda NÃO é usada pelo sistema. Fica criada para que, quando
-- você adicionar autenticação (ex.: Neon Auth, ou e-mail/senha),
-- os logins tenham onde morar sem precisar migrar o schema.
-- O vínculo com a equipe é feito por servidores.auth_user_id.
CREATE TABLE IF NOT EXISTS app_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,                    -- se optar por e-mail/senha próprio
  display_name  TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- ============================================================
-- DADOS INICIAIS — servidores
-- ============================================================
INSERT INTO servidores (id, name, role, modality, hours_per_month, hours_per_year, monitoramentos) VALUES
  (1, 'Antônio',                 'admin', 'Presencial', 160, 1920, 0),
  (2, 'Luiz Felipe D''Almeida',  'user',  'Presencial', 160, 1920, 0),
  (3, 'Thais Carvalho',          'user',  'Presencial', 160, 1920, 0),
  (4, 'Diego Hervé',             'user',  'Presencial', 160, 1920, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DADOS INICIAIS — configuração (linha única)
-- ============================================================
INSERT INTO configuracao (id, alpha_parameter, factor_presencial, factor_parcial, factor_integral, entregas_macro, logo_url)
VALUES (1, 0.5, 1.0, 1.2, 1.3, '[]'::jsonb, '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DADOS INICIAIS — entregas (20 entregas do plano 2026)
-- ============================================================
INSERT INTO entregas (id, title, etapas, assigned_to, has_collaborator, status, data_criacao, data_fim, peso2, peso_processo, complexidade) VALUES
  (101,'Gerenciamento de projetos estratégicos','Proposta de diretrizes para ocupação e capacitação de Chefe de Projeto II',2,false,'Pendente','2026-02-02','2026-04-30',30,60,2),
  (102,'Gerenciamento de projetos estratégicos','Guia de Gerenciamento de Projetos do INPI elaborado',3,true,'Pendente','2026-04-01','2026-06-30',60,60,3),
  (103,'Gerenciamento de projetos estratégicos','Treinamento na metodologia de gerenciamento de projetos realizado',1,true,'Pendente','2026-07-01','2026-08-31',30,60,2),
  (201,'Monitoramento e Avaliação (M&A) da Estratégia','Metas, entregas e medidas institucionais no PPA avaliadas',4,false,'Pendente','2026-01-02','2026-02-27',30,60,2),
  (202,'Monitoramento e Avaliação (M&A) da Estratégia','Relatório de Execução Anual (REA) elaborado',2,false,'Pendente','2026-01-02','2026-03-31',30,60,2),
  (203,'Monitoramento e Avaliação (M&A) da Estratégia','Nova versão desktop da Central de Monitoramento implantada',2,false,'Pendente','2026-01-02','2026-05-29',30,60,3),
  (204,'Monitoramento e Avaliação (M&A) da Estratégia','Versão mobile (celular) da Central de Monitoramento desenvolvida',3,false,'Pendente','2026-04-01','2026-06-30',30,60,2),
  (205,'Monitoramento e Avaliação (M&A) da Estratégia','Implementação de solução de aprimoramento da Central de Monitoramento',3,true,'Pendente','2026-02-02','2026-09-30',60,60,3),
  (206,'Monitoramento e Avaliação (M&A) da Estratégia','Central de Monitoramento do Plano de Ação publicada',2,false,'Pendente','2026-01-02','2026-12-15',30,60,1),
  (207,'Monitoramento e Avaliação (M&A) da Estratégia','Relatório de Monitoramento e Avaliação (M&A) do Plano de Ação elaborado',4,false,'Pendente','2026-01-02','2026-12-20',30,60,2),
  (208,'Monitoramento e Avaliação (M&A) da Estratégia','Metas e entregas no Plano de Ação da ENPI monitoradas',3,false,'Pendente','2026-01-02','2026-12-31',30,60,1),
  (209,'Monitoramento e Avaliação (M&A) da Estratégia','Metas e entregas no PPA monitoradas',4,false,'Pendente','2026-01-02','2026-12-31',30,60,1),
  (301,'Planejamento da Estratégia','Plano de Ação 2026 elaborado',1,false,'Pendente','2026-01-02','2026-02-27',60,60,3),
  (302,'Planejamento da Estratégia','Plano Estratégico elaborado',1,true,'Pendente','2026-01-05','2026-06-30',60,60,3),
  (303,'Planejamento da Estratégia','Plano de Negócios elaborado',4,false,'Pendente','2026-07-01','2026-09-30',30,60,2),
  (304,'Planejamento da Estratégia','Plano de Ação 2027 elaborado',2,false,'Pendente','2026-07-01','2026-12-31',60,60,3),
  (401,'Prestação de Contas','Relatório de Gestão da Prestação de Contas 2026 elaborado',4,false,'Pendente','2026-08-03','2026-12-31',30,30,2),
  (501,'Revisão da Estratégia','Metas, entregas e medidas institucionais no PPA revisadas',3,false,'Pendente','2026-01-02','2026-03-31',30,30,1),
  (502,'Revisão da Estratégia','Metas e entregas no Plano de Ação da ENPI revisadas',2,false,'Pendente','2026-08-03','2026-09-30',30,30,1),
  (503,'Revisão da Estratégia','Plano de Ação revisado',1,false,'Pendente','2026-04-01','2026-10-30',30,30,2)
ON CONFLICT (id) DO NOTHING;

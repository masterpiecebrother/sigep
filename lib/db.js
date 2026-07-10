// lib/db.js
// Conexão com o banco Neon (PostgreSQL serverless).
//
// Prioridade da connection string:
//   1. SGEP_DATABASE_URL  -> variável controlada por nós (não gerida por integração)
//   2. DATABASE_URL       -> gerada pela integração Neon/Vercel
//   3. POSTGRES_URL       -> fallback
//
// Usamos SGEP_DATABASE_URL em primeiro lugar porque a variável DATABASE_URL
// criada pela integração ficou bloqueada apontando para um banco antigo.
// SGEP_DATABASE_URL garante que a aplicação fale com o banco correto.
//
// A conexão é lazy (criada só no primeiro uso em runtime), para o build não falhar.

import { neon } from "@neondatabase/serverless";

let _sql = null;

function getClient() {
  if (_sql) return _sql;
  const connectionString =
    process.env.SGEP_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "Nenhuma connection string definida. Configure SGEP_DATABASE_URL " +
        "nas Environment Variables do projeto na Vercel."
    );
  }
  _sql = neon(connectionString);
  return _sql;
}

export function sql(strings, ...values) {
  return getClient()(strings, ...values);
}

// lib/db.js
// Conexão com o banco Neon (PostgreSQL serverless).
//
// A connection string está embutida diretamente aqui porque a variável de
// ambiente DATABASE_URL (gerida pela integração Neon/Vercel) ficou bloqueada
// apontando para um banco antigo, e não foi possível corrigi-la pelo painel.
// Embutir a string garante que a aplicação conecte no banco correto
// (neon-rose-globe / neondb), que é o que o time usa.
//
// SEGURANÇA: como a senha fica no código de um repositório público, troque-a
// periodicamente no console do Neon e atualize aqui. O ideal, quando possível,
// é migrar de volta para variável de ambiente.

import { neon } from "@neondatabase/serverless";

// Permite sobrescrever por variável de ambiente, se um dia funcionar;
// caso contrário, usa a string correta embutida.
const CONNECTION_STRING =
  process.env.SGEP_DATABASE_URL ||
  "postgresql://neondb_owner:npg_jRU9WZxqSle1@ep-plain-bread-atcta31y-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

let _sql = null;

function getClient() {
  if (_sql) return _sql;
  _sql = neon(CONNECTION_STRING);
  return _sql;
}

export function sql(strings, ...values) {
  return getClient()(strings, ...values);
}

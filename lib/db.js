// lib/db.js
// Conexão com o banco Neon (PostgreSQL serverless).
//
// A Vercel injeta automaticamente a variável DATABASE_URL quando você
// provisiona o Neon pelo Marketplace (Storage). O driver @neondatabase/serverless
// é otimizado para funções serverless (sem problemas de connection pooling).
//
// IMPORTANTE: a conexão é criada de forma "preguiçosa" (lazy), apenas quando
// a primeira query roda em runtime — nunca no momento do import. Isso evita
// que o build da Vercel falhe ao pré-analisar as rotas (quando a env ainda
// não está disponível no contexto de build).

import { neon } from "@neondatabase/serverless";

let _sql = null;

function getClient() {
  if (_sql) return _sql;
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL nao definida. Provisione o Neon no painel da Vercel " +
        "(Storage > Marketplace) ou preencha .env.local para uso local."
    );
  }
  _sql = neon(connectionString);
  return _sql;
}

// Proxy que se comporta como a tagged template sql`...`,
// mas so instancia o cliente Neon na primeira chamada (runtime).
export function sql(strings, ...values) {
  return getClient()(strings, ...values);
}

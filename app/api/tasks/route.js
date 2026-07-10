// app/api/tasks/route.js
// GET  /api/tasks      -> devolve todas as entregas
// PUT  /api/tasks      -> substitui o conjunto completo de entregas
//
// O SGEP trata `tasks` como fonte única de verdade e sempre chama
// commitTasks(novaListaCompleta). Espelhamos isso: o PUT recebe a lista
// inteira e sincroniza o banco (upsert dos presentes + remoção dos ausentes),
// tudo numa transação lógica simples.

import { sql } from "../../../lib/db";
import { rowToTask } from "../../../lib/mappers";

export const dynamic = "force-dynamic"; // nunca cachear

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM entregas ORDER BY id`;
    return Response.json(rows.map(rowToTask));
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return Response.json({ error: "Falha ao ler entregas." }, { status: 500 });
  }
}

export async function PUT(request) {
  let tasks;
  try {
    tasks = await request.json();
    if (!Array.isArray(tasks)) throw new Error("payload não é array");
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    // 1. Upsert de cada entrega recebida.
    for (const t of tasks) {
      await sql`
        INSERT INTO entregas (
          id, title, etapas, descricao, assigned_to, has_collaborator,
          status, data_criacao, data_fim, data_conclusao, is_running,
          actual_seconds, peso2, peso_processo, complexidade, pct_realizado,
          subentregas, observacoes, updated_at
        ) VALUES (
          ${t.id}, ${t.title || ""}, ${t.etapas || ""}, ${t.descricao || ""},
          ${t.assigned_to ?? null}, ${!!t.has_collaborator},
          ${t.status || "Pendente"},
          ${t.data_criacao || null}, ${t.data_fim || null}, ${t.data_conclusao || null},
          ${!!t.is_running}, ${t.actual_seconds || 0},
          ${t.peso2 ?? 30}, ${t.pesoProcesso ?? 30}, ${t.complexidade ?? 1},
          ${t.pctRealizado ?? 0},
          ${JSON.stringify(t.subentregas || [])}::jsonb, ${t.observacoes || ""},
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          title=EXCLUDED.title, etapas=EXCLUDED.etapas, descricao=EXCLUDED.descricao,
          assigned_to=EXCLUDED.assigned_to, has_collaborator=EXCLUDED.has_collaborator,
          status=EXCLUDED.status, data_criacao=EXCLUDED.data_criacao,
          data_fim=EXCLUDED.data_fim, data_conclusao=EXCLUDED.data_conclusao,
          is_running=EXCLUDED.is_running, actual_seconds=EXCLUDED.actual_seconds,
          peso2=EXCLUDED.peso2, peso_processo=EXCLUDED.peso_processo,
          complexidade=EXCLUDED.complexidade, pct_realizado=EXCLUDED.pct_realizado,
          subentregas=EXCLUDED.subentregas, observacoes=EXCLUDED.observacoes,
          updated_at=now()
      `;
    }

    // 2. Remove do banco as entregas que não estão mais na lista.
    const ids = tasks.map((t) => t.id);
    if (ids.length > 0) {
      await sql`DELETE FROM entregas WHERE id <> ALL(${ids})`;
    } else {
      await sql`DELETE FROM entregas`;
    }

    return Response.json({ ok: true, count: tasks.length });
  } catch (err) {
    console.error("[PUT /api/tasks]", err);
    return Response.json({ error: "Falha ao gravar entregas." }, { status: 500 });
  }
}

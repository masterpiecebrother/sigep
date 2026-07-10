// app/api/users/route.js
// GET /api/users  -> lista de servidores
// PUT /api/users  -> substitui a lista de servidores (upsert + remoção)

import { sql } from "../../../lib/db";
import { rowToUser } from "../../../lib/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM servidores ORDER BY id`;
    return Response.json(rows.map(rowToUser));
  } catch (err) {
    console.error("[GET /api/users]", err);
    return Response.json({ error: "Falha ao ler servidores." }, { status: 500 });
  }
}

export async function PUT(request) {
  let users;
  try {
    users = await request.json();
    if (!Array.isArray(users)) throw new Error("payload não é array");
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    for (const u of users) {
      await sql`
        INSERT INTO servidores (
          id, name, email, role, modality,
          hours_per_month, hours_per_year, monitoramentos, updated_at
        ) VALUES (
          ${u.id}, ${u.name}, ${u.email || ""}, ${u.role || "user"},
          ${u.modality || "Presencial"},
          ${u.hoursPerMonth ?? 160}, ${u.hoursPerYear ?? 1920},
          ${u.monitoramentos ?? 0}, now()
        )
        ON CONFLICT (id) DO UPDATE SET
          name=EXCLUDED.name, email=EXCLUDED.email, role=EXCLUDED.role,
          modality=EXCLUDED.modality, hours_per_month=EXCLUDED.hours_per_month,
          hours_per_year=EXCLUDED.hours_per_year, monitoramentos=EXCLUDED.monitoramentos,
          updated_at=now()
      `;
    }

    const ids = users.map((u) => u.id);
    if (ids.length > 0) {
      await sql`DELETE FROM servidores WHERE id <> ALL(${ids})`;
    }

    return Response.json({ ok: true, count: users.length });
  } catch (err) {
    console.error("[PUT /api/users]", err);
    return Response.json({ error: "Falha ao gravar servidores." }, { status: 500 });
  }
}

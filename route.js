// app/api/config/route.js
// GET /api/config  -> parâmetros globais (linha única)
// PUT /api/config  -> atualiza os parâmetros globais

import { sql } from "../../../lib/db";
import { rowToConfig } from "../../../lib/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM configuracao WHERE id = 1`;
    if (rows.length === 0) {
      return Response.json(rowToConfig({}));
    }
    return Response.json(rowToConfig(rows[0]));
  } catch (err) {
    console.error("[GET /api/config]", err);
    return Response.json({ error: "Falha ao ler configuração." }, { status: 500 });
  }
}

export async function PUT(request) {
  let cfg;
  try {
    cfg = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO configuracao (
        id, alpha_parameter, factor_presencial, factor_parcial,
        factor_integral, entregas_macro, logo_url, updated_at
      ) VALUES (
        1, ${cfg.alphaParameter ?? 0.5}, ${cfg.factorPresencial ?? 1.0},
        ${cfg.factorParcial ?? 1.2}, ${cfg.factorIntegral ?? 1.3},
        ${JSON.stringify(cfg.entregasMacro || [])}::jsonb, ${cfg.logoUrl || ""}, now()
      )
      ON CONFLICT (id) DO UPDATE SET
        alpha_parameter=EXCLUDED.alpha_parameter,
        factor_presencial=EXCLUDED.factor_presencial,
        factor_parcial=EXCLUDED.factor_parcial,
        factor_integral=EXCLUDED.factor_integral,
        entregas_macro=EXCLUDED.entregas_macro,
        logo_url=EXCLUDED.logo_url,
        updated_at=now()
    `;
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/config]", err);
    return Response.json({ error: "Falha ao gravar configuração." }, { status: 500 });
  }
}

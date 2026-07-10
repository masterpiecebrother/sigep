// lib/mappers.js
// Converte entre o formato do banco (snake_case) e o formato usado
// pelo SGEPApp.jsx (camelCase / nomes originais das constantes).

export function rowToTask(r) {
  return {
    id: r.id,
    title: r.title || "",
    etapas: r.etapas || "",
    descricao: r.descricao || "",
    assigned_to: r.assigned_to,
    has_collaborator: r.has_collaborator,
    status: r.status || "Pendente",
    data_criacao: r.data_criacao
      ? new Date(r.data_criacao).toISOString().split("T")[0]
      : "",
    data_fim: r.data_fim
      ? new Date(r.data_fim).toISOString().split("T")[0]
      : "",
    data_conclusao: r.data_conclusao || null,
    is_running: r.is_running,
    actual_seconds: r.actual_seconds || 0,
    peso2: r.peso2 ?? 30,
    pesoProcesso: r.peso_processo ?? 30,
    complexidade: r.complexidade ?? 1,
    pctRealizado: r.pct_realizado ?? 0,
    subentregas: r.subentregas || [],
    observacoes: r.observacoes || "",
  };
}

export function rowToUser(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email || "",
    role: r.role || "user",
    modality: r.modality || "Presencial",
    hoursPerMonth: r.hours_per_month ?? 160,
    hoursPerYear: r.hours_per_year ?? 1920,
    monitoramentos: r.monitoramentos ?? 0,
  };
}

export function rowToConfig(r) {
  return {
    alphaParameter: r.alpha_parameter ?? 0.5,
    factorPresencial: r.factor_presencial ?? 1.0,
    factorParcial: r.factor_parcial ?? 1.2,
    factorIntegral: r.factor_integral ?? 1.3,
    entregasMacro: r.entregas_macro || [],
    logoUrl: r.logo_url || "",
  };
}

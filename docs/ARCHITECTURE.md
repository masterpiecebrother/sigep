# Arquitetura — SGEP v3

Este documento descreve a organização interna do componente `SGEPApp.jsx`, o modelo de dados e as fórmulas de cálculo.

## Visão geral

Toda a aplicação é um único componente cliente React. A árvore de componentes é:

```
App                       # Estado global, navegação entre views, sidebar
├── ServerCard            # Card de carga por servidor (rosca de progresso)
├── ProcessoCell          # Combobox de processo (autocompletar)
├── PriorityView          # (auxiliar)
├── DashboardsView        # Abas: Visão Geral, Equipe, Cronograma, Processos
├── KanbanView            # Kanban compartilhado (Plano Mensal e Plano Anual)
└── PetrvsView            # Plano Anual (tabela + modal Nova Entrega)
```

## Modelo de dados

Definido no topo de `SGEPApp.jsx`:

- **`INITIAL_USERS`** — servidores. Campos: `id`, `name`, `email`, `role` (`admin`/`user`), `modality`, `hoursPerMonth`, `hoursPerYear`, `monitoramentos`.
- **`INITIAL_TASKS`** — entregas. Campos: `id`, `title` (processo), `etapas` (entrega), `descricao`, `assigned_to`, `has_collaborator`, `status`, `data_criacao`, `data_fim`, `peso2`, `complexidade`, `pctRealizado`, `subentregas`, `actual_seconds`, `is_running`.
- **`INITIAL_ENTREGAS_MACRO`** — entregas macro de referência.
- **`DEFAULT_CONFIG`** — `alphaParameter`, fatores de modalidade (presencial/parcial/integral), `entregasMacro`, `logoUrl`.
- **`DEFAULT_COLUMN_ORDER`** — ordem das colunas do Plano Mensal.

## Estado compartilhado

O estado `tasks` (em `App`) é a única fonte de verdade. Plano Mensal, Plano Anual, Kanban e Dashboards são todas projeções desse mesmo array. Qualquer alteração passa por `commitTasks(newTasks)`, que:

1. Chama `setTasks(newTasks)`.
2. Registra no histórico (undo/redo).
3. Dispara recálculo dos `useMemo` dependentes (`tasksWithCalculations`, `cargaStats`, `annualStats`).

Por isso, atribuir um responsável no Plano Anual reflete instantaneamente no Plano Mensal e nos Dashboards — não há sincronização manual.

## Fórmulas

### Carga Mensal (Plano Mensal)

```
H_total = hoursPerYear / 12
Carga(i) = H_total × (Peso(i) × Complexidade(i) × F_Colab(i) × F_Urgência(i)) / Σ pesos efetivos
```

- `F_Colab = 1 / c^α`, onde `c` é o número de colaboradores e `α` (`alphaParameter`) tem padrão 0.5.
- `F_Urgência`: vencida = 2 · ≤7d = 1 · ≤30d = 1/15 · ≤90d = 1/60 · >90d = 1/180.

### Carga Anual (Plano Anual)

```
Carga Anual(i) = hoursPerYear × Peso(i) / Σ Peso (do servidor)
%CHD(i) = Carga Anual(i) / Σ Carga Anual (do servidor) × 100
```

### Progresso projetado

```
%Projetado = dias decorridos / duração total do prazo × 100
```

## Compatibilidade com sandbox

- `ResizeObserver` é acessado apenas com guarda `typeof ResizeObserver !== 'undefined'`, para não quebrar em ambientes que não o expõem.
- Não há uso de `window.confirm`, `localStorage` ou `sessionStorage`.
- Fontes (Sora, DM Sans) e o gradiente da sidebar são injetados via tag `<style>` embutida, tornando o componente autossuficiente.

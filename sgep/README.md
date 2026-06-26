# SGEP — Sistema de Gestão de Entregas e Projetos

Sistema interno de gestão de entregas e projetos da **DIGEP/CGPE — INPI** (Coordenação-Geral de Planejamento e Gestão Estratégica). Permite o monitoramento de carga de trabalho da equipe, o acompanhamento de planos mensal e anual de entregas, e a visualização de indicadores em dashboards.

Construído como uma aplicação **Next.js 14 + React 18**, com estilização via **Tailwind CSS** e ícones **lucide-react**.

---

## Funcionalidades

- **Plano Mensal** — tabela dinâmica de entregas com colunas reordenáveis (drag-and-drop), subentregas, percentual realizado, cronograma, responsável e status. Cálculo automático de carga horária mensal por servidor.
- **Plano Anual** — visão anual de entregas com peso, complexidade, carga anual (H), %CHD por servidor e responsável. Suporta duplicação e exclusão de linhas.
- **Visão Kanban** — disponível tanto no Plano Mensal quanto no Plano Anual, com colunas por status (Pendente, Em andamento, Concluído) e arrastar-e-soltar entre células (altera status e responsável simultaneamente).
- **Dashboards** — abas de Visão Geral, Equipe, Cronograma (mapa de calor servidor × mês) e Processos.
- **Gestão de Acessos e Equipe** — cadastro de servidores em Configurações Globais, com modalidade de trabalho (presencial / teletrabalho) e jornada configurável.
- **Espelhamento de dados** — todas as alterações de responsável, status e demais campos refletem automaticamente entre Plano Mensal, Plano Anual e Dashboards, pois compartilham o mesmo estado.
- **Importação CSV/XLSX** e histórico de alterações (undo/redo).

---

## Stack

| Camada      | Tecnologia                  |
| ----------- | --------------------------- |
| Framework   | Next.js 14 (App Router)     |
| UI          | React 18                    |
| Estilo      | Tailwind CSS 3              |
| Ícones      | lucide-react                |
| Planilhas   | SheetJS (xlsx)              |

---

## Como rodar localmente

Pré-requisitos: **Node.js 18.17+** e **npm**.

```bash
# 1. Clonar o repositório
git clone https://github.com/<seu-usuario>/sgep.git
cd sgep

# 2. Instalar dependências
npm install

# 3. Rodar em modo desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build de produção

```bash
npm run build
npm run start
```

---

## Estrutura do projeto

```
sgep/
├── app/
│   ├── globals.css       # Diretivas Tailwind + reset
│   ├── layout.jsx        # Layout raiz (App Router)
│   └── page.jsx          # Página que monta o SGEPApp
├── components/
│   └── SGEPApp.jsx       # Componente principal (toda a aplicação)
├── docs/
│   └── ARCHITECTURE.md   # Notas de arquitetura e fórmulas
├── public/               # Assets estáticos
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── package.json
└── README.md
```

> A aplicação inteira reside em `components/SGEPApp.jsx` como um único componente cliente (`"use client"`). Os dados iniciais (servidores, entregas) estão embutidos no topo do arquivo nas constantes `INITIAL_USERS`, `INITIAL_TASKS`, `INITIAL_ENTREGAS_MACRO` e `DEFAULT_CONFIG`.

---

## Deploy

O projeto está pronto para deploy na **Vercel**:

1. Faça push do repositório para o GitHub.
2. Importe o projeto em [vercel.com/new](https://vercel.com/new).
3. A Vercel detecta o Next.js automaticamente — nenhuma configuração extra é necessária.

Também funciona em qualquer host que suporte Next.js (Netlify, Railway, Render, ou self-hosted via `npm run build && npm run start`).

---

## Dados e persistência

Esta versão usa **estado em memória** (React `useState`) inicializado a partir das constantes no topo de `SGEPApp.jsx`. As alterações **não persistem** entre recarregamentos de página.

Para persistência, conecte um backend (por exemplo, Supabase ou uma API REST) substituindo o estado inicial e os handlers `commitTasks` / `setSystemConfig` por chamadas ao banco.

---

## Licença

Uso interno DIGEP/CGPE — INPI. Veja [LICENSE](./LICENSE).

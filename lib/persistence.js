// lib/persistence.js
// Funções client-side para sincronizar o estado do SGEP com o banco (Neon)
// através das rotas de API. Usadas pelo SGEPApp.jsx.
//
// A gravação é "debounced": múltiplas alterações em sequência (ex.: arrastar
// um cartão) só disparam uma requisição após 600ms de quietude, evitando
// enxurrada de chamadas ao banco.

const DEBOUNCE_MS = 600;

async function getJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

async function putJSON(url, body) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${url} -> ${res.status}`);
  return res.json();
}

// ---- Carregamento inicial (chamado uma vez, ao montar) ----
export async function loadInitialData() {
  const [tasks, users, config] = await Promise.all([
    getJSON("/api/tasks"),
    getJSON("/api/users"),
    getJSON("/api/config"),
  ]);
  return { tasks, users, config };
}

// ---- Gravações com debounce, uma fila por recurso ----
const timers = {};
function debouncedPut(key, url, getBody, onError) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    putJSON(url, getBody()).catch((err) => {
      console.error(`[persistence] ${key}`, err);
      onError?.(err);
    });
  }, DEBOUNCE_MS);
}

export const saveTasks = (tasks, onError) =>
  debouncedPut("tasks", "/api/tasks", () => tasks, onError);

export const saveUsers = (users, onError) =>
  debouncedPut("users", "/api/users", () => users, onError);

export const saveConfig = (config, onError) =>
  debouncedPut("config", "/api/config", () => config, onError);

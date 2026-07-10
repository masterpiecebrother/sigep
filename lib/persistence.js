// lib/persistence.js
// Sincroniza o estado do SGEP com o banco (Neon) via rotas de API.
// Melhorias: debounce curto + flush imediato (grava pendências ao sair da página).

const DEBOUNCE_MS = 250;

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
    keepalive: true, // permite concluir a gravação mesmo se a aba fechar
  });
  if (!res.ok) throw new Error(`PUT ${url} -> ${res.status}`);
  return res.json();
}

// ---- Carregamento inicial ----
export async function loadInitialData() {
  const [tasks, users, config] = await Promise.all([
    getJSON("/api/tasks"),
    getJSON("/api/users"),
    getJSON("/api/config"),
  ]);
  return { tasks, users, config };
}

// ---- Gravação com debounce, com registro do que está pendente ----
const timers = {};
const pending = {}; // key -> { url, body, onError }

function debouncedPut(key, url, getBody, onError) {
  const body = getBody();
  pending[key] = { url, body, onError };
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    const p = pending[key];
    if (!p) return;
    delete pending[key];
    putJSON(p.url, p.body).catch((err) => {
      console.error(`[persistence] ${key}`, err);
      p.onError?.(err);
    });
  }, DEBOUNCE_MS);
}

// Grava imediatamente tudo que estiver pendente (usado no beforeunload).
export function flushPending() {
  Object.keys(pending).forEach((key) => {
    const p = pending[key];
    if (!p) return;
    delete pending[key];
    clearTimeout(timers[key]);
    // fetch com keepalive garante o envio mesmo durante o unload
    try {
      putJSON(p.url, p.body).catch(() => {});
    } catch (_) {}
  });
}

// Registra o flush automático ao sair/recarregar a página (idempotente).
let flushRegistered = false;
export function registerFlushOnUnload() {
  if (flushRegistered || typeof window === "undefined") return;
  flushRegistered = true;
  window.addEventListener("beforeunload", flushPending);
  window.addEventListener("pagehide", flushPending);
}

export const saveTasks = (tasks, onError) =>
  debouncedPut("tasks", "/api/tasks", () => tasks, onError);

export const saveUsers = (users, onError) =>
  debouncedPut("users", "/api/users", () => users, onError);

export const saveConfig = (config, onError) =>
  debouncedPut("config", "/api/config", () => config, onError);

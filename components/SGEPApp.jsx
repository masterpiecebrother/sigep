"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { loadInitialData, saveTasks, saveUsers, saveConfig, registerFlushOnUnload } from '../lib/persistence';
import * as XLSX from 'xlsx';
import {
  Play, Pause, Plus, Shield, Users, BarChart3, Clock, AlertTriangle, CheckCircle2, FileText, Table2, AlertCircle, Calendar, Filter, ArrowRight, Target, Trash2, Search, X, Undo2, Redo2, Save, History as HistoryIcon, Download, Settings, Info, Upload, GripVertical, User as UserIcon, ChevronRight, Layers, Activity, BookOpen, Columns
} from 'lucide-react';

const USE_MOCK_BACKEND = true;

const INITIAL_USERS = [
  { id: 1, name: 'Antônio (Chefe DIGEP)', email: 'admin', role: 'admin', modality: 'Teletrabalho parcial', hoursPerMonth: 160, hoursPerYear: 1920, monitoramentos: 0 },
  { id: 2, name: "Luiz Felipe D'Almeida", email: 'luiz.felipe', role: 'user', modality: 'Presencial', hoursPerMonth: 160, hoursPerYear: 1920, monitoramentos: 0 },
  { id: 3, name: 'Thais Carvalho', email: 'thais.carvalho', role: 'user', modality: 'Teletrabalho parcial', hoursPerMonth: 160, hoursPerYear: 1920, monitoramentos: 0 },
  { id: 4, name: 'Diego Hervé', email: 'diego.herve', role: 'user', modality: 'Teletrabalho parcial', hoursPerMonth: 160, hoursPerYear: 1920, monitoramentos: 0 },
];

const INITIAL_ENTREGAS_MACRO = [
  { id: 1, processos: 'Gerenciamento de projetos estratégicos', entrega: 'Proposta de diretrizes para ocupação e capacitação de Chefe de Projeto II', peso: 60, prazo: '2026-04-30', area: 'DIGEP' }, { id: 2, processos: 'Gerenciamento de projetos estratégicos', entrega: 'Guia de Gerenciamento de Projetos do INPI elaborado', peso: 60, prazo: '2026-06-30', area: 'DIGEP' }, { id: 3, processos: 'Gerenciamento de projetos estratégicos', entrega: 'Treinamento na metodologia de gerenciamento de projetos realizado', peso: 60, prazo: '2026-08-31', area: 'DIGEP' }, { id: 4, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Metas, entregas e medidas institucionais no PPA avaliadas', peso: 60, prazo: '2026-02-27', area: 'DIGEP' }, { id: 5, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Relatório de Execução Anual (REA) elaborado', peso: 60, prazo: '2026-03-31', area: 'DIGEP' }, { id: 6, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Nova versão desktop da Central de Monitoramento implantada', peso: 60, prazo: '2026-05-29', area: 'DIGEP' }, { id: 7, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Versão mobile (celular) da Central de Monitoramento desenvolvida', peso: 60, prazo: '2026-06-30', area: 'DIGEP' }, { id: 8, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Implementação de solução de aprimoramento da Central de Monitoramento', peso: 60, prazo: '2026-09-30', area: 'DIGEP' }, { id: 9, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Central de Monitoramento do Plano de Ação publicada', peso: 60, prazo: '2026-12-15', area: 'DIGEP' }, { id: 10, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Relatório de Monitoramento e Avaliação (M&A) do Plano de Ação elaborado', peso: 60, prazo: '2026-12-20', area: 'DIGEP' }, { id: 11, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Metas e entregas no Plano de Ação da ENPI monitoradas', peso: 60, prazo: '2026-12-31', area: 'DIGEP' }, { id: 12, processos: 'Monitoramento e Avaliação (M&A) da Estratégia', entrega: 'Metas e entregas no PPA monitoradas', peso: 60, prazo: '2026-12-31', area: 'DIGEP' }, { id: 13, processos: 'Planejamento da Estratégia', entrega: 'Plano de Ação 2026 elaborado', peso: 60, prazo: '2026-02-27', area: 'DIGEP' }, { id: 14, processos: 'Planejamento da Estratégia', entrega: 'Plano Estratégico elaborado', peso: 60, prazo: '2026-06-30', area: 'DIGEP' }, { id: 15, processos: 'Planejamento da Estratégia', entrega: 'Plano de Negócios elaborado', peso: 60, prazo: '2026-09-30', area: 'DIGEP' }, { id: 16, processos: 'Planejamento da Estratégia', entrega: 'Plano de Ação 2027 elaborado', peso: 60, prazo: '2026-12-31', area: 'DIGEP' }, { id: 17, processos: 'Prestação de Contas', entrega: 'Relatório de Gestão da Prestação de Contas 2026 elaborado', peso: 30, prazo: '2026-12-31', area: 'DIGEP' }, { id: 18, processos: 'Revisão da Estratégia', entrega: 'Metas, entregas e medidas institucionais no PPA revisadas', peso: 30, prazo: '2026-03-31', area: 'DIGEP' }, { id: 19, processos: 'Revisão da Estratégia', entrega: 'Metas e entregas no Plano de Ação da ENPI revisadas', peso: 30, prazo: '2026-09-30', area: 'DIGEP' }, { id: 20, processos: 'Revisão da Estratégia', entrega: 'Plano de Ação revisado', peso: 30, prazo: '2026-10-30', area: 'DIGEP' }, ];

const INITIAL_TASKS = [
  { id: 101, title: 'Gerenciamento de projetos estratégicos', etapas: 'Proposta de diretrizes para ocupação e capacitação de Chefe de Projeto II', assigned_to: 2, has_collaborator: false, status: 'Pendente', data_criacao: '2026-02-02', data_fim: '2026-04-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 102, title: 'Gerenciamento de projetos estratégicos', etapas: 'Guia de Gerenciamento de Projetos do INPI elaborado', assigned_to: 3, has_collaborator: true, status: 'Pendente', data_criacao: '2026-04-01', data_fim: '2026-06-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 60, pesoProcesso: 60, complexidade: 3, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 103, title: 'Gerenciamento de projetos estratégicos', etapas: 'Treinamento na metodologia de gerenciamento de projetos realizado', assigned_to: 1, has_collaborator: true, status: 'Pendente', data_criacao: '2026-07-01', data_fim: '2026-08-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 201, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Metas, entregas e medidas institucionais no PPA avaliadas', assigned_to: 4, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-02-27', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 202, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Relatório de Execução Anual (REA) elaborado', assigned_to: 2, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-03-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 203, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Nova versão desktop da Central de Monitoramento implantada', assigned_to: 2, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-05-29', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 3, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 204, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Versão mobile (celular) da Central de Monitoramento desenvolvida', assigned_to: 3, has_collaborator: false, status: 'Pendente', data_criacao: '2026-04-01', data_fim: '2026-06-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 205, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Implementação de solução de aprimoramento da Central de Monitoramento', assigned_to: 3, has_collaborator: true, status: 'Pendente', data_criacao: '2026-02-02', data_fim: '2026-09-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 60, pesoProcesso: 60, complexidade: 3, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 206, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Central de Monitoramento do Plano de Ação publicada', assigned_to: 2, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-12-15', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 207, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Relatório de Monitoramento e Avaliação (M&A) do Plano de Ação elaborado', assigned_to: 4, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-12-20', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 208, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Metas e entregas no Plano de Ação da ENPI monitoradas', assigned_to: 3, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-12-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 209, title: 'Monitoramento e Avaliação (M&A) da Estratégia', etapas: 'Metas e entregas no PPA monitoradas', assigned_to: 4, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-12-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 301, title: 'Planejamento da Estratégia', etapas: 'Plano de Ação 2026 elaborado', assigned_to: 1, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-02-27', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 60, pesoProcesso: 60, complexidade: 3, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 302, title: 'Planejamento da Estratégia', etapas: 'Plano Estratégico elaborado', assigned_to: 1, has_collaborator: true, status: 'Pendente', data_criacao: '2026-01-05', data_fim: '2026-06-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 60, pesoProcesso: 60, complexidade: 3, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 303, title: 'Planejamento da Estratégia', etapas: 'Plano de Negócios elaborado', assigned_to: 4, has_collaborator: false, status: 'Pendente', data_criacao: '2026-07-01', data_fim: '2026-09-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 60, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 304, title: 'Planejamento da Estratégia', etapas: 'Plano de Ação 2027 elaborado', assigned_to: 2, has_collaborator: false, status: 'Pendente', data_criacao: '2026-07-01', data_fim: '2026-12-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 60, pesoProcesso: 60, complexidade: 3, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 401, title: 'Prestação de Contas', etapas: 'Relatório de Gestão da Prestação de Contas 2026 elaborado', assigned_to: 4, has_collaborator: false, status: 'Pendente', data_criacao: '2026-08-03', data_fim: '2026-12-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 30, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 501, title: 'Revisão da Estratégia', etapas: 'Metas, entregas e medidas institucionais no PPA revisadas', assigned_to: 3, has_collaborator: false, status: 'Pendente', data_criacao: '2026-01-02', data_fim: '2026-03-31', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 30, complexidade: 1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 502, title: 'Revisão da Estratégia', etapas: 'Metas e entregas no Plano de Ação da ENPI revisadas', assigned_to: 2, has_collaborator: false, status: 'Pendente', data_criacao: '2026-08-03', data_fim: '2026-09-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 30, complexidade: 1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, { id: 503, title: 'Revisão da Estratégia', etapas: 'Plano de Ação revisado', assigned_to: 1, has_collaborator: false, status: 'Pendente', data_criacao: '2026-04-01', data_fim: '2026-10-30', is_running: false, actual_seconds: 0, data_conclusao: null, peso2: 30, pesoProcesso: 30, complexidade: 2, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' }, ];

const DEFAULT_CONFIG = {
  alphaParameter: 0.5, factorPresencial: 1.0, factorParcial: 1.2, factorIntegral: 1.3, entregasMacro: INITIAL_ENTREGAS_MACRO, logoUrl: '', };

const DEFAULT_COLUMN_ORDER = [
  'actions', 'farol', 'processo', 'entrega', 'complexidade', 'pesoEntrega', 'cronograma', 'carga', 'pctCarga', 'pctRealizado', 'observacoes', 'responsavel', 'colabs', 'tempo', 'conclusao', 'status'
];

const getMonthsDifference = (s, e) => {
  const start = new Date(s + 'T12:00:00'), end = new Date(e + 'T12:00:00');
  let m = (end.getFullYear() - start.getFullYear()) * 12 - start.getMonth() + end.getMonth();
  return Math.max(1, m + 1);
};
const formatTime = (ts) => {
  if (!ts) return '00:00:00';
  return [Math.floor(ts/3600), Math.floor((ts%3600)/60), ts%60].map(n => String(n).padStart(2,'0')).join(':');
};
const formatMonthName = (ym) => {
  if (ym === 'all') return 'Todo o Período';
  const [y, m] = ym.split('-');
  return new Date(+y, +m-1, 1).toLocaleString('pt-BR', { month:'long', year:'numeric' }).toUpperCase();
};

const FIELD_OPTIONS = [
  { value: '', label: '— Ignorar —' }, { value: 'title', label: 'Processo' }, { value: 'etapas', label: 'Entrega' }, { value: 'pesoProcesso', label: 'Peso Processo' }, { value: 'peso2', label: 'Peso' }, { value: 'complexidade', label: 'Complexidade' }, { value: 'data_criacao', label: 'Início' }, { value: 'data_fim', label: 'Fim' }, { value: 'assigned_to', label: 'Responsável' }, { value: 'status', label: 'Status' }, { value: 'has_collaborator', label: 'Colaborador' }, ];

const stripAccents = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const normalizeStr = s => stripAccents(String(s||'').toLowerCase().trim()).replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ');

const autoMatchField = (colName, colLabelOverrides) => {
  const n = normalizeStr(colName);

  for (const [colId, lbl] of Object.entries(colLabelOverrides)) {
    if (normalizeStr(lbl) === n) {
      const map = { processo:'title', entrega:'etapas', pesoprocesso:'pesoProcesso', pesoentrega:'peso2', complexidadeentrega:'complexidade', complexidade:'complexidade', cronogramaini:'data_criacao', inicio:'data_criacao', fim:'data_fim', responsavel:'assigned_to', status:'status', colabs:'has_collaborator' };
      const k = normalizeStr(lbl).replace(/ /g,'');
      if (map[k]) return map[k];
    }
  }

  const m = {
    'processo':'title', 'entrega':'etapas', 'peso processo':'pesoProcesso', 'peso entrega':'peso2', 'peso 2':'peso2', 'peso2':'peso2', 'complexidade entrega':'complexidade', 'complexidade':'complexidade', 'inicio':'data_criacao', 'data inicio':'data_criacao', 'data de inicio':'data_criacao', 'fim':'data_fim', 'data fim':'data_fim', 'prazo':'data_fim', 'data de fim':'data_fim', 'responsavel':'assigned_to', 'responsável':'assigned_to', 'status':'status', 'colaborador':'has_collaborator', 'colabs':'has_collaborator', 'tem colaborador':'has_collaborator', };
  return m[n] || '';
};

const parseExcelDate = (v) => {
  if (!v && v !== 0) return '';
  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-.\\](\d{1,2})[\/\-.\\](\d{2,4})$/);
  if (m) {
    const [,d,mo,y] = m;
    return `${y.length===2?'20'+y:y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  return '';
};

const parseWeight = (v) => { const n=parseInt(v); return [10,30,60].includes(n)?n:30; };
const parseComplexidade = (v) => { const n=parseInt(v); return [1,2,3].includes(n)?n:1; };
const parseStatus = (v) => {
  const s = normalizeStr(String(v||''));
  if(s.includes('andamento')) return 'Em andamento';
  if(s.includes('conclu')) return 'Concluído';
  return 'Pendente';
};
const parseBool = (v) => {
  const s = normalizeStr(String(v||''));
  return s==='sim'||s==='yes'||s==='true'||s==='1'||s==='x';
};
const parseUserField = (v, users) => {
  if(!v) return users[0]?.id||1;
  const s = normalizeStr(String(v));
  const found = users.find(u=>normalizeStr(u.name).includes(s)||s.includes(normalizeStr(u.name.split(' ')[0])));
  return found?.id||users[0]?.id||1;
};

const FarolBadge = ({ label }) => {
  const cfgMap = {
    'Concluído': { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle2 size={11}/> }, 'Atrasado': { cls: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle size={11}/> }, 'Perto': { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertCircle size={11}/> }, 'Longe': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={11}/> }, };
  const { cls, icon } = cfgMap[label] || { cls: 'bg-gray-50 text-gray-500 border-gray-200', icon: null };
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border ${cls}`}>{icon}{label}</span>;
};

const PesoBadge = ({ peso, label = 'MACRO' }) => {
  const cls = { 10:'bg-slate-100 text-slate-500 border-slate-200', 30:'bg-indigo-50 text-indigo-600 border-indigo-200', 60:'bg-violet-50 text-violet-700 border-violet-200' }[peso] || 'bg-gray-100 text-gray-500 border-gray-200';
  return <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border uppercase ${cls}`}>{label}: {peso}</span>;
};

const ProgressRing = ({ pct, color, size = 60 }) => {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ - (Math.min(pct,100)/100)*circ}
        strokeLinecap="round" style={{ transition:'stroke-dashoffset .8s ease' }}/>
    </svg>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${active ? 'bg-white/15 text-white shadow-sm' : 'text-blue-200/70 hover:bg-white/8 hover:text-white'}`}>
    <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-blue-300/60'}`}>{icon}</span>
    <span className="truncate">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto text-blue-300/60"/>}
  </button>
);

const Peso2Select = ({ value, onChange, disabled }) => {
  const cls = { 10:'bg-slate-50 text-slate-600 border-slate-200', 30:'bg-indigo-50 text-indigo-700 border-indigo-200', 60:'bg-violet-50 text-violet-700 border-violet-200' }[value] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <select value={value} onChange={e => onChange(parseInt(e.target.value))} disabled={disabled}
      className={`text-[11px] font-black rounded-lg px-2 py-1.5 border focus:outline-none transition-colors ${cls} ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer'}`}>
      <option value={10}>10 pts</option>
      <option value={30}>30 pts</option>
      <option value={60}>60 pts</option>
    </select>
  );
};

function ServerCard({ stat, annualStats, systemConfig, refMonthForCarga, tasksWithCalculations, compact = false }) {
  const isParcial  = stat.modality?.toLowerCase().includes('parcial');
  const isIntegral = stat.modality?.toLowerCase().includes('integral');
  const isBase     = !isParcial && !isIntegral;
  const targetExtra = isParcial ? 20 : isIntegral ? 30 : 0;

  const factorLabel = isParcial
    ? `×${systemConfig.factorParcial}` : isIntegral ? `×${systemConfig.factorIntegral}` : '×1.0 (base)';

  const ann    = annualStats?.find(a => a.userId === stat.id) || { horasAlocAno: 0, horasDispAno: stat.hoursPerMonth * 12, monthsActive: 0 };
  const uTasks = tasksWithCalculations.filter(t => t.assigned_to === stat.id && t.isActiveInRef);
  const hMes   = uTasks.reduce((a, t) => a + t.carga_horaria_mensal, 0);
  const hMax   = stat.hoursPerMonth || Math.round((stat.hoursPerYear ?? 1920) / 12);
  const hPct   = Math.min(Math.round((hMes / hMax) * 100), 999);
  const hColor = hPct > 100 ? '#F59E0B' : hPct >= 80 ? '#0B2461' : hPct >= 50 ? '#10B981' : '#94A3B8';

  const baseline = stat.userFactor > 0 ? Math.round(stat.expectedPoints / stat.userFactor) : stat.expectedPoints;
  const extraPct = baseline > 0 ? Math.round(((stat.assignedPoints - baseline) / baseline) * 100) : 0;

  const lerpHex = (a, b, t) => {
    const hex = c => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    const [ar,ag,ab] = hex(a), [br,bg,bb] = hex(b);
    const r = Math.round(ar + (br-ar)*t), g = Math.round(ag + (bg-ag)*t), bv = Math.round(ab + (bb-ab)*t);
    return `rgb(${r},${g},${bv})`;
  };

  let ringColor = '#0B2461';
  if (!isBase) {
    if (extraPct < 0) {

      const depth = Math.min(Math.abs(extraPct) / targetExtra, 1); // 0→1
      ringColor = lerpHex('#FECACA', '#991B1B', depth); // red-200 → red-800
    } else if (extraPct < targetExtra) {

      const depth = extraPct / targetExtra; // 0→1
      ringColor = lerpHex('#FEF9C3', '#D97706', depth); // yellow-100 → amber-600
    } else {

      const over = Math.min((extraPct - targetExtra) / targetExtra, 1); // 0→1
      ringColor = lerpHex('#BBF7D0', '#14532D', over); // green-200 → green-900
    }
  }

  const ringPct = isBase ? 100 : targetExtra > 0 ? Math.min(Math.round(Math.max(extraPct,0)/targetExtra*100),100) : 0;
  const ringSize = compact ? 52 : 68;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-w-0">
      <div className={`border-b border-gray-100 flex items-center gap-2 ${compact ? 'px-3 pt-3 pb-2' : 'p-4'}`}>
        <div className={`rounded-full flex-shrink-0 flex items-center justify-center font-sora font-bold text-white shadow-sm bg-[#0B2461] ${compact ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-sm'}`}>
          {stat.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0 mr-1">
          <p className="font-bold text-gray-800 text-xs leading-tight">{stat.name.split('(')[0].trim()}</p>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <span className="text-[9px] text-gray-400 truncate">{stat.modality}</span>
            <span className={`text-[8px] px-1 py-0.5 rounded font-black border ${isBase ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{factorLabel}</span>
          </div>
        </div>
        {isBase ? (
          <div className="flex-shrink-0" style={{width:ringSize, height:ringSize}}>
            <div style={{width:ringSize, height:ringSize, borderRadius:'50%', border:'5px solid #0B2461', background:'#EFF6FF', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
              <span style={{fontSize:8, fontWeight:800, color:'#0B2461', textAlign:'center', lineHeight:1.3, display:'flex', flexDirection:'column', alignItems:'center'}}><span>LINHA</span><span>BASE</span></span>
            </div>
          </div>
        ) : (
          <div className="relative flex-shrink-0" style={{width:ringSize, height:ringSize}}>
            <ProgressRing pct={ringPct} color={ringColor} size={ringSize}/>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
              <span className="font-sora font-black leading-none" style={{fontSize: compact?13:16, color:ringColor}}>
                {extraPct>0?'+':''}{extraPct}%
              </span>
              <span style={{fontSize:9, color:'#9ca3af', lineHeight:1}}>/{targetExtra}%</span>
            </div>
          </div>
        )}
      </div>
      <div className={`space-y-2.5 ${compact ? 'px-4 py-2.5' : 'p-5'}`}>

        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Pontos (Peso × Complexidade)</span>
            <span className="font-semibold text-gray-700">{stat.taskPoints} pts</span>
          </div>
          <div className="flex justify-between text-[10px] border-t border-gray-200 pt-1 mt-1">
            <span className="font-bold text-gray-700">Total atribuído</span>
            <span className={`font-sora font-bold text-[#0B2461] ${compact ? '' : 'text-base leading-none'}`}>{stat.assignedPoints} <span className="text-[11px] font-normal text-gray-400">pts</span></span>
          </div>
        </div>

        {!isBase && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">Meta proporcional</span>
            <span className="text-[10px] font-semibold text-gray-700">{stat.expectedPoints} pts <span className="text-[9px] text-gray-400">({factorLabel})</span></span>
          </div>
        )}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${stat.pct}%`, background:stat.ringColor}}/>
        </div>
        {!isBase && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400">Discrepância</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${stat.statusColor}`}>{stat.diff>0?`+${stat.diff}`:stat.diff} pts</span>
          </div>
        )}
        <div className={`flex items-start gap-1.5 p-2 rounded-lg border text-[10px] ${stat.statusColor}`}>
          <ArrowRight size={11} className="mt-0.5 flex-shrink-0"/>{stat.suggestion}
        </div>

        <div className="border-t border-gray-100 pt-2 space-y-1.5">
          <p className="text-[9px] font-sora font-semibold text-gray-400 uppercase tracking-wider">Carga Horária</p>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Alocada no mês ({refMonthForCarga?.split('-').reverse().join('/')})</span>
            <span className="font-bold" style={{color:hColor}}>{hMes.toFixed(1)}h / {hMax}h <span className="text-gray-400 font-normal">({hPct}%)</span></span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{width:`${Math.min(hPct,100)}%`, background:hColor}}/>
          </div>
          {(() => {
            const [refY, refM] = (refMonthForCarga||'2026-01').split('-').map(Number);
            const mStart = new Date(refY, refM-1, 1);
            const mEnd   = new Date(refY, refM, 0, 23, 59, 59);
            const yearStart = new Date(refY, 0, 1);
            const yearEnd   = new Date(refY, 11, 31, 23, 59, 59);

            const uAllTasks = tasksWithCalculations.filter(t => t.assigned_to === stat.id && (t.actual_seconds||0) > 0);

            const tempoMes = uAllTasks.filter(t => {
              const s = new Date(t.data_criacao+'T00:00:00');
              const e = new Date(t.data_fim+'T23:59:59');
              return s <= mEnd && e >= mStart;
            }).reduce((a,t) => a + (t.actual_seconds||0), 0) / 3600;

            const tempoAno = uAllTasks.filter(t => {
              const s = new Date(t.data_criacao+'T00:00:00');
              const e = new Date(t.data_fim+'T23:59:59');
              return s <= yearEnd && e >= yearStart;
            }).reduce((a,t) => a + (t.actual_seconds||0), 0) / 3600;
            const tColor = tempoMes > hMes*1.1 ? '#EF4444' : tempoMes > 0 ? '#10B981' : '#9ca3af';
            return (
              <>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500 flex items-center gap-1"><span style={{fontSize:8}}>▶</span> Executada no mês</span>
                  <span className="font-bold" style={{color:tColor}}>{tempoMes.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500 flex items-center gap-1"><span style={{fontSize:8}}>▶</span> Executada no ano</span>
                  <span className="font-semibold text-gray-600">{tempoAno.toFixed(1)}h</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function ProcessoCell({ task, uniqueProcesses, isAdmin, handleTitleChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]   = useState(task.title);

  useEffect(() => { if (!editing) setDraft(task.title); }, [task.title, editing]);

  const commit = () => {
    const val = draft.trim() || task.title;
    if (val !== task.title) handleTitleChange(task.id, val);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {editing ? (
        <>
          <input
            autoFocus
            list={`proc-list-${task.id}`}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit(); }
              if (e.key === 'Escape') { setDraft(task.title); setEditing(false); }
            }}
            className="w-full border border-[#0B2461] rounded-md px-2 py-1.5 text-xs font-semibold text-[#0B2461] focus:outline-none bg-white shadow-sm"
            placeholder="Selecione ou digite…"
          />
          <datalist id={`proc-list-${task.id}`}>
            {uniqueProcesses.map(p => <option key={p} value={p}/>)}
          </datalist>
          <div className="flex gap-1 text-[9px] text-gray-400">
            <span>↵ confirmar</span><span>·</span><span>Esc cancelar</span>
          </div>
        </>
      ) : (
        <div
          className="group/proc relative cursor-pointer"
          onClick={() => { setDraft(task.title); setEditing(true); }}
          title="Clique para editar ou selecionar processo">
          <span className="font-semibold text-[#0B2461] text-xs whitespace-pre-wrap break-words leading-relaxed">
            {task.title}
          </span>
          <span className="ml-1.5 opacity-0 group-hover/proc:opacity-50 text-[10px] text-[#0B2461] transition-opacity">✎</span>
        </div>
      )}
      {task.isMelhoria && task.has_collaborator && task.peso2 === 60 && (
        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold w-fit">Colab → 30pts</span>
      )}
    </div>
  );
}

function PriorityView({ tasksWithCalculations, tasks, users, currentUser, refMonthForCarga }) {
  const U_LABELS = { 4:'Vencida', 3:'Este mês', 2:'Próx. 30d', 1:'>30d', 0:'Concluída' };
  const U_COLORS = {
    4: { bg:'bg-red-100', text:'text-red-800', border:'border-red-300', bar:'#EF4444' }, 3: { bg:'bg-amber-100', text:'text-amber-800', border:'border-amber-300', bar:'#F59E0B' }, 2: { bg:'bg-blue-100', text:'text-blue-800', border:'border-blue-300', bar:'#3B82F6' }, 1: { bg:'bg-gray-100', text:'text-gray-600', border:'border-gray-300', bar:'#94A3B8' }, 0: { bg:'bg-emerald-100',text:'text-emerald-800',border:'border-emerald-300',bar:'#10B981' }, };

  const [priUser, setPriUser]   = useState(currentUser.id);
  const [priStatus, setPriStatus] = useState('pendentes');

  const allActive = tasksWithCalculations.filter(t => {
    if (t.assigned_to !== priUser) return false;
    if (priStatus === 'pendentes') return t.status !== 'Concluído';
    if (priStatus === 'ativos')    return t.isActiveInRef && t.status !== 'Concluído';
    return true;
  });

  const sorted = [...allActive].sort((a, b) =>
    b.priorityScore !== a.priorityScore
      ? b.priorityScore - a.priorityScore : (a.complexidade||1) - (b.complexidade||1)
  );

  const userObj  = users.find(u => u.id === priUser);
  const H_total  = userObj ? Math.round((userObj.hoursPerYear ?? userObj.hoursPerMonth*12) / 12) : 160;
  const sumH     = sorted.filter(t => t.isActiveInRef).reduce((a,t) => a + t.carga_horaria_mensal, 0);
  const maxScore = sorted[0]?.priorityScore || 1;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 pb-10">

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-[#0B2461] rounded-xl px-4 py-2.5">
          <Target size={16} className="text-white"/>
          <span className="font-sora font-bold text-white text-sm">Score = (P×2) + U</span>
        </div>
        <div className="h-6 w-px bg-gray-200"/>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Servidor:</span>
          <select value={priUser} onChange={e => setPriUser(parseInt(e.target.value))}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-white text-[#0B2461] focus:outline-none">
            {users.map(u => <option key={u.id} value={u.id}>{u.name.split('(')[0].trim()}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Exibir:</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {[{v:'pendentes',l:'Pendentes'},{v:'ativos',l:'Ativos no mês'},{v:'todos',l:'Todos'}].map(o => (
              <button key={o.v} onClick={() => setPriStatus(o.v)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${priStatus===o.v?'bg-[#0B2461] text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <span><strong className="text-[#0B2461]">{sorted.length}</strong> entregas</span>
          <span>·</span>
          <span>Carga no mês: <strong className="text-[#0B2461]">{sumH.toFixed(1)}h</strong> / {H_total}h</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[4,3,2,1].map(u => {
          const c = U_COLORS[u];
          const n = sorted.filter(t => t.urgencyU === u).length;
          return (
            <div key={u} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
              <span>U={u} — {U_LABELS[u]}</span>
              {n > 0 && <span className="bg-white/60 px-1.5 py-0.5 rounded-full font-bold">{n}</span>}
            </div>
          );
        })}
        <div className="ml-auto text-[10px] text-gray-400 self-center">Empate → menor complexidade ganha · ordenado por Score ↓</div>
      </div>

      {sorted.length === 0
        ? <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">Nenhuma entrega encontrada para os filtros selecionados.</div> : sorted.map((task, idx) => {
            const uc   = U_COLORS[task.urgencyU] || U_COLORS[1];
            const pct  = Math.round((task.priorityScore / maxScore) * 100);
            const hPct = H_total > 0 ? Math.round((task.carga_horaria_mensal / H_total) * 100) : 0;
            const isTie = idx > 0 && sorted[idx-1].priorityScore === task.priorityScore;
            return (
              <div key={task.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                style={{borderLeftWidth:4, borderLeftColor:uc.bar}}>
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-sora font-black text-base shadow-sm ${idx===0?'bg-[#0B2461] text-white':idx===1?'bg-gray-700 text-white':idx===2?'bg-amber-500 text-white':'bg-gray-100 text-gray-500'}`}>
                      {isTie ? '=' : `#${idx+1}`}
                    </div>
                    {isTie && <span className="text-[8px] text-gray-400 mt-0.5">Empate</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-[#0B2461] text-sm leading-snug break-words">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 break-words">{task.etapas}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-sora font-black text-2xl leading-none text-[#0B2461]">{task.priorityScore}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">Score</div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full" style={{width:`${pct}%`, background:uc.bar}}/>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className={`px-2 py-1 rounded-lg border font-bold ${uc.bg} ${uc.text} ${uc.border}`}>U={task.urgencyU} · {U_LABELS[task.urgencyU]}</span>
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-lg font-semibold">P={task.peso2||30} pts</span>
                      <span className="bg-gray-50 text-gray-700 border border-gray-200 px-2 py-1 rounded-lg font-semibold">Cpx {task.complexidade||1} · {(task.complexidade||1)===1?'Baixa':(task.complexidade||1)===2?'Média':'Alta'}</span>
                      <span className="text-gray-400 font-mono text-[10px]">= ({task.peso2||30}×2) + {task.urgencyU}</span>
                      {task.has_collaborator && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-semibold">👥 Colab.</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2 min-w-[110px]">
                    {task.isActiveInRef ? (
                      <div className="text-right">
                        <div className="font-sora font-bold text-lg leading-none text-[#0B2461]">{task.carga_horaria_mensal.toFixed(1)}h</div>
                        <div className="text-[9px] text-gray-400">/{H_total}h ({hPct}%)</div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1.5 w-24">
                          <div className="h-full rounded-full" style={{width:`${Math.min(hPct,100)}%`, background:uc.bar}}/>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="font-sora font-bold text-sm text-gray-400">—</div>
                        <div className="text-[9px] text-gray-400">Fora do mês ref.</div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">Prazo</div>
                      <div className="text-xs font-semibold text-gray-700">{task.data_fim.split('-').reverse().join('/')}</div>
                    </div>
                    <div className={`text-[9px] px-2 py-1 rounded-full border font-bold ${task.status==='Concluído'?'bg-emerald-50 text-emerald-700 border-emerald-200':task.status==='Em andamento'?'bg-blue-50 text-blue-700 border-blue-200':'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {task.status}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
      }

      {sorted.length > 0 && (
        <div className="bg-[#0B2461] rounded-xl p-5 text-white">
          <p className="font-sora font-bold text-sm mb-3">📊 Resumo — {userObj?.name?.split('(')[0].trim()}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[4,3,2,1].map(u => {
              const ts = sorted.filter(t => t.urgencyU === u);
              return ts.length > 0 ? (
                <div key={u} className="bg-white/10 rounded-lg p-3">
                  <div className="font-sora font-black text-2xl">{ts.length}</div>
                  <div className={`text-xs font-semibold mt-1 ${u===4?'text-red-300':u===3?'text-amber-300':u===2?'text-blue-300':'text-gray-300'}`}>{U_LABELS[u]}</div>
                  <div className="text-[10px] text-blue-200/60 mt-0.5">Scores: {ts.map(t=>t.priorityScore).join(', ')}</div>
                </div>
              ) : null;
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-blue-200/70">
            <span>Maior Score: <strong className="text-white">{sorted[0]?.priorityScore}</strong> — {sorted[0]?.etapas?.substring(0,40)}</span>
            <span>Carga mês: <strong className="text-white">{sumH.toFixed(1)}h / {H_total}h</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardsView({ tasks, tasksWithCalculations, users, cargaStats, annualStats, systemConfig, refMonthForCarga, todayDate }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const tabs = [
    { id:'overview', label:'Visão Geral', icon:'📊' },
    { id:'equipe',   label:'Equipe',      icon:'👥' },
    { id:'cronograma', label:'Cronograma', icon:'📅' },
    { id:'processos',  label:'Processos',  icon:'📋' },
  ];
  const concluded  = tasks.filter(t=>t.status==='Concluído').length;
  const inProgress = tasks.filter(t=>t.status==='Em andamento').length;
  const pending    = tasks.filter(t=>t.status==='Pendente').length;
  const overdue    = tasks.filter(t=>{
    if(t.status==='Concluído') return false;
    return new Date(t.data_fim+'T23:59:59') < todayDate;
  }).length;

  const fmtDate = d => d ? d.split('-').reverse().map((v,i)=>i===2?v.slice(2):v).join('/') : '—';
  const pctColor = p => p>=100?'#10B981':p>=50?'#3B82F6':p>0?'#F59E0B':'#9ca3af';

  return (
    <div style={{maxWidth:1200, margin:'0 auto', paddingBottom:60}}>
      {/* Tab bar */}
      <div style={{display:'flex', gap:4, marginBottom:24, background:'#fff', borderRadius:12, padding:4, border:'1px solid #e5e7eb', width:'fit-content'}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{padding:'8px 18px', borderRadius:8, fontSize:12, fontWeight:600,
              background:activeTab===t.id?'#0B2461':'transparent',
              color:activeTab===t.id?'#fff':'#6b7280', border:'none', cursor:'pointer'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab==='overview' && (
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
            {[
              {label:'Total Entregas', value:tasks.length, color:'#0B2461'},
              {label:'Concluídas', value:concluded, color:'#10B981'},
              {label:'Em Andamento', value:inProgress, color:'#3B82F6'},
              {label:'Pendentes', value:pending, color:'#F59E0B'},
              {label:'Atrasadas', value:overdue, color:'#EF4444'},
            ].map(k=>(
              <div key={k.label} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'16px 20px', flex:'1 1 120px', minWidth:110}}>
                <div style={{fontSize:11, color:'#9ca3af', marginBottom:6}}>{k.label}</div>
                <div style={{fontSize:24, fontWeight:800, color:k.color}}>{k.value}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20}}>
            <div style={{fontSize:12, fontWeight:700, color:'#0B2461', marginBottom:12}}>Distribuição por Status</div>
            <div style={{display:'flex', gap:8, alignItems:'flex-end', height:80}}>
              {[
                {label:'Concluídas', value:concluded, color:'#10B981'},
                {label:'Em Andamento', value:inProgress, color:'#3B82F6'},
                {label:'Pendentes', value:pending, color:'#F59E0B'},
                {label:'Atrasadas', value:overdue, color:'#EF4444'},
              ].map(b=>{
                const pct = Math.round((b.value/Math.max(tasks.length,1))*100);
                return (
                  <div key={b.label} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1}}>
                    <span style={{fontSize:10, fontWeight:600, color:b.color}}>{b.value}</span>
                    <div style={{width:'100%', background:'#f1f5f9', borderRadius:'4px 4px 0 0', height:60, display:'flex', alignItems:'flex-end'}}>
                      <div style={{width:'100%', height:`${Math.max(pct,3)}%`, background:b.color, borderRadius:'4px 4px 0 0'}}/>
                    </div>
                    <span style={{fontSize:9, color:'#9ca3af', textAlign:'center'}}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20}}>
            <div style={{fontSize:12, fontWeight:700, color:'#0B2461', marginBottom:12}}>Entregas por Servidor</div>
            {users.map(u=>{
              const ut = tasks.filter(t=>t.assigned_to===u.id);
              const uc = ut.filter(t=>t.status==='Concluído').length;
              const pct = ut.length>0?Math.round((uc/ut.length)*100):0;
              return (
                <div key={u.id} style={{display:'flex', alignItems:'center', gap:12, marginBottom:10}}>
                  <div style={{width:28, height:28, borderRadius:'50%', background:'#0B2461', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0}}>{u.name.charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11, fontWeight:600, color:'#374151'}}>{u.name.split('(')[0].trim()}</div>
                    <div style={{height:6, background:'#f1f5f9', borderRadius:99, overflow:'hidden', marginTop:4}}>
                      <div style={{height:'100%', width:`${pct}%`, background:'#0B2461', borderRadius:99}}/>
                    </div>
                  </div>
                  <span style={{fontSize:11, fontWeight:700, color:'#0B2461', minWidth:40, textAlign:'right'}}>{uc}/{ut.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Equipe */}
      {activeTab==='equipe' && (
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {cargaStats && cargaStats.map(stat=>(
            <div key={stat.id} style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20}}>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:'#0B2461', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700}}>{stat.name.charAt(0)}</div>
                <div>
                  <div style={{fontSize:12, fontWeight:700, color:'#111827'}}>{stat.name.split('(')[0].trim()}</div>
                  <div style={{fontSize:10, color:'#9ca3af'}}>{stat.modality}</div>
                </div>
                <div style={{marginLeft:'auto', textAlign:'right'}}>
                  <div style={{fontSize:16, fontWeight:800, color:'#0B2461'}}>{stat.assignedPoints} pts</div>
                  <div style={{fontSize:10, color:'#9ca3af'}}>atribuídos / {stat.expectedPoints} esperados</div>
                </div>
              </div>
              <div style={{height:8, background:'#f1f5f9', borderRadius:99, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.min(stat.pct,100)}%`, background: stat.pct>=100?'#10B981':'#0B2461', borderRadius:99}}/>
              </div>
            </div>
          ))}
          {/* Performance por servidor */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20}}>
            <div style={{fontSize:12, fontWeight:700, color:'#0B2461', marginBottom:12}}>⏱️ Tempo Executado vs Carga Alocada</div>
            {users.map(u=>{
              const uTasks = tasksWithCalculations.filter(t=>t.assigned_to===u.id&&(t.actual_seconds||0)>0);
              if(!uTasks.length) return null;
              const maxH = Math.max(...uTasks.map(t=>Math.max(t.carga_horaria_mensal,(t.actual_seconds||0)/3600)),1);
              return (
                <div key={u.id} style={{marginBottom:16}}>
                  <div style={{fontSize:11, fontWeight:600, color:'#374151', marginBottom:6}}>{u.name.split('(')[0].trim()}</div>
                  {uTasks.map(t=>{
                    const cH = t.carga_horaria_mensal;
                    const tH = (t.actual_seconds||0)/3600;
                    const diff = tH-cH;
                    return (
                      <div key={t.id} style={{display:'grid', gridTemplateColumns:'1fr 120px 40px', gap:8, alignItems:'center', marginBottom:5}}>
                        <span style={{fontSize:10, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.etapas?.substring(0,40)||t.title}</span>
                        <div style={{display:'flex', flexDirection:'column', gap:2}}>
                          <div style={{height:4, background:'#f1f5f9', borderRadius:99, overflow:'hidden'}}>
                            <div style={{height:'100%', width:`${Math.round((cH/maxH)*100)}%`, background:'#3B82F6', borderRadius:99}}/>
                          </div>
                          <div style={{height:4, background:'#f1f5f9', borderRadius:99, overflow:'hidden'}}>
                            <div style={{height:'100%', width:`${Math.round((tH/maxH)*100)}%`, background:'#10B981', borderRadius:99}}/>
                          </div>
                        </div>
                        <span style={{fontSize:9, fontWeight:700, color:diff>0.5?'#EF4444':'#10B981'}}>{diff>0?'+':''}{diff.toFixed(1)}h</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cronograma */}
      {activeTab==='cronograma' && (
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20}}>
            <div style={{fontSize:12, fontWeight:700, color:'#0B2461', marginBottom:12}}>🌡️ Mapa de Calor — Entregas Ativas por Servidor × Mês</div>
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'collapse', fontSize:11, width:'100%'}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left', padding:'6px 10px', color:'#9ca3af', fontSize:10}}>Servidor</th>
                    {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m=>(
                      <th key={m} style={{padding:'6px 4px', textAlign:'center', color:'#9ca3af', fontSize:10, minWidth:34}}>{m}</th>
                    ))}
                    <th style={{padding:'6px 8px', color:'#9ca3af', fontSize:10}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u=>{
                    const year = todayDate.getFullYear();
                    const monthly = Array.from({length:12},(_,mi)=>{
                      const mS=new Date(year,mi,1), mE=new Date(year,mi+1,0,23,59,59);
                      return tasks.filter(t=>{
                        if(t.assigned_to!==u.id) return false;
                        const s=new Date(t.data_criacao+'T00:00:00'), e=new Date(t.data_fim+'T23:59:59');
                        return s<=mE&&e>=mS;
                      }).length;
                    });
                    const maxM=Math.max(...monthly,1);
                    return (
                      <tr key={u.id}>
                        <td style={{padding:'6px 10px', fontWeight:500, color:'#374151', whiteSpace:'nowrap'}}>{u.name.split(' ')[0]}</td>
                        {monthly.map((v,i)=>(
                          <td key={i} style={{padding:'3px 2px', textAlign:'center'}}>
                            <div style={{width:28, height:22, borderRadius:4, margin:'0 auto', background:v===0?'#f9fafb':`rgba(11,36,97,${v/maxM*0.8+0.1})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:v===0?'#d1d5db':v/maxM>0.5?'#fff':'#0B2461'}}>{v||''}</div>
                          </td>
                        ))}
                        <td style={{padding:'6px 8px', fontWeight:700, color:'#0B2461', textAlign:'center'}}>{monthly.reduce((a,v)=>a+v,0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Processos */}
      {activeTab==='processos' && (
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:20}}>
            <div style={{fontSize:12, fontWeight:700, color:'#0B2461', marginBottom:12}}>Entregas por Processo</div>
            {[...new Set(tasks.map(t=>t.title))].sort().map(proc=>{
              const pt = tasks.filter(t=>t.title===proc);
              const pc = pt.filter(t=>t.status==='Concluído').length;
              return (
                <div key={proc} style={{display:'flex', alignItems:'center', gap:12, marginBottom:8, padding:'8px 12px', background:'#f9fafb', borderRadius:8}}>
                  <div style={{flex:1, fontSize:11, fontWeight:500, color:'#374151'}}>{proc}</div>
                  <span style={{fontSize:10, color:'#6b7280'}}>{pc}/{pt.length}</span>
                  <div style={{width:60, height:4, background:'#e5e7eb', borderRadius:99}}>
                    <div style={{height:'100%', width:`${pt.length>0?Math.round(pc/pt.length*100):0}%`, background:'#10B981', borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanView({ tasks, users, onStatusChange, onAssigneeChange, onReorder, fullWidth = false }) {
  const STATUSES = [
    { key:'Pendente', label:'Pendente', bg:'#FEF2F2', header:'#EF4444', text:'#991B1B' }, { key:'Em andamento', label:'Em Andamento', bg:'#FFFBEB', header:'#F59E0B', text:'#92400E' }, { key:'Concluído', label:'Concluído', bg:'#F0FDF4', header:'#22C55E', text:'#14532D' }, ];
  const fmtDate = d => d ? d.split('-').reverse().map((v,i)=>i===2?v.slice(2):v).join('/') : '—';
  const [dragging, setDragging] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const startDrag = (e, taskId, userId, status) => {
    setDragging({ taskId, userId, status });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', String(taskId));
  };
  const onCellOver = (e, uid, st) => { e.preventDefault(); setDragOver({ uid, st, before: null }); };
  const onCardOver = (e, uid, st, before) => { e.preventDefault(); e.stopPropagation(); setDragOver({ uid, st, before }); };
  const onDrop = (e, uid, st, before=null) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    // Uma única atualização consolidada (status + responsável + ordem).
    // Evita 3 commits concorrentes com estado obsoleto se sobrescrevendo.
    if (onReorder) {
      onReorder(taskId, uid, st, before);
    } else {
      if (task.status !== st) onStatusChange(taskId, st);
      if (task.assigned_to !== uid && onAssigneeChange) onAssigneeChange(taskId, uid);
    }
    setDragging(null); setDragOver(null);
  };
  const onEnd = () => { setDragging(null); setDragOver(null); };

  const grouped = {};
  users.forEach(u => { grouped[u.id] = { 'Pendente':[], 'Em andamento':[], 'Concluído':[] }; });
  tasks.forEach(t => { if (grouped[t.assigned_to]?.[t.status] !== undefined) grouped[t.assigned_to][t.status].push(t); });
  const activeUsers = users.filter(u => tasks.some(t => t.assigned_to === u.id));
  const statusColW = fullWidth ? `${Math.floor(100 / STATUSES.length)}%` : 220;

  return (
    <div style={{overflowX:'auto', userSelect:'none'}}>
      <table style={{borderCollapse:'collapse', tableLayout: fullWidth ? 'fixed' : 'auto', width: fullWidth ? '100%' : `${160 + STATUSES.length * 220}px`}}>
        <thead>
          <tr>
            <th style={{width:150, minWidth:120, padding:'10px 14px', background:'#fff', border:'1px solid #e5e7eb', fontSize:11, color:'#9ca3af', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', textAlign:'left', position:'sticky', left:0, zIndex:3}}>Servidor</th>
            {STATUSES.map(st => (
              <th key={st.key} style={{width: statusColW, padding:'10px 12px', border:'1px solid #e5e7eb', background:st.bg, textAlign:'center'}}>
                <span style={{fontSize:13, fontWeight:800, color:st.header}}>{st.label}</span>
                <div style={{fontSize:10, color:st.text, marginTop:2, opacity:.8}}>{tasks.filter(t=>t.status===st.key).length} entregas</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeUsers.map(u => (
            <tr key={u.id}>
              <td style={{padding:'10px 14px', border:'1px solid #e5e7eb', background:'#fff', verticalAlign:'middle', position:'sticky', left:0, zIndex:2}}>
                <div style={{display:'flex', alignItems:'center', gap:7}}>
                  <div style={{width:28, height:28, borderRadius:'50%', background:'#0B2461', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0}}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{fontSize:12, fontWeight:700, color:'#111827'}}>{u.name.split(' ')[0]}</div>
                    <div style={{fontSize:9, color:'#9ca3af'}}>{tasks.filter(t=>t.assigned_to===u.id).length}</div>
                  </div>
                </div>
              </td>
              {STATUSES.map(st => {
                const cellTasks = grouped[u.id]?.[st.key] || [];
                const isOver = dragOver?.uid === u.id && dragOver?.st === st.key;
                return (
                  <td key={st.key}
                    onDragOver={e => onCellOver(e, u.id, st.key)}
                    onDrop={e => onDrop(e, u.id, st.key, null)}
                    style={{
                      border: isOver && !dragOver?.before ? `2px dashed ${st.header}` : '1px solid #e5e7eb', padding:'6px', verticalAlign:'top', background: isOver && !dragOver?.before ? st.header+'18' : cellTasks.length>0 ? st.bg : '#FAFAFA', minHeight:60, transition:'background .15s', }}>
                    <div style={{display:'flex', flexDirection:'column', gap:5, minHeight:40}}>
                      {cellTasks.length === 0 && !isOver && (
                        <div style={{height:40, display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <span style={{fontSize:10, color:'#d1d5db'}}>—</span>
                        </div>
                      )}
                      {cellTasks.map((t,ci) => {
                        const isDropBefore = dragOver?.uid===u.id && dragOver?.st===st.key && dragOver?.before===t.id;
                        return (
                          <React.Fragment key={t.id}>
                            {isDropBefore && (
                              <div style={{height:3, background:st.header, borderRadius:99, margin:'0 4px'}}/>
                            )}
                            <div
                              draggable
                              onDragStart={e => startDrag(e, t.id, u.id, st.key)}
                              onDragEnd={onEnd}
                              onDragOver={e => onCardOver(e, u.id, st.key, t.id)}
                              onDrop={e => onDrop(e, u.id, st.key, t.id)}
                              style={{
                                background:'#fff', border:`1.5px solid ${st.header}`, borderRadius:9, padding:'7px 9px', cursor:'grab', boxShadow:'0 1px 3px rgba(0,0,0,.07)', opacity: dragging?.taskId === t.id ? .4 : 1, transition:'opacity .15s', }}>
                              <div style={{fontSize:11, fontWeight:700, color:'#111827', lineHeight:1.35, marginBottom:4}}>
                                {t.etapas?.length>65 ? t.etapas.substring(0,65)+'…' : (t.etapas||t.title)}
                              </div>
                              <div style={{fontSize:9, color:'#6b7280', display:'flex', alignItems:'center', gap:3, marginBottom:4}}>
                                <span>📅</span><span>{fmtDate(t.data_criacao)} – {fmtDate(t.data_fim)}</span>
                              </div>
                              <div style={{display:'flex', gap:4}}>
                                <span style={{fontSize:8, padding:'1px 5px', borderRadius:4, background:st.header+'18', color:st.text, fontWeight:700}}>P{t.peso2||30}</span>
                                <span style={{fontSize:8, padding:'1px 5px', borderRadius:4, background:'#f1f5f9', color:'#374151', fontWeight:600}}>Cpx {t.complexidade||1}</span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}

                      {isOver && dragOver?.before===null && (
                        <div style={{height:3, background:st.header, borderRadius:99, margin:'0 4px'}}/>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PetrvsView({ tasks, effectiveUsersForCarga, systemConfig, users, petrvsFilter, setPetrvsFilter, petrvsViewMode, setPetrvsViewMode, isAdmin, commitTasks, handleStatusChange, handlePeso2Change, handleTitleChange, uniqueProcesses, showToast, getMonthsDifference, showNewEntrega, setShowNewEntrega, newEntregaForm, setNewEntregaForm, handleAssigneeChange, handleKanbanReorder, petrvsScrollRef }) {

  const [petrvsCols, setPetrvsCols] = React.useState(['actions','processo','entrega','descricao','complexidade','pesoEntrega','cargaAnual','servidor','pctChd','status']);
  const PETRVS_COLS = petrvsCols;
  const [petrvsDragCol, setPetrvsDragCol] = React.useState(null);
  const handlePetrvsColDragStart = (e, col) => { if(col==='actions') return; setPetrvsDragCol(col); e.dataTransfer.effectAllowed='move'; };
  const handlePetrvsColDrop = (e, targetCol) => {
    e.preventDefault();
    if (!petrvsDragCol || petrvsDragCol===targetCol || petrvsDragCol==='actions') return;
    setPetrvsCols(prev => {
      const arr=[...prev]; const fi=arr.indexOf(petrvsDragCol); const ti=arr.indexOf(targetCol);
      if(fi<0||ti<0) return prev;
      arr.splice(fi,1); arr.splice(ti,0,petrvsDragCol); return arr;
    });
    setPetrvsDragCol(null);
  };

  const calcCargaAnual = (task) => {
    const user = effectiveUsersForCarga.find(u => u.id===task.assigned_to) || {hoursPerMonth:160, hoursPerYear:1920};
    const H_ano = user.hoursPerYear ?? (user.hoursPerMonth * 12);
    const allUserTasks = tasks.filter(t => t.assigned_to===task.assigned_to && t.status!=='Concluído');
    const alpha = systemConfig.alphaParameter??0.5;
    const effW = t => (t.peso2||30)*(t.complexidade||1)*(1/Math.pow(t.has_collaborator?2:1,alpha));
    const sumW = allUserTasks.reduce((a,t)=>a+effW(t),0);
    const myW  = effW(task);
    return sumW>0 ? H_ano*(myW/sumW) : 0;
  };

  const calcPctChd = (task) => {
    const minhaH = calcCargaAnual(task);
    const totalH = tasks
      .filter(t => t.assigned_to===task.assigned_to && t.status!=='Concluído')
      .reduce((a,t)=>a+calcCargaAnual(t),0);
    return totalH > 0 ? Math.round((minhaH/totalH)*100) : 0;
  };

  const anualCols = {
    actions: { label:'', w:52, center:true }, processo: { label:'Processos', w:220 }, entrega: { label:'Entrega', w:240 }, descricao: { label:'Descrição', w:200 }, complexidade: { label:'Complexidade', w:120, center:true }, pesoEntrega: { label:'Peso', w:90, center:true }, cargaAnual: { label:'Carga Anual (H)',w:110, center:true, highlight:true }, servidor: { label:'Responsável', w:150 }, pctChd: { label:'%CHD', w:80, center:true }, status: { label:'Status', w:130 }, };

  const filteredPetrvs = tasks.filter(t => {
    if (petrvsFilter.responsavel!=='all' && t.assigned_to!==parseInt(petrvsFilter.responsavel)) return false;
    if (petrvsFilter.processo!=='all' && t.title!==petrvsFilter.processo) return false;
    if (petrvsFilter.status!=='all' && t.status!==petrvsFilter.status) return false;
    return true;
  });
  const uniqueProc = [...new Set(tasks.map(t=>t.title))].sort();

  const totalAnual = filteredPetrvs.reduce((a,t)=>a+calcCargaAnual(t),0);

  return (<>
    <div style={{display:'flex', flexDirection:'column', gap:14, paddingBottom:60}}>

      <div style={{background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:'12px 16px', fontSize:12, color:'#1e40af', lineHeight:1.7}}>
        <strong>Plano Anual</strong> é a tabela <strong>mestra e fixa</strong> do plano de trabalho anual.
        Cada entrega tem uma <strong>Carga Anual</strong> que representa o total de horas previstas ao longo de todo o período de vigência.
        O <strong>Plano Mensal</strong> é a visão <strong>operacional derivada</strong>: ela distribui mensalmente essa carga considerando urgência, prioridade e período vigente.
      </div>

      <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'12px 16px'}}>
        <select value={petrvsFilter.processo} onChange={e=>setPetrvsFilter(p=>({...p,processo:e.target.value}))}
          style={{fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', background:'#fff', color: petrvsFilter.processo!=='all'?'#0B2461':'#6b7280'}}>
          <option value="all">Todos os Processos</option>
          {uniqueProc.map(p=><option key={p} value={p}>{p.length>35?p.substring(0,35)+'…':p}</option>)}
        </select>
        <select value={petrvsFilter.responsavel} onChange={e=>setPetrvsFilter(p=>({...p,responsavel:e.target.value}))}
          style={{fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', background:'#fff', color: petrvsFilter.responsavel!=='all'?'#0B2461':'#6b7280'}}>
          <option value="all">Todos os Responsáveis</option>
          {effectiveUsersForCarga.map(u=><option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
        </select>
        <select value={petrvsFilter.status} onChange={e=>setPetrvsFilter(p=>({...p,status:e.target.value}))}
          style={{fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', background:'#fff', color: petrvsFilter.status!=='all'?'#0B2461':'#6b7280'}}>
          <option value="all">Qualquer status</option>
          <option>Pendente</option><option>Em andamento</option><option>Concluído</option>
        </select>
        {(petrvsFilter.responsavel!=='all'||petrvsFilter.processo!=='all'||petrvsFilter.status!=='all') && (
          <button onClick={()=>setPetrvsFilter({responsavel:'all',processo:'all',status:'all'})}
            style={{fontSize:11, color:'#EF4444', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:'4px 8px'}}>
            ✕ Limpar
          </button>
        )}
        <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:12, fontSize:12, color:'#374151'}}>
          <span><strong style={{color:'#0B2461'}}>{filteredPetrvs.length}</strong> entregas ·
          Carga total: <strong style={{color:'#0B2461'}}>{totalAnual.toFixed(0)}h</strong></span>
          {isAdmin && (
            <button onClick={()=>{
              const today = new Date().toISOString().split('T')[0];
              const future = new Date(Date.now()+90*864e5).toISOString().split('T')[0];
              setNewEntregaForm({
                title:'', etapas:'', descricao:'', assigned_to: effectiveUsersForCarga[0]?.id||1, has_collaborator:false, status:'Pendente', data_criacao: today, data_fim: future, peso2:30, complexidade:1, pctRealizado:0, observacoes:'', });
              setShowNewEntrega(true);
            }}
              style={{display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, background:'#0B2461', color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer'}}>
              <Plus size={14}/> Nova Entrega
            </button>
          )}
        </div>
      </div>

      <div style={{display:'flex', gap:8}}>
        {[{v:'table',icon:'⊞',label:'Tabela'},{v:'kanban',icon:'⠿',label:'Kanban'}].map(({v,icon,label}) => (
          <button key={v} onClick={()=>setPetrvsViewMode(v)}
            style={{display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, border:'1px solid', cursor:'pointer', transition:'all .15s', background: petrvsViewMode===v?'#0B2461':'#fff', color: petrvsViewMode===v?'#fff':'#6b7280', borderColor: petrvsViewMode===v?'#0B2461':'#e5e7eb', }}>
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {petrvsViewMode==='kanban' ? (
        <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden', padding:16}}>
          <KanbanView
            tasks={filteredPetrvs}
            users={effectiveUsersForCarga}
            onStatusChange={handleStatusChange}
            onAssigneeChange={(id,uid)=>handleAssigneeChange(id,uid)}
            onReorder={handleKanbanReorder}
            fullWidth={true}
          />
        </div>
      ) : (
      <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden'}}>
        <div ref={petrvsScrollRef} style={{overflowX:'auto'}}>
          <table style={{borderCollapse:'collapse', fontSize:12, width:'max-content', minWidth:'100%', tableLayout:'fixed'}}>
            <thead style={{position:'sticky', top:0, zIndex:10, background:'#F8F9FB'}}>
              <tr style={{borderBottom:'1px solid #e5e7eb'}}>
    {PETRVS_COLS.map(col => {
      const def = anualCols[col];
      const isFixed = col==='actions';
      return (
        <th key={col}
          draggable={!isFixed}
          onDragStart={e=>handlePetrvsColDragStart(e,col)}
          onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}}
          onDrop={e=>handlePetrvsColDrop(e,col)}
          style={{
            textAlign: def.center?'center':'left', padding:'10px 12px', fontSize:10, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', color: def.highlight?'#0B2461':'#9ca3af', background: petrvsDragCol===col?'#EFF6FF': def.highlight?'rgba(11,36,97,0.04)':'transparent', width: def.w, minWidth: def.w, cursor: isFixed?'default':'grab', userSelect:'none', }}>
          <span style={{display:'flex', alignItems:'center', gap:4, justifyContent:def.center?'center':'flex-start'}}>
            {!isFixed && <span style={{fontSize:8, color:'#d1d5db', flexShrink:0}}>⠿</span>}
            {def.label}
          </span>
        </th>
      );
    })}
              </tr>
            </thead>
            <tbody style={{userSelect:'none'}}>
              {filteredPetrvs.map((task, idx) => {
    const cargaAnual  = calcCargaAnual(task);
    const pctChd      = calcPctChd(task);
    const pct         = task.pctRealizado||0;
    const pctColor    = pct>=100?'#10B981':pct>=50?'#3B82F6':pct>0?'#F59E0B':'#9ca3af';
    const chdColor    = pctChd>=30?'#7C3AED':pctChd>=15?'#3B82F6':'#94A3B8';
    const CPX_STYLES  = {1:{bg:'#D1FAE5',color:'#065F46'},2:{bg:'#FEF3C7',color:'#92400E'},3:{bg:'#FEE2E2',color:'#991B1B'}};

    const today      = new Date(); today.setHours(0,0,0,0);
    const taskStart  = new Date(task.data_criacao+'T00:00:00');
    const taskEnd    = new Date(task.data_fim+'T00:00:00');
    const totalDays  = Math.max((taskEnd-taskStart)/864e5, 1);
    const elapsed    = Math.max(0, Math.min((today-taskStart)/864e5, totalDays));
    const pctProj    = task.status==='Concluído' ? 100 : Math.round((elapsed/totalDays)*100);
    const projDiff   = pct - pctProj; // positive = ahead, negative = behind
    const projColor  = pctProj===0?'#9ca3af': projDiff>=0?'#10B981':projDiff>=-10?'#F59E0B':'#EF4444';
    return (
      <tr key={task.id} style={{borderBottom:'1px solid #f1f5f9', background:idx%2===0?'#fff':'#FAFBFC'}}>
        {PETRVS_COLS.map(col => {
          const def = anualCols[col] || {};
          switch(col) {

            case 'actions': return (
              <td key={col} style={{padding:'6px 6px', textAlign:'center', width:def.w}}>
                <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'center',opacity:0}}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1}
                  onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                  {isAdmin && (
                    <button onClick={()=>{
                      const clone={...task,id:Date.now(),status:'Pendente',is_running:false,actual_seconds:0,data_conclusao:null,pctRealizado:0,subentregas:[]};
                      const i2=tasks.findIndex(t=>t.id===task.id);
                      const arr=[...tasks]; arr.splice(i2+1,0,clone);
                      commitTasks(arr); showToast('Entrega duplicada!');
                    }} style={{background:'none',border:'none',cursor:'pointer',color:'#3B82F6',padding:2}} title="Duplicar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/></svg>
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={()=>{commitTasks(tasks.filter(t=>t.id!==task.id));showToast('Entrega removida.');}}
                      style={{background:'none',border:'none',cursor:'pointer',color:'#EF4444',padding:2}} title="Remover">
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              </td>
            );

            case 'processo': return (
              <td key={col} style={{padding:'6px 8px', width:def.w}}>
                <ProcessoCell task={task} uniqueProcesses={uniqueProcesses} isAdmin={isAdmin} handleTitleChange={handleTitleChange}/>
              </td>
            );

            case 'entrega': return (
              <td key={col} style={{padding:'6px 8px', width:def.w}}>
                <textarea value={task.etapas||''} rows={2}
                  onChange={e=>commitTasks(tasks.map(t=>t.id!==task.id?t:{...t,etapas:e.target.value}))}
                  placeholder="Descreva a entrega…"
                  style={{width:'100%',fontSize:11,border:'1px solid #e5e7eb',borderRadius:6,padding:'4px 6px',resize:'vertical',background:'transparent',minHeight:40,fontFamily:'inherit',color:'#374151'}}/>
              </td>
            );

            case 'descricao': return (
              <td key={col} style={{padding:'6px 8px', width:def.w}}>
                <textarea value={task.descricao||''} rows={2}
                  onChange={e=>commitTasks(tasks.map(t=>t.id!==task.id?t:{...t,descricao:e.target.value}))}
                  placeholder="Descrição…"
                  style={{width:'100%',fontSize:11,border:'1px dashed #e5e7eb',borderRadius:6,padding:'4px 6px',resize:'vertical',background:(task.descricao||'').length>0?'#F0F9FF':'transparent',minHeight:40,fontFamily:'inherit',color:'#374151'}}/>
              </td>
            );

            case 'complexidade': return (
              <td key={col} style={{padding:'6px 8px', textAlign:'center', width:def.w}}>
                <select value={task.complexidade||1}
                  onChange={e=>commitTasks(tasks.map(t=>t.id!==task.id?t:{...t,complexidade:parseInt(e.target.value)}))}
                  style={{fontSize:11,fontWeight:700,borderRadius:8,padding:'4px 6px',border:'1px solid',cursor:'pointer', background:CPX_STYLES[task.complexidade||1].bg,color:CPX_STYLES[task.complexidade||1].color, borderColor:CPX_STYLES[task.complexidade||1].bg}}>
                  <option value={1}>1 — Baixa</option>
                  <option value={2}>2 — Média</option>
                  <option value={3}>3 — Alta</option>
                </select>
              </td>
            );

            case 'pesoEntrega': return (
              <td key={col} style={{padding:'6px 8px', textAlign:'center', width:def.w}}>
                <select value={task.peso2||30} onChange={e=>handlePeso2Change(task.id,parseInt(e.target.value))}
                  style={{fontSize:11,fontWeight:700,borderRadius:8,padding:'4px 6px',border:'1px solid',cursor:'pointer', background:(task.peso2||30)===60?'#EDE9FE':(task.peso2||30)===30?'#EFF6FF':'#F1F5F9', color:(task.peso2||30)===60?'#6D28D9':(task.peso2||30)===30?'#1D4ED8':'#64748B', borderColor:(task.peso2||30)===60?'#C4B5FD':(task.peso2||30)===30?'#93C5FD':'#CBD5E1'}}>
                  <option value={10}>10 pts</option>
                  <option value={30}>30 pts</option>
                  <option value={60}>60 pts</option>
                </select>
              </td>
            );

            case 'cargaAnual': return (
              <td key={col} style={{padding:'10px 8px',textAlign:'center',background:'rgba(11,36,97,0.03)',width:def.w}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                  <span style={{fontSize:15,fontWeight:800,color:'#0B2461',fontFamily:'monospace'}}>{cargaAnual.toFixed(1)}</span>
                  <span style={{fontSize:9,color:'#9ca3af'}}>h/ano</span>
                </div>
              </td>
            );

            case 'servidor': return (
              <td key={col} style={{padding:'6px 8px', width:def.w}}>
                <select value={task.assigned_to||''}
                  onChange={e=>commitTasks(tasks.map(t=>t.id!==task.id?t:{...t,assigned_to:parseInt(e.target.value)}))}
                  style={{width:'100%',fontSize:11,fontWeight:600,border:'1px solid #e5e7eb',borderRadius:8,padding:'5px 8px',background:'#fff',color:'#0B2461',cursor:'pointer'}}>
                  {effectiveUsersForCarga.map(u=><option key={u.id} value={u.id}>{u.name.split('(')[0].trim()}</option>)}
                </select>
              </td>
            );

            case 'pctChd': return (
              <td key={col} style={{padding:'10px 8px',textAlign:'center',width:def.w}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                  <span style={{fontSize:13,fontWeight:800,color:chdColor,fontFamily:'monospace'}}>{pctChd}%</span>
                  <div style={{width:36,height:3,background:'#e5e7eb',borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min(pctChd,100)}%`,background:chdColor,borderRadius:99}}/>
                  </div>
                </div>
              </td>
            );

            case 'status': return (
              <td key={col} style={{padding:'8px 8px', width:def.w}}>
                <select value={task.status} onChange={e=>handleStatusChange(task.id,e.target.value)}
                  style={{width:'100%',fontSize:11,fontWeight:600,borderRadius:8,padding:'4px 8px',border:'1px solid',cursor:'pointer', background:task.status==='Concluído'?'#ECFDF5':task.status==='Em andamento'?'#EFF6FF':'#F9FAFB', color:task.status==='Concluído'?'#065F46':task.status==='Em andamento'?'#1e40af':'#374151', borderColor:task.status==='Concluído'?'#6EE7B7':task.status==='Em andamento'?'#93C5FD':'#e5e7eb'}}>
                  <option>Pendente</option>
                  <option>Em andamento</option>
                  <option>Concluído</option>
                </select>
              </td>
            );

            default: return <td key={col}/>;
          }
        })}
      </tr>
    );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:'10px 16px', background:'#F8F9FB', borderTop:'1px solid #e5e7eb', fontSize:11, color:'#6b7280', display:'flex', justifyContent:'space-between'}}>
          <span>Carga Anual = Horas/mês × proporção por peso × duração em meses</span>
          <span><strong>{filteredPetrvs.length}</strong> entregas · <strong style={{color:'#0B2461'}}>{totalAnual.toFixed(0)}h</strong> totais no plano</span>
        </div>
      </div>
      )}
  </div>

      {showNewEntrega && newEntregaForm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}
          onClick={()=>setShowNewEntrega(false)}>
          <div style={{background:'#fff', borderRadius:16, width:'100%', maxWidth:640, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 60px rgba(0,0,0,.25)'}}
            onClick={e=>e.stopPropagation()}>

            <div style={{background:'#0B2461', borderRadius:'16px 16px 0 0', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:15, fontWeight:700, color:'#fff'}}>Nova Entrega</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2}}>Plano Anual</div>
              </div>
              <button onClick={()=>setShowNewEntrega(false)} style={{background:'none', border:'none', color:'rgba(255,255,255,.6)', cursor:'pointer', fontSize:20, lineHeight:1}}>×</button>
            </div>

            <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:14}}>
              {[
                {label:'Processo', key:'title', type:'text', placeholder:'Nome do processo…', full:true}, {label:'Entrega (descrição)', key:'etapas', type:'textarea', placeholder:'Descreva a entrega…', full:true}, {label:'Descrição', key:'descricao', type:'textarea', placeholder:'Detalhes dos trabalhos…', full:true}, ].map(({label,key,type,placeholder,full})=>(
                <div key={key}>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>{label}</label>
                  {type==='textarea'
                    ? <textarea value={newEntregaForm[key]||''} onChange={e=>setNewEntregaForm(f=>({...f,[key]:e.target.value}))} rows={2} placeholder={placeholder}
                        style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', resize:'vertical', fontFamily:'inherit', minHeight:48}}/> : <input type="text" value={newEntregaForm[key]||''} onChange={e=>setNewEntregaForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
                        style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px'}}/>
                  }
                </div>
              ))}

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Responsável</label>
                  <select value={newEntregaForm.assigned_to} onChange={e=>setNewEntregaForm(f=>({...f,assigned_to:parseInt(e.target.value)}))}
                    style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', background:'#fff'}}>
                    {effectiveUsersForCarga.map(u=><option key={u.id} value={u.id}>{u.name.split('(')[0].trim()}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Status</label>
                  <select value={newEntregaForm.status} onChange={e=>setNewEntregaForm(f=>({...f,status:e.target.value}))}
                    style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', background:'#fff'}}>
                    <option>Pendente</option><option>Em andamento</option><option>Concluído</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Peso Entrega</label>
                  <select value={newEntregaForm.peso2} onChange={e=>setNewEntregaForm(f=>({...f,peso2:parseInt(e.target.value)}))}
                    style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', background:'#fff'}}>
                    <option value={10}>10 pts</option><option value={30}>30 pts</option><option value={60}>60 pts</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Complexidade</label>
                  <select value={newEntregaForm.complexidade} onChange={e=>setNewEntregaForm(f=>({...f,complexidade:parseInt(e.target.value)}))}
                    style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', background:'#fff'}}>
                    <option value={1}>1 — Baixa</option><option value={2}>2 — Média</option><option value={3}>3 — Alta</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Data Início</label>
                  <input type="date" value={newEntregaForm.data_criacao} onChange={e=>setNewEntregaForm(f=>({...f,data_criacao:e.target.value}))}
                    style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px'}}/>
                </div>
                <div>
                  <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Data Fim</label>
                  <input type="date" value={newEntregaForm.data_fim} onChange={e=>setNewEntregaForm(f=>({...f,data_fim:e.target.value}))}
                    style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px'}}/>
                </div>
              </div>

              <div>
                <label style={{fontSize:11, fontWeight:600, color:'#6b7280', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em'}}>Observações</label>
                <textarea value={newEntregaForm.observacoes||''} onChange={e=>setNewEntregaForm(f=>({...f,observacoes:e.target.value}))} rows={2}
                  placeholder="Observações iniciais…"
                  style={{width:'100%', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', resize:'vertical', fontFamily:'inherit'}}/>
              </div>

              <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:12, color:'#374151'}}>
                <input type="checkbox" checked={newEntregaForm.has_collaborator||false}
                  onChange={e=>setNewEntregaForm(f=>({...f,has_collaborator:e.target.checked}))}
                  style={{width:14, height:14}}/>
                Possui colaborador (reduz carga individual)
              </label>
            </div>

            <div style={{padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:10}}>
              <button onClick={()=>setShowNewEntrega(false)}
                style={{padding:'9px 20px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', color:'#6b7280'}}>
                Cancelar
              </button>
              <button onClick={()=>{
                if (!newEntregaForm.title.trim()) { showToast('Preencha o nome do Processo.'); return; }
                if (!newEntregaForm.etapas.trim()) { showToast('Preencha a Entrega.'); return; }
                const task = {
                  id:Date.now(), ...newEntregaForm, pesoProcesso: newEntregaForm.peso2||30, is_running:false, actual_seconds:0, data_conclusao:null, subentregas:[], pctRealizado:0, };
                commitTasks([...tasks, task]);
                showToast('Entrega adicionada ao Plano Anual e Individual!');
                setShowNewEntrega(false);
              }}
                style={{padding:'9px 20px', borderRadius:8, border:'none', background:'#0B2461', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>
                + Adicionar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
  </>
  );
}

export default function App() {
  const [users, setUsers]          = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser]    = useState(INITIAL_USERS[0]);
  const [currentView, setCurrentView]    = useState('tabela_dinamica');
  const [selectedMonth, setSelectedMonth]  = useState('all');
  const [systemConfig, setSystemConfig]   = useState(DEFAULT_CONFIG);
  const [tempConfig, setTempConfig]     = useState(DEFAULT_CONFIG);
  const [tempUsers, setTempUsers]      = useState(INITIAL_USERS);
  const [tasks, setTasks]          = useState(INITIAL_TASKS);
  const [history, setHistory]        = useState([{ timestamp: Date.now(), data: INITIAL_TASKS }]);
  const [historyIndex, setHistoryIndex]   = useState(0);
  const [draggedRowId, setDraggedRowId]   = useState(null);
  const [draggedColId, setDraggedColId]   = useState(null);
  const [columnOrder, setColumnOrder]    = useState(DEFAULT_COLUMN_ORDER);
  const [showTaskForm, setShowTaskForm]   = useState(false);
  const [taskToDelete, setTaskToDelete]   = useState(null);
  const [toastMessage, setToastMessage]   = useState(null);
  const [showBackupModal,setShowBackupModal]= useState(false);
  const [backupToRestore,setBackupToRestore]= useState(null);
  const [backups, setBackups]        = useState([]);
  const [tableFilters, setTableFilters]   = useState({ projeto:'all', etapa:'', mes:'all', responsavel:'all', status:'all', colaborador:'all' });
  const [colLabelOverrides, setColLabelOverrides] = useState({});
  const [editingColHeader, setEditingColHeader]  = useState(null);
  const [editingColValue, setEditingColValue]   = useState('');
  const [importModal, setImportModal]       = useState(null); // { headers, rows, mapping, mode }
  const [sidebarCollapsed, setSidebarCollapsed]  = useState(false);
  const [pinnedCards, setPinnedCards]       = useState(false);
  const [showFormula, setShowFormula]       = useState(false);
  const [colWidths, setColWidths]         = useState({ processo: 420, entrega: 360, observacoes: 200 });
  const [subEntregasExpanded, setSubEntregasExpanded] = useState({});
  const [petrvsFilter, setPetrvsFilter]      = useState({ responsavel:'all', processo:'all', status:'all' });
  const [tableViewMode, setTableViewMode]     = useState('table');   // 'table' | 'kanban'
  const [petrvsViewMode, setPetrvsViewMode]    = useState('table');   // 'table' | 'kanban'
  const [showNewEntrega, setShowNewEntrega]    = useState(false);
  const [newEntregaForm, setNewEntregaForm]    = useState(null);
  const resizingRef = useRef(null); // { colId, startX, startW }
  const importFileRef  = useRef(null);
  const tableScrollRef = useRef(null);
  const bottomBarRef   = useRef(null);
  const petrvsScrollRef = useRef(null);
  const petrvsBarRef    = useRef(null);
  const [petrvsScrollWidth, setPetrvsScrollWidth] = useState(1800);
  const [newTask, setNewTask] = useState({
    title: INITIAL_ENTREGAS_MACRO[0]?.entrega || '', etapas: '', assigned_to: 1, data_criacao: new Date().toISOString().split('T')[0], data_fim: new Date().toISOString().split('T')[0], peso2: 30, pesoProcesso: 30, complexidade: 1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' });

  useEffect(() => { setTempUsers(users); }, [users]);
  useEffect(() => {
    const t = setInterval(() => {
      setTasks(prev => prev.map(tk => tk.is_running ? { ...tk, actual_seconds: (tk.actual_seconds || 0) + 1 } : tk));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [tableScrollWidth, setTableScrollWidth] = useState(1800);

  useEffect(() => {
    const table = tableScrollRef.current;
    const bar   = bottomBarRef.current;
    if (!table || !bar) return;
    const onTable = () => { bar.scrollLeft = table.scrollLeft; };
    const onBar   = () => { table.scrollLeft = bar.scrollLeft; };
    table.addEventListener('scroll', onTable);
    bar.addEventListener('scroll', onBar);

    setTableScrollWidth(table.scrollWidth);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => setTableScrollWidth(table.scrollWidth)) : null;
    if(ro) ro.observe(table);
    return () => { table.removeEventListener('scroll', onTable); bar.removeEventListener('scroll', onBar); if(ro) ro.disconnect(); };
  });

  useEffect(() => {
    const table = petrvsScrollRef.current;
    const bar   = petrvsBarRef.current;
    if (!table || !bar) return;
    const onTable = () => { bar.scrollLeft = table.scrollLeft; };
    const onBar   = () => { table.scrollLeft = bar.scrollLeft; };
    table.addEventListener('scroll', onTable);
    bar.addEventListener('scroll', onBar);
    setPetrvsScrollWidth(table.scrollWidth);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => setPetrvsScrollWidth(table.scrollWidth)) : null;
    if(ro) ro.observe(table);
    return () => { table.removeEventListener('scroll', onTable); bar.removeEventListener('scroll', onBar); if(ro) ro.disconnect(); };
  });

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500); };

  // --- Persistência: carrega dados do banco (Neon) ao montar ---
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError]     = useState(null);
  const hydratedRef = useRef(false);
  useEffect(() => {
    let cancel = false;
    loadInitialData()
      .then(({ tasks, users, config }) => {
        if (cancel) return;
        if (Array.isArray(tasks) && tasks.length) {
          setTasks(tasks);
          setHistory([{ timestamp: Date.now(), data: tasks }]);
          setHistoryIndex(0);
        }
        if (Array.isArray(users) && users.length) {
          setUsers(users);
          setTempUsers(users);
          setCurrentUser(users[0]);
        }
        if (config) { setSystemConfig(config); setTempConfig(config); }
        // Só libera gravações DEPOIS de aplicar os dados do banco no estado.
        // Um pequeno atraso garante que os setState acima já foram processados,
        // evitando que uma regravação use os dados-semente antigos (race condition).
        setTimeout(() => { hydratedRef.current = true; }, 0);
        registerFlushOnUnload();
        setDbLoading(false);
      })
      .catch((err) => {
        if (cancel) return;
        console.error('[SGEP] Falha ao carregar do banco:', err);
        setDbError('Não foi possível conectar ao banco de dados. Exibindo dados locais.');
        hydratedRef.current = true; // permite gravar depois que o usuário editar
        setDbLoading(false);
      });
    return () => { cancel = true; };
  }, []);

  const getModalityFactor = (modality) => {
    if (!modality) return systemConfig.factorPresencial;
    const m = modality.toLowerCase();
    if (m.includes('parcial'))  return systemConfig.factorParcial;
    if (m.includes('integral')) return systemConfig.factorIntegral;
    return systemConfig.factorPresencial;
  };

  const [todayDate, setTodayDate] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  });
  useEffect(() => {
    const msToMidnight = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()+1).getTime() - now.getTime();
    };
    let t = setTimeout(function tick() {
      const d = new Date(); d.setHours(0,0,0,0);
      setTodayDate(d);
      t = setTimeout(tick, msToMidnight());
    }, msToMidnight());
    return () => clearTimeout(t);
  }, []);

  const refMonthForCarga = useMemo(() => {
    if (tableFilters.mes !== 'all') return tableFilters.mes;
    return `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,'0')}`;
  }, [tableFilters.mes, todayDate]);

  const uniqueProcesses = useMemo(() => Array.from(new Set(tasks.map(t => t.title))).filter(Boolean).sort(), [tasks]);

  const commitTasks = (newTasks, deletedId) => {
    setTasks(newTasks);
    const h = history.slice(0, historyIndex + 1);
    h.push({ timestamp: Date.now(), data: newTasks });
    setHistory(h);
    setHistoryIndex(h.length - 1);
    // Grava no banco (Neon) — só depois da carga inicial, para não
    // sobrescrever o banco com os dados-semente durante a hidratação.
    if (hydratedRef.current) saveTasks(newTasks, () => showToast('Erro ao salvar no banco.'));
  };
  const handleUndo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex-1); setTasks(history[historyIndex-1].data); } };
  const handleRedo = () => { if (historyIndex < history.length-1) { setHistoryIndex(historyIndex+1); setTasks(history[historyIndex+1].data); } };

  const handleCreateBackup   = () => { const b = { id: Date.now(), label: `Imagem — ${new Date().toLocaleString('pt-BR')}`, data: tasks }; setBackups([b, ...backups]); showToast("Imagem salva!"); };
  const confirmRestoreBackup = () => { if (backupToRestore) { commitTasks(backupToRestore.data); setBackupToRestore(null); setShowBackupModal(false); showToast("Sistema restaurado!"); } };

  const handleStatusChange   = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, status:v, is_running:(v==='Concluído'||v==='Pendente')?false:t.is_running, data_conclusao:v==='Concluído'?(t.data_conclusao||new Date().toISOString()):null }));
  const toggleTimer          = (id) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, is_running:!t.is_running, status:!t.is_running?'Em andamento':t.status }));
  const toggleCollaborator   = (id) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, has_collaborator:!t.has_collaborator }));
  const handleTitleChange    = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, title:v }));
  const handleAssigneeChange = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, assigned_to:v }));

  const handleKanbanReorder = (taskId, targetUserId, targetStatus, insertBeforeId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Aplica a mudança de coluna (status) e de linha (responsável), com os
    // mesmos efeitos colaterais do handleStatusChange (conclusão, cronômetro).
    const applyMove = (t) => {
      if (t.id !== taskId) return t;
      const updated = { ...t };
      if (targetStatus != null && targetStatus !== '') {
        updated.status = targetStatus;
        if (targetStatus === 'Concluído') {
          updated.is_running = false;
          updated.data_conclusao = t.data_conclusao || new Date().toISOString();
        } else if (targetStatus === 'Pendente') {
          updated.is_running = false;
          updated.data_conclusao = null;
        } else {
          updated.data_conclusao = null;
        }
      }
      if (targetUserId != null) updated.assigned_to = targetUserId;
      return updated;
    };

    // Se soltou sobre outro card, reordena; senão, apenas move (coluna vazia).
    if (insertBeforeId) {
      const others = tasks.filter(t => t.id !== taskId);
      const insertIdx = others.findIndex(t => t.id === insertBeforeId);
      if (insertIdx >= 0) {
        const moved = applyMove(task);
        const newTasks = [...others];
        newTasks.splice(insertIdx, 0, moved);
        commitTasks(newTasks);
        return;
      }
    }
    // Sem card de referência (coluna/linha vazia): mantém a ordem, só aplica o move.
    commitTasks(tasks.map(applyMove));
  };
  const handleDateChange     = (id, f, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, [f]:v }));
  const handlePeso2Change    = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, peso2:v }));
  const handlePesoProcessoChange = (id, v) => {
    const processo = tasks.find(t => t.id===id)?.title;
    commitTasks(tasks.map(t => t.title===processo ? { ...t, pesoProcesso:v } : t));
  };
  const handleComplexidadeChange = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, complexidade:v }));
  const handleEtapaTextChange    = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{ ...t, etapas:v }));

  const toggleSubEntregas = (id) => setSubEntregasExpanded(p => ({...p, [id]: !p[id]}));

  const addSubEntrega = (taskId) => {
    commitTasks(tasks.map(t => t.id!==taskId ? t : {
      ...t, subentregas: [...(t.subentregas||[]), { id: Date.now(), label: 'Nova subentrega', status: 'Pendente' }], }));
    setSubEntregasExpanded(p => ({...p, [taskId]: true}));
  };

  const updateSubEntrega = (taskId, subId, changes) => {
    commitTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const subs = (t.subentregas||[]).map(s => s.id===subId ? {...s,...changes} : s);
      const done = subs.filter(s => s.status==='Concluído').length;
      const pct  = subs.length > 0 ? Math.round((done/subs.length)*100) : t.pctRealizado;
      return {...t, subentregas: subs, pctRealizado: pct};
    }));
  };

  const deleteSubEntrega = (taskId, subId) => {
    commitTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const subs = (t.subentregas||[]).filter(s => s.id!==subId);
      const done = subs.filter(s => s.status==='Concluído').length;
      const pct  = subs.length > 0 ? Math.round((done/subs.length)*100) : 0;
      return {...t, subentregas: subs, pctRealizado: pct};
    }));
  };

  const handlePctRealizadoChange = (id, v) => {
    const n = Math.min(100, Math.max(0, parseInt(v)||0));
    commitTasks(tasks.map(t => t.id!==id?t:{...t, pctRealizado: n}));
  };
  const handleObservacoesChange = (id, v) => commitTasks(tasks.map(t => t.id!==id?t:{...t, observacoes:v}));

  const handleAddTask = (e) => {
    e.preventDefault();
    const task = { id: Date.now(), title:newTask.title, etapas:newTask.etapas, assigned_to:newTask.assigned_to, has_collaborator:false, status:'Pendente', data_criacao:newTask.data_criacao, data_fim:newTask.data_fim, is_running:false, actual_seconds:0, data_conclusao:null, peso2:newTask.peso2||30, pesoProcesso:newTask.pesoProcesso||30, complexidade:newTask.complexidade||1 };
    commitTasks([task, ...tasks]);
    if (!systemConfig.entregasMacro.find(m => m.entrega===task.title)) {
      const nm = { id:Date.now()+1, processos:'A Definir', entrega:task.title, peso:30, prazo:'', area:'DIGEP' };
      const upd = [nm, ...systemConfig.entregasMacro];
      setSystemConfig(p => ({ ...p, entregasMacro:upd }));
      setTempConfig(p => ({ ...p, entregasMacro:upd }));
    }
    setShowTaskForm(false);
    setNewTask({ title:'', etapas:'', assigned_to:1, data_criacao:new Date().toISOString().split('T')[0], data_fim:new Date().toISOString().split('T')[0], peso2:30, pesoProcesso:30, complexidade:1, pctRealizado: 0, subentregas: [] , observacoes: '', descricao: '' });
    showToast("Atividade cadastrada!");
  };
  const confirmDelete = () => { if (taskToDelete) { commitTasks(tasks.filter(t => t.id!==taskToDelete)); setTaskToDelete(null); showToast("Atividade removida!"); } };

  const handleSpreadsheetUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type:'array', cellDates:false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
        if (raw.length < 2) { showToast('Planilha sem dados suficientes.'); return; }

        const headers = raw[0].map(h => String(h||'').trim()).filter(Boolean);
        const dataRows = raw.slice(1).filter(r => r.some(c => c!==''));

        const mapping = {};
        headers.forEach(h => { mapping[h] = autoMatchField(h, colLabelOverrides); });

        setImportModal({ headers, rows: dataRows, mapping, mode: 'append' });
      } catch(err) { showToast('Erro ao ler planilha. Verifique o formato.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const executeImport = () => {
    if (!importModal) return;
    const { headers, rows, mapping, mode } = importModal;

    const processoPesoMap = {};

    const newTasks = rows.map((row, i) => {
      const get = (field) => {
        const hIdx = headers.findIndex(h => mapping[h] === field);
        return hIdx >= 0 ? row[hIdx] : undefined;
      };

      const title   = String(get('title') || '').trim() || 'Processo sem nome';
      const etapas  = String(get('etapas') || '').trim();
      const pp      = parseWeight(get('pesoProcesso'));
      const p2      = parseWeight(get('peso2'));
      const cx      = parseComplexidade(get('complexidade'));
      const dc      = parseExcelDate(get('data_criacao')) || new Date().toISOString().split('T')[0];
      const df      = parseExcelDate(get('data_fim'))     || new Date().toISOString().split('T')[0];
      const resp    = parseUserField(get('assigned_to'), users);
      const st      = parseStatus(get('status'));
      const colab   = parseBool(get('has_collaborator'));

      if (!processoPesoMap[title] || pp > processoPesoMap[title]) processoPesoMap[title] = pp;

      return {
        id: Date.now() + i, title, etapas, pesoProcesso: pp, peso2: p2, complexidade: cx, data_criacao: dc, data_fim: df, assigned_to: resp, status: st, has_collaborator: colab, is_running: false, actual_seconds: 0, data_conclusao: null, };
    });

    const normalised = newTasks.map(t => ({ ...t, pesoProcesso: processoPesoMap[t.title] || t.pesoProcesso }));

    if (mode === 'replace') {
      commitTasks(normalised);
    } else {

      const maxId = Math.max(0, ...tasks.map(t=>t.id));
      const shifted = normalised.map((t,i)=>({...t, id: maxId+i+1}));
      commitTasks([...tasks, ...shifted]);
    }

    setImportModal(null);
    showToast(`${normalised.length} ${mode==='replace'?'entregas importadas':'entregas adicionadas'}!`);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const nc = { alphaParameter:parseFloat(tempConfig.alphaParameter), factorPresencial:parseFloat(tempConfig.factorPresencial), factorParcial:parseFloat(tempConfig.factorParcial), factorIntegral:parseFloat(tempConfig.factorIntegral), entregasMacro:[...tempConfig.entregasMacro], logoUrl:tempConfig.logoUrl };

    const resolvedUsers = tempUsers.map(u => ({
      ...u, hoursPerYear: u.hoursPerYear  ?? (u.hoursPerMonth * 12), hoursPerMonth: u.hoursPerYear  ? Math.round(u.hoursPerYear / 12) : u.hoursPerMonth, }));
    setSystemConfig(nc);
    setUsers(resolvedUsers);
    const upd = resolvedUsers.find(u => u.id===currentUser.id);
    if (upd) { setCurrentUser(upd); if (upd.role!=='admin' && currentView==='configuracoes') setCurrentView('tabela_dinamica'); }
    // Grava config e servidores no banco (Neon).
    if (hydratedRef.current) {
      saveConfig(nc, () => showToast('Erro ao salvar configuração no banco.'));
      saveUsers(resolvedUsers, () => showToast('Erro ao salvar servidores no banco.'));
    }
    showToast("Configurações salvas!");
  };

  const handleAddEntregaMacro    = () => setTempConfig(p => ({ ...p, entregasMacro:[{ id:Date.now(), processos:'', entrega:'Nova Entrega', peso:30, prazo:'', area:'' }, ...p.entregasMacro] }));
  const handleRemoveEntregaMacro = (id) => setTempConfig(p => ({ ...p, entregasMacro:p.entregasMacro.filter(m => m.id!==id) }));
  const handleEntregaMacroChange = (id, f, v) => setTempConfig(p => ({ ...p, entregasMacro:p.entregasMacro.map(m => m.id===id?{...m,[f]:v}:m) }));
  const handleAddTempUser = () => setTempUsers([...tempUsers, { id:Date.now(), name:'Novo Servidor', email:'servidor@inpi.gov.br', role:'user', modality:'Presencial', hoursPerMonth:160, hoursPerYear:1920, monitoramentos:0 }]);
  const handleRemoveTempUser     = (id) => tempUsers.length>1 && setTempUsers(tempUsers.filter(u => u.id!==id));
  const handleTempUserChange     = (id, f, v) => setTempUsers(tempUsers.map(u => u.id===id?{...u,[f]:v}:u));
  const handleLogoUpload = (e) => { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ setSystemConfig(p=>({...p,logoUrl:ev.target.result})); setTempConfig(p=>({...p,logoUrl:ev.target.result})); showToast("Logotipo atualizado!"); }; r.readAsDataURL(f); };
  const handleFileUpload = (e) => {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{
      try {
        const csv=ev.target.result, sep=csv.includes(';')?';':',';
        const rows=csv.split('\n').map(r=>r.trim()).filter(Boolean);
        if(rows.length<2) throw new Error();
        const ne=[];
        for(let i=1;i<rows.length;i++){const row=rows[i].split(sep);if(row.length>=2)ne.push({id:Date.now()+i,processos:row[0]?.replace(/["']/g,'')||'',entrega:row[1]?.replace(/["']/g,'')||'',peso:parseInt(row[2])||30,prazo:row[3]?.replace(/["']/g,'')||'',area:row[4]?.replace(/["']/g,'')||''});}
        if(ne.length>0){setTempConfig(p=>({...p,entregasMacro:ne}));showToast(`${ne.length} entregas importadas!`);}
      } catch { showToast("Erro ao processar CSV."); }
    };
    r.readAsText(f,'UTF-8');
  };

  const handleRowDragStart = (e, id) => { setDraggedRowId(id); e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('type','row'); };
  const handleRowDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect='move'; };
  const handleRowDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedRowId===targetId || !draggedRowId) return;
    const arr=[...tasks], fi=arr.findIndex(t=>t.id===draggedRowId), ti=arr.findIndex(t=>t.id===targetId);
    if(fi===-1||ti===-1) return;
    const [item]=arr.splice(fi,1); arr.splice(ti,0,item);
    commitTasks(arr); setDraggedRowId(null);
  };

  const handleColDragStart = (e, colId) => { e.stopPropagation(); setDraggedColId(colId); e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('type','col'); };
  const handleColDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect='move'; };
  const handleColDrop = (e, targetColId) => {
    e.preventDefault();
    if (!draggedColId || draggedColId===targetColId || draggedColId==='actions') return;
    const arr=[...columnOrder];
    const fi=arr.indexOf(draggedColId), ti=arr.indexOf(targetColId);
    if(fi===-1||ti===-1) return;
    arr.splice(fi,1); arr.splice(ti,0,draggedColId);
    setColumnOrder(arr); setDraggedColId(null);
  };

  const startColResize = (e, colId) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { colId, startX: e.clientX, startW: colWidths[colId] || (colId==='processo' ? 420 : 360) };
    const onMove = (ev) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newW  = Math.max(120, resizingRef.current.startW + delta);
      setColWidths(prev => ({ ...prev, [resizingRef.current.colId]: newW }));
    };
    const onUp = () => { resizingRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const effectiveUsersForCarga = useMemo(() => {

    const hasChanges =
      tempUsers.length !== users.length ||
      tempUsers.some(tu => {
        const saved = users.find(u => u.id === tu.id);
        if (!saved) return true;
        return (
          saved.hoursPerMonth  !== tu.hoursPerMonth  ||
          saved.hoursPerYear   !== tu.hoursPerYear   ||
          saved.modality      !== tu.modality      ||
          saved.monitoramentos!== tu.monitoramentos||
          saved.name          !== tu.name          ||
          saved.email         !== tu.email         ||
          saved.role          !== tu.role
        );
      });
    return hasChanges ? tempUsers : users;
  }, [tempUsers, users]);

  const tasksWithCalculations = useMemo(() => {
    const today = todayDate;

    const [refY, refMidx] = refMonthForCarga.split('-').map(Number);
    const monthStart = new Date(refY, refMidx - 1, 1);
    const monthEnd   = new Date(refY, refMidx, 0, 23, 59, 59);
    const alpha      = systemConfig.alphaParameter ?? 0.5;

    const getU = (t) => {
      if (t.status === 'Concluído') return 0;
      const end  = new Date(t.data_fim + 'T00:00:00');
      const dias = Math.round((end - today) / 864e5);
      const refMonthEnd = monthEnd;
      if (dias <= 0)                      return 4; // Vencida
      if (end <= refMonthEnd)             return 3; // Vence este mês (ref)
      if (dias <= 30)                     return 2; // Vence em até 1 mês
      return 1;                                     // Vence acima de 1 mês
    };

    const urgLabel = (u, dias) => ({
      4: 'Vencida', 3: `${dias}d — Vence este mês`, 2: `${dias}d — Próx. 30 dias`, 1: `${dias}d — Acima de 30 dias`, 0: 'Concluída', }[u] || '—');
    const getScore = (t) => (t.peso2||30) * (t.complexidade||1) * 2 + getU(t);

    const effW = (t) =>
      getScore(t) * (t.complexidade||1)
      * (1 / Math.pow(t.has_collaborator ? 2 : 1, alpha));

    const activeByUser = {};
    tasks.forEach(t => {
      const start   = new Date(t.data_criacao + 'T00:00:00');
      const end     = new Date(t.data_fim     + 'T23:59:59');
      const overdue = end < today && t.status !== 'Concluído';
      if ((start <= monthEnd && end >= monthStart) || overdue) {
        if (!activeByUser[t.assigned_to]) activeByUser[t.assigned_to] = [];
        activeByUser[t.assigned_to].push(t);
      }
    });

    return tasks.map(task => {
      const user = effectiveUsersForCarga.find(u => u.id===task.assigned_to)
        || users.find(u => u.id===task.assigned_to)
        || { id:task.assigned_to, name:'Excluído', modality:'Presencial', hoursPerMonth:160, hoursPerYear:1920 };

      const H_total        = Math.round((user.hoursPerYear ?? (user.hoursPerMonth * 12)) / 12);
      const duration_months = getMonthsDifference(task.data_criacao, task.data_fim);

      const taskStart   = new Date(task.data_criacao + 'T00:00:00');
      const taskEndTS   = new Date(task.data_fim     + 'T23:59:59');
      const taskOverdue = taskEndTS < today && task.status !== 'Concluído';
      const isActiveInRef = (taskStart <= monthEnd && taskEndTS >= monthStart) || taskOverdue;

      const userActiveTasks = activeByUser[task.assigned_to] || [];
      const sumEffW = userActiveTasks.reduce((a, t) => a + effW(t), 0);
      const myEffW  = effW(task);
      const H_final = isActiveInRef && sumEffW > 0 ? H_total * (myEffW / sumEffW) : 0;

      const taskEndDate   = new Date(task.data_fim + 'T00:00:00');
      const diasRestantes = Math.round((taskEndDate - today) / 864e5);
      const U             = getU(task);
      const score         = getScore(task);

      let farol = { label:'Longe' };
      if (task.status==='Concluído') farol = { label:'Concluído' };
      else if (diasRestantes < 0)  farol = { label:'Atrasado' };
      else if (diasRestantes <= 7) farol = { label:'Perto' };

      let duracaoHoras = null;
      if (task.status==='Concluído' && task.data_conclusao && task.data_criacao)
        duracaoHoras = Math.abs(
          new Date(task.data_conclusao) - new Date(task.data_criacao+'T00:00:00')
        ) / 36e5;

      const macro        = systemConfig.entregasMacro.find(m => m.entrega===task.title);
      const isMelhoria   = macro?.processos === 'Projetos de Melhoria';
      const basePeso2     = (isMelhoria && task.has_collaborator && task.peso2===60) ? 30 : task.peso2;
      const effectivePeso2 = basePeso2 * (task.complexidade||1);

      return {
        ...task, user, duration_months, carga_horaria_mensal: H_final, carga_horaria_total: H_final * duration_months, priorityScore: score, urgencyU: U, isActiveInRef, duracao_calculada: duracaoHoras, farol, effectivePeso2, isMelhoria, calcData: {
          H_total, refMonth: refMonthForCarga, peso_entrega: task.peso2||30, complexidade_task: task.complexidade||1, fator_colab: (1/Math.pow(task.has_collaborator?2:1,alpha)).toFixed(2), urgencia_U: U, urgencia_label: urgLabel(U, diasRestantes), score_formula: `(${task.peso2||30}×${task.complexidade||1}×2) + ${U} = ${score}`, peso_efetivo: myEffW.toFixed(2), soma_pesos_efetivos: sumEffW.toFixed(2), n_entregas_ativas: userActiveTasks.length, alpha, }, };
    });
  }, [tasks, users, effectiveUsersForCarga, systemConfig, refMonthForCarga, todayDate]);

  const availableMonths = useMemo(() => {
    const s=new Set();
    tasks.forEach(t=>{if(t.data_fim){const d=new Date(t.data_fim+'T12:00:00');s.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);}});
    return Array.from(s).sort();
  }, [tasks]);

  const filteredTasksForTable = useMemo(() => tasksWithCalculations.filter(task => {
    if(tableFilters.projeto!=='all'&&task.title!==tableFilters.projeto) return false;
    if(tableFilters.etapa&&!task.etapas.toLowerCase().includes(tableFilters.etapa.toLowerCase())) return false;
    if(tableFilters.mes!=='all'&&task.data_fim.substring(0,7)!==tableFilters.mes) return false;
    if(tableFilters.responsavel!=='all'&&task.assigned_to.toString()!==tableFilters.responsavel) return false;
    if(tableFilters.status!=='all'&&task.status!==tableFilters.status) return false;
    if(tableFilters.colaborador==='com_colab'&&!task.has_collaborator) return false;
    if(tableFilters.colaborador==='sem_colab'&&task.has_collaborator) return false;
    return true;
  }), [tasksWithCalculations, tableFilters]);

  const clearFilters = () => setTableFilters({ projeto:'all', etapa:'', mes:'all', responsavel:'all', status:'all', colaborador:'all' });
  const hasActiveFilters = Object.values(tableFilters).some(v => v!=='all'&&v!=='');

  const cargaStats = useMemo(() => {
    const filtered = tasksWithCalculations.filter(t => {
      if(selectedMonth==='all') return true;
      const d=new Date(t.data_fim+'T12:00:00');
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===selectedMonth;
    });

    const presencialFactor = systemConfig.factorPresencial;
    const presencialUsers = effectiveUsersForCarga.filter(u => getModalityFactor(u.modality)===presencialFactor);
    let baselinePoints=0;
    if(presencialUsers.length>0){
      const pTasks=filtered.filter(t=>presencialUsers.map(u=>u.id).includes(t.assigned_to));
      const pPts=pTasks.reduce((acc,t)=>acc+(t.effectivePeso2||30),0);
      baselinePoints=pPts/presencialUsers.length;
    }

    return effectiveUsersForCarga.map(user => {
      const userTasks=filtered.filter(t=>t.assigned_to===user.id);
      const taskPoints=userTasks.reduce((acc,t)=>acc+(t.effectivePeso2||30),0);
      const assignedPoints=taskPoints;

      const userFactor=getModalityFactor(user.modality);
      const expectedPoints=Math.round(baselinePoints*userFactor);
      const diff=assignedPoints-expectedPoints;
      const pct=expectedPoints>0?Math.round((assignedPoints/expectedPoints)*100):0;

      let suggestion='', statusColor='', ringColor='#0B2461';
      if(userFactor===presencialFactor){
        suggestion='Linha de Base (100%) — referência do setor.';
        statusColor='bg-blue-50 text-blue-800 border-blue-200'; ringColor='#0B2461';
      } else if(diff===0){
        suggestion=`Carga alinhada (+${Math.round((userFactor-1)*100)}%).`;
        statusColor='bg-emerald-50 text-emerald-800 border-emerald-200'; ringColor='#10B981';
      } else if(diff<0){
        suggestion=`Faltam ${Math.abs(diff)} pts para a meta da modalidade.`;
        statusColor='bg-red-50 text-red-800 border-red-200'; ringColor='#EF4444';
      } else {
        suggestion=`Excesso de ${diff} pts além da meta.`;
        statusColor='bg-amber-50 text-amber-800 border-amber-200'; ringColor='#F59E0B';
      }

      return { ...user, assignedPoints, taskPoints, monPoints:0, expectedPoints, diff, suggestion, statusColor, userFactor, pct, ringColor };
    });
  }, [tasksWithCalculations, effectiveUsersForCarga, selectedMonth, systemConfig]);

  const annualStats = useMemo(() => {
    const year = new Date().getFullYear();
    const alpha = systemConfig.alphaParameter ?? 0.5;
    const effW = t => (t.peso2||30) * (t.complexidade||1) * (1/Math.pow(t.has_collaborator?2:1, alpha));
    return effectiveUsersForCarga.map(user => {
      let horasAlocAno = 0;
      let monthsActive = 0;
      for (let m = 1; m <= 12; m++) {
        const mStart = new Date(year, m-1, 1);
        const mEnd   = new Date(year, m, 0, 23, 59, 59);
        const active = tasks.filter(t => {
          if (t.assigned_to !== user.id) return false;
          const s = new Date(t.data_criacao+'T00:00:00');
          const e = new Date(t.data_fim+'T23:59:59');
          return s <= mEnd && e >= mStart;
        });
        if (active.length > 0) { horasAlocAno += (user.hoursPerYear ?? user.hoursPerMonth*12) / 12; monthsActive++; }
      }
      return { userId: user.id, horasAlocAno: Math.round(horasAlocAno), horasDispAno: user.hoursPerYear ?? (user.hoursPerMonth * 12), monthsActive };
    });
  }, [tasks, effectiveUsersForCarga, systemConfig.alphaParameter]);

  const COLUMN_DEFS = {
    actions: { label: '', width: 52, fixed: true }, farol: { label: 'Farol', minWidth: 90 }, processo: { label: 'Processo', minWidth: 120, resizable: true }, complexidade: { label: 'Complexidade', width: 140, center: true }, entrega: { label: 'Entrega', minWidth: 120, resizable: true }, pesoEntrega: { label: 'Peso', width: 100, center: true, highlight: 'emerald' }, cronograma: { label: 'Cronograma', minWidth: 200 }, carga: { label: 'Carga Mensal', minWidth: 120, center: true, highlight: 'blue' }, pctCarga: { label: '% Carga Mensal', width: 96, center: true }, pctRealizado: { label: '% Realizado', width: 110, center: true }, observacoes: { label: 'Observações', minWidth: 180, resizable: true }, responsavel: { label: 'Responsável', minWidth: 110 }, colabs: { label: 'Colabs', width: 64, center: true }, tempo: { label: 'Tempo Real', minWidth: 100, center: true }, conclusao: { label: 'Conclusão', minWidth: 120 }, status: { label: 'Status', minWidth: 160 }, };

  const inputCls  = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2461]/20 focus:border-[#0B2461] bg-white transition-all";
  const selectCls = `${inputCls} cursor-pointer`;

  const isAdmin = currentUser.role === 'admin';

  const renderCell = (colId, task) => {
    const isMyTask = task.assigned_to===currentUser.id || currentUser.role==='admin';

    switch(colId) {
      case 'actions': return (
          <td key={colId} className="py-2.5 px-2 text-center">
            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAdmin && <span className="cursor-grab text-gray-300 hover:text-gray-500"><GripVertical size={14}/></span>}
              <button
                onClick={() => addSubEntrega(task.id)}
                title="Adicionar subentrega"
                className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1 rounded transition-colors font-bold text-sm leading-none">
                +
              </button>
            </div>

            {(task.subentregas||[]).length > 0 && (
              <button
                onClick={() => toggleSubEntregas(task.id)}
                className="mt-1 text-[9px] text-gray-400 hover:text-[#0B2461] transition-colors flex items-center gap-0.5 mx-auto"
                title={subEntregasExpanded[task.id] ? 'Recolher' : 'Expandir subentregas'}>
                <span className="transition-transform" style={{display:'inline-block', transform: subEntregasExpanded[task.id] ? 'rotate(90deg)' : 'rotate(0deg)'}}>▶</span>
                {(task.subentregas||[]).length}
              </button>
            )}
          </td>
        );
      case 'farol': return <td key={colId} className="py-2.5 px-3"><FarolBadge label={task.farol.label}/></td>;
      case 'processo': return (
          <td key={colId} className="py-2.5 px-3 align-top">
            <ProcessoCell
              task={task}
              uniqueProcesses={uniqueProcesses}
              isAdmin={isAdmin}
              handleTitleChange={handleTitleChange}
            />
          </td>
        );
      case 'pesoProcesso': return (
          <td key={colId} className="py-2.5 px-3 text-center" style={{background:'rgba(11,36,97,0.03)'}}>
            <select
              value={task.pesoProcesso||30}
              onChange={e=>handlePesoProcessoChange(task.id,parseInt(e.target.value))}
              disabled={!isAdmin}
              className={`text-[11px] font-black rounded-lg px-2 py-1.5 border focus:outline-none transition-colors bg-blue-50 text-blue-700 border-blue-200 ${isAdmin?'cursor-pointer':'cursor-default opacity-70'}`}
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </td>
        );
      case 'complexidade': return (
          <td key={colId} className="py-2.5 px-3 text-center">
            <div className="flex items-center justify-center gap-1">
              {[1,2,3].map(n=>{
                const active=(task.complexidade||1)===n;
                const cls = active
                  ? n===1?'bg-emerald-100 text-emerald-700 border-2 border-emerald-400 shadow-sm' :n===2?'bg-amber-100 text-amber-700 border-2 border-amber-400 shadow-sm' :'bg-red-100 text-red-700 border-2 border-red-400 shadow-sm' :'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200';
                const canEdit=isMyTask&&task.status!=='Concluído';
                return (
                  <button key={n} onClick={()=>canEdit&&handleComplexidadeChange(task.id,n)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${cls} ${canEdit?'cursor-pointer':'cursor-default'}`}
                    title={n===1?'Baixa':n===2?'Média':'Alta'}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">
              {(task.complexidade||1)===1?'Baixa':(task.complexidade||1)===2?'Média':'Alta'}
            </div>
          </td>
        );
      case 'entrega': return (
          <td key={colId} className="py-2.5 px-3 align-top">
            {isMyTask&&task.status!=='Concluído'
              ? <textarea
                  value={task.etapas}
                  onChange={e=>handleEtapaTextChange(task.id,e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#0B2461] resize-y bg-white"
                  style={{minHeight:48}}
                /> : <span className="text-xs text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{task.etapas}</span>
            }
          </td>
        );
      case 'pesoEntrega': return (
          <td key={colId} className="py-2.5 px-3 text-center" style={{background:'rgba(16,185,129,0.03)'}}>
            <div className="flex flex-col items-center gap-1">
              <Peso2Select value={task.peso2||30} onChange={v=>handlePeso2Change(task.id,v)} disabled={!isMyTask||task.status==='Concluído'}/>
              {task.effectivePeso2 !== (task.peso2||30) * (task.complexidade||1) && (
                <span className="text-[9px] text-amber-600 font-bold">Efetivo: {task.effectivePeso2}pts</span>
              )}
            </div>
          </td>
        );
      case 'cronograma': return (
          <td key={colId} className="py-2.5 px-3">
            <div className="flex items-center gap-1.5 text-[11px]">
              <input type="date" value={task.data_criacao} onChange={e=>handleDateChange(task.id,'data_criacao',e.target.value)} disabled={!isAdmin}
                className={`border rounded px-1.5 py-1 text-[11px] ${isAdmin?'border-gray-200 bg-white':'border-transparent bg-transparent text-gray-600'}`}/>
              <ChevronRight size={10} className="flex-shrink-0 text-gray-300"/>
              <input type="date" value={task.data_fim} onChange={e=>handleDateChange(task.id,'data_fim',e.target.value)} disabled={!isAdmin}
                className={`border rounded px-1.5 py-1 text-[11px] font-semibold ${isAdmin?'border-gray-200 bg-white':'border-transparent bg-transparent text-gray-700'}`}/>
            </div>
          </td>
        );
      case 'carga': return (
          <td key={colId} className="py-2.5 px-3 text-center" style={{background:'rgba(11,36,97,0.025)'}}>
            <div className="relative inline-block group/tip">
              <div className="cursor-help">
                <p className="font-sora font-bold text-[#0B2461] text-base leading-none">
                  {task.carga_horaria_mensal.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}
                  <span className="text-[10px] font-normal text-gray-400 ml-0.5">h/mês</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Total: {task.carga_horaria_total.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}h</p>
              </div>
              <div className="absolute bottom-full right-0 mb-3 hidden group-hover/tip:block z-50 pointer-events-none" style={{width:300}}>
                {(() => {
                  const hDia = task.carga_horaria_mensal / 22;
                  const minDia = Math.floor(hDia * 60);
                  const hh = Math.floor(minDia / 60);
                  const mm = minDia % 60;
                  const barW = Math.min(Math.round((hDia / 8) * 100), 100);
                  const barColor = hDia > 6 ? '#EF4444' : hDia > 3 ? '#F59E0B' : '#10B981';
                  return (
                    <div className="rounded-xl mb-2 overflow-hidden shadow-2xl border border-white/10"
                      style={{background:'linear-gradient(135deg,#0f2454,#1a3a7a)'}}>

                      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/10">
                        <span className="text-[9px] font-sora font-bold tracking-widest uppercase text-blue-300/60">Carga por Dia Útil</span>
                        <span className="text-[9px] text-blue-300/50 font-mono">22 dias úteis/mês</span>
                      </div>

                      <div className="px-4 py-3 flex items-end gap-2">
                        <span className="font-sora font-black leading-none" style={{fontSize:36, color:'#AAFF00'}}>
                          {hDia.toFixed(2)}
                        </span>
                        <div className="mb-1">
                          <span className="text-white/80 text-sm font-semibold">h/dia</span>
                          <p className="text-blue-300/60 text-[10px] font-mono">= {hh}h {mm}min por dia útil</p>
                        </div>
                      </div>

                      <div className="px-4 pb-1">
                        <div className="flex justify-between text-[9px] text-blue-300/50 mb-1">
                          <span>0h</span><span>Jornada de 8h</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
                          <div className="h-full rounded-full transition-all"
                            style={{width:`${barW}%`, background: barColor, boxShadow:`0 0 8px ${barColor}88`}}/>
                        </div>
                        <p className="text-right text-[9px] mt-1 font-semibold" style={{color:barColor}}>
                          {barW}% da jornada diária
                        </p>
                      </div>

                      <div className="mx-4 border-t border-white/10 mt-1 mb-2"/>

                      <div className="px-4 pb-3 space-y-1">
                        <p className="text-[8px] font-sora font-bold tracking-widest uppercase text-blue-300/40 mb-2">Auditoria</p>
                        {[
                          ['Ref.', task.calcData?.refMonth], ['H Total/Mês', `${task.calcData?.H_total}h`], ['U (Urgência)', `${task.calcData?.urgencia_U} — ${task.calcData?.urgencia_label}`], ['Score', task.calcData?.score_formula], ['Cpx / F.Colab', `×${task.calcData?.complexidade_task} / ×${task.calcData?.fator_colab}`], ['Peso Ef. / Σ', `${task.calcData?.peso_efetivo} / ${task.calcData?.soma_pesos_efetivos}`], ['Entregas ativas', `${task.calcData?.n_entregas_ativas}`], ].map(([k,v])=>(
                          <div key={k} className="flex justify-between font-mono text-[10px]">
                            <span className="text-blue-300/50">{k}</span>
                            <span className="text-white/80 font-semibold">{v}</span>
                          </div>
                        ))}
                        <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                          <span className="font-sora font-bold text-white text-[11px]">Carga Mensal</span>
                          <span className="font-sora font-black text-sm" style={{color:'#AAFF00'}}>{task.carga_horaria_mensal.toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent ml-auto mr-6"
                  style={{borderTopColor:'#1a3a7a'}}/>
              </div>
            </div>
          </td>
        );
      case 'pctCarga': {
        const H = task.calcData?.H_total || 0;
        const pct = H > 0 ? (task.carga_horaria_mensal / H) * 100 : 0;
        const pctRound = Math.round(pct * 10) / 10;
        const color = pct > 60 ? '#EF4444' : pct > 35 ? '#F59E0B' : pct > 0 ? '#10B981' : '#94A3B8';
        const bg    = pct > 60 ? 'rgba(239,68,68,0.08)' : pct > 35 ? 'rgba(245,158,11,0.08)' : pct > 0 ? 'rgba(16,185,129,0.08)' : 'transparent';
        return (
          <td key={colId} className="py-2.5 px-2 text-center" style={{background: bg}}>
            {pct > 0 ? (
              <div className="flex flex-col items-center gap-1">
                <span className="font-sora font-black text-sm leading-none" style={{color}}>
                  {pctRound.toLocaleString('pt-BR', {minimumFractionDigits:1, maximumFractionDigits:1})}%
                </span>
                <div className="w-12 h-1 rounded-full overflow-hidden" style={{background:'rgba(0,0,0,0.07)'}}>
                  <div className="h-full rounded-full" style={{width:`${Math.min(pct,100)}%`, background:color}}/>
                </div>
              </div>
            ) : (
              <span className="text-gray-300 text-xs">—</span>
            )}
          </td>
        );
      }  // end case 'pctCarga'

      case 'pctRealizado': {
        const subs    = task.subentregas || [];
        const hasSubs = subs.length > 0;
        const pct     = task.pctRealizado ?? 0;
        const color   = pct >= 100 ? '#10B981' : pct >= 50 ? '#3B82F6' : pct > 0 ? '#F59E0B' : '#94A3B8';
        const canEdit = !hasSubs && (isMyTask || isAdmin) && task.status !== 'Concluído';
        return (
          <td key={colId} className="py-2.5 px-2 text-center">
            <div className="flex flex-col items-center gap-1">
              {canEdit ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="0" max="100" step="5"
                    value={pct}
                    onChange={e => handlePctRealizadoChange(task.id, e.target.value)}
                    className="w-14 text-center border border-gray-200 rounded text-xs font-bold py-0.5 focus:outline-none focus:border-[#0B2461]"
                    style={{color}}
                  />
                  <span className="text-[10px] text-gray-400">%</span>
                </div>
              ) : (
                <span className="font-sora font-black text-sm leading-none" style={{color}}>
                  {pct}<span className="text-[10px] font-normal">%</span>
                </span>
              )}
              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`, background:color}}/>
              </div>
              {hasSubs && (
                <span className="text-[9px] text-gray-400">{subs.filter(s=>s.status==='Concluído').length}/{subs.length}</span>
              )}
            </div>
          </td>
        );
      }  // end case 'pctRealizado'

      case 'observacoes': return (
          <td key={colId} className="py-2.5 px-3 align-top">
            <textarea
              value={task.observacoes||''}
              onChange={e => handleObservacoesChange(task.id, e.target.value)}
              disabled={!isMyTask && !isAdmin}
              rows={2}
              placeholder={isMyTask||isAdmin ? 'Adicionar observação…' : '—'}
              className={`w-full text-xs text-gray-600 bg-transparent border border-dashed rounded px-2 py-1 resize-none focus:outline-none transition-colors leading-relaxed
                ${(task.observacoes||'').length>0 ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 hover:border-gray-300'}
                ${(!isMyTask&&!isAdmin)?'cursor-default opacity-70':''}`}
              style={{minHeight:48}}
            />
          </td>
        );

      case 'responsavel': return (
          <td key={colId} className="py-2.5 px-3">
            <select
              value={task.assigned_to}
              onChange={e=>handleAssigneeChange(task.id,parseInt(e.target.value))}
              disabled={!isAdmin}
              className={`w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none bg-white ${isAdmin?'cursor-pointer':'cursor-default opacity-80'}`}>
              {users.map(u=><option key={u.id} value={u.id}>{u.name.split('(')[0].trim()}</option>)}
            </select>
          </td>
        );
      case 'colabs': return (
          <td key={colId} className="py-2.5 px-3 text-center">
            <input type="checkbox" checked={task.has_collaborator} onChange={()=>isMyTask&&toggleCollaborator(task.id)} disabled={!isMyTask||task.status==='Concluído'}
              className="w-4 h-4 rounded border-gray-300 accent-[#0B2461] cursor-pointer disabled:opacity-50"/>
          </td>
        );
      case 'tempo': return (
          <td key={colId} className="py-2.5 px-3 text-center font-mono">
            {task.is_running
              ? <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md text-[11px] font-bold animate-pulse">{formatTime(task.actual_seconds)}</span> : task.actual_seconds>0
                ? <span className="text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md text-[11px]">{formatTime(task.actual_seconds)}</span> : task.status==='Concluído'&&task.duracao_calculada!==null
                  ? <span className="text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md text-[11px]">{Math.round(task.duracao_calculada)}h</span> : <span className="text-gray-300 text-xs">—</span>}
          </td>
        );
      case 'conclusao': return (
          <td key={colId} className="py-2.5 px-3 text-[11px] text-gray-500">
            {task.data_conclusao?new Date(task.data_conclusao).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):<span className="text-gray-300">—</span>}
          </td>
        );
      case 'status': return (
          <td key={colId} className="py-2.5 px-3">
            <div className="flex items-center gap-2">
              {isMyTask&&task.status!=='Concluído'&&(
                <button onClick={()=>toggleTimer(task.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-colors ${task.is_running?'bg-amber-500 text-white hover:bg-amber-600':'bg-white border border-gray-200 text-gray-500 hover:border-[#0B2461] hover:text-[#0B2461]'}`}>
                  {task.is_running?<Pause size={11} fill="currentColor"/>:<Play size={11} fill="currentColor"/>}
                </button>
              )}
              <select value={task.status} onChange={e=>isMyTask&&handleStatusChange(task.id,e.target.value)} disabled={!isMyTask}
                className={`flex-1 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none transition-colors ${task.status==='Concluído'?'bg-blue-50 text-blue-700 border-blue-200':task.status==='Em andamento'?'bg-amber-50 text-amber-700 border-amber-200':'bg-white text-gray-600 border-gray-200'} ${!isMyTask?'cursor-default opacity-75':'cursor-pointer'}`}>
                <option>Pendente</option>
                <option>Em andamento</option>
                <option>Concluído</option>
              </select>
            </div>
          </td>
        );
      default: return <td key={colId}/>;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        * { font-family:'DM Sans',-apple-system,sans-serif; box-sizing:border-box; }
        .font-sora { font-family:'Sora',sans-serif; } ::-webkit-scrollbar { width:5px; height:5px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; } ::-webkit-scrollbar-thumb:hover { background:#0B2461; }
        .sidebar-grd { background: linear-gradient(180deg, #0e2d78 0%, #0c2567 25%, #0b2060 55%, #091a52 80%, #071545 100%); }
        .sidebar-grd::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 0%, rgba(63,105,200,0.18) 0%, transparent 65%), radial-gradient(ellipse at 80% 100%, rgba(10,30,90,0.35) 0%, transparent 60%);pointer-events:none; }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(-8px) scale(.98)} to{opacity:1;transform:none} }
        .toast-anim { animation:slideUp .3s cubic-bezier(.22,.68,0,1.2) both; }
        .modal-anim { animation:fadeIn .2s ease-out both; }
        .tr-hover:hover { background:#F8FAFF; }
        .tr-running { background:linear-gradient(to right,#FFF7ED,#FFFBF5); }
        .col-dragging { opacity:0.5; }
        .col-drag-over { background:#EEF2FF !important; }
        th[draggable=true] { cursor:grab; }
        th[draggable=true]:active { cursor:grabbing; }
      `}</style>

      <div className="flex" style={{minHeight:'100vh',background:'#F1F3F7'}}>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[100] toast-anim">
            <div className="flex items-center gap-2.5 bg-[#0B2461] text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0"/>{toastMessage}
            </div>
          </div>
        )}
        <aside className={`sidebar-grd relative flex flex-col shadow-2xl z-20 shrink-0 sticky top-0 h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-[56px]' : 'w-60'}`}>

          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center z-30 hover:bg-gray-50 transition-colors"
            title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`}>
              <path d="M6.5 2L3.5 5l3 3" stroke="#0B2461" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={`pt-5 pb-4 relative group flex-shrink-0 ${sidebarCollapsed ? 'px-2' : 'px-5'}`}>
            {sidebarCollapsed
              ? <div className="flex justify-center"><img src="" alt="avatar"/></div> : <>
                  <div className="flex items-center justify-center mb-1">
                    <img src={systemConfig.logoUrl||"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Logo_do_INPI.svg/1200px-Logo_do_INPI.svg.png"} alt="INPI" className="object-contain w-full" style={{height:40, filter:"brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.3))", padding:"0 8px"}}/>
                  </div>
                  <p className="text-center text-[9px] font-sora font-semibold tracking-[0.12em] text-blue-300/50 uppercase mt-2">CGPE · Coordenação-Geral de Planejamento e Gestão Estratégica</p>
                  {currentUser?.role==='admin' && (
                    <label className="absolute top-5 right-4 bg-white/10 p-1.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                      <Upload size={12} className="text-white"/>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
                    </label>
                  )}
                </>
            }
          </div>
          <div className="mx-4 border-t border-white/10 mb-4"/>

          <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {!sidebarCollapsed && <p className="px-3 mb-2 text-[9px] font-sora font-semibold tracking-[0.15em] text-blue-300/40 uppercase">Principal</p>}
            {[
              { icon:<Table2 size={16}/>, label:'Plano Mensal', view:'tabela_dinamica' }, { icon:<Layers size={16}/>, label:'Plano Anual', view:'petrvs' }, { icon:<Activity size={16}/>, label:'Dashboards', view:'dashboards' }, ].map(({icon,label,view}) => (
              <button key={view} onClick={() => setCurrentView(view)}
                title={sidebarCollapsed ? label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${sidebarCollapsed ? 'justify-center' : ''} ${currentView===view ? 'bg-white/20 text-white shadow-sm' : 'text-blue-200/70 hover:bg-white/10 hover:text-white'}`}>
                <span className="flex-shrink-0">{icon}</span>
                {!sidebarCollapsed && <span className="truncate text-[13px]">{label}</span>}
              </button>
            ))}
            {currentUser?.role==='admin' && (
              <>
                {!sidebarCollapsed && <p className="px-3 pt-4 mb-2 text-[9px] font-sora font-semibold tracking-[0.15em] text-blue-300/40 uppercase">Administração</p>}
                {sidebarCollapsed && <div className="border-t border-white/10 my-2 mx-1"/>}
                <button onClick={() => setCurrentView('configuracoes')}
                  title={sidebarCollapsed ? 'Configurações Globais' : ''}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${sidebarCollapsed ? 'justify-center' : ''} ${currentView==='configuracoes' ? 'bg-white/20 text-white shadow-sm' : 'text-blue-200/70 hover:bg-white/10 hover:text-white'}`}>
                  <span className="flex-shrink-0"><Settings size={16}/></span>
                  {!sidebarCollapsed && <span className="truncate text-[13px]">Configurações Globais</span>}
                </button>
              </>
            )}
          </nav>

          <div className={`pb-4 pt-2 flex-shrink-0 border-t border-white/10 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
            {sidebarCollapsed
              ? <div className="flex justify-center mt-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-sora font-bold text-white text-xs" title={currentUser?.name}>
                    {currentUser?.name?.charAt(0)}
                  </div>
                </div> : <>
                  <p className="text-[9px] font-sora font-semibold tracking-[0.12em] text-blue-300/40 uppercase mb-2 px-1 mt-3">Simular sessão</p>
                  <select value={currentUser?.id}
                    onChange={e=>{const u=users.find(u=>u.id===parseInt(e.target.value));setCurrentUser(u);if(u.role!=='admin'&&currentView==='configuracoes')setCurrentView('tabela_dinamica');}}
                    className="w-full bg-white/10 text-white border border-white/15 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer">
                    {users.map(u=><option key={u.id} value={u.id} className="text-gray-900 bg-white">{u.name.split(' ')[0]} ({u.role==='admin'?'Admin':'Usuário'})</option>)}
                  </select>
                </>
            }
          </div>
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden" style={{background:'#F1F3F7'}}>
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200/80 px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="font-sora font-bold text-[#0B2461] text-base">
              {currentView==='tabela_dinamica' && 'Plano Mensal — Plano de Entregas DIGEP 2026'}
              {currentView==='petrvs'          && 'Plano Anual'}
              {currentView==='dashboard'       && 'Carga de Trabalho'}
              {currentView==='configuracoes'   && 'Configurações Globais'}
              {currentView==='prioridades'     && 'Plano de Prioridades — Score Estratégico'}
              {currentView==='dashboards'      && 'Dashboards — Inteligência de Desempenho'}
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right mr-1">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 justify-end">
                  {currentUser.role==='admin'?<Shield size={12} className="text-[#0B2461]"/>:<UserIcon size={12} className="text-gray-400"/>}
                  {currentUser.name.split('(')[0].trim()}
                </p>
                <p className="text-[11px] text-gray-400">{currentUser.hoursPerMonth}h/mês · <span className="font-medium">{currentUser.modality}</span></p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#0B2461] flex items-center justify-center font-sora font-bold text-white text-sm shadow-sm">{currentUser.name.charAt(0)}</div>
            </div>
          </header>

          <div className="p-6 pb-10">
            {currentView==='tabela_dinamica' && (
              <div className="flex flex-col gap-4">

                <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button onClick={handleUndo} disabled={historyIndex===0} className={`p-1.5 rounded transition-colors ${historyIndex===0?'text-gray-300 cursor-not-allowed':'text-gray-500 hover:bg-gray-100'}`}><Undo2 size={15}/></button>
                    <button onClick={handleRedo} disabled={historyIndex===history.length-1} className={`p-1.5 rounded transition-colors ${historyIndex===history.length-1?'text-gray-300 cursor-not-allowed':'text-gray-500 hover:bg-gray-100'}`}><Redo2 size={15}/></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-2 rounded-lg shadow-sm">
                      <Columns size={12} className="text-gray-400"/> Arraste os cabeçalhos para reordenar colunas
                    </div>
                    {currentUser.role==='admin' && (
                      <>
                        <input ref={importFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleSpreadsheetUpload}/>
                        <button
                          onClick={()=>importFileRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-sm transition-colors">
                          <Upload size={14}/> Importar Planilha
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowFormula(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm transition-all bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      title="Explicação da fórmula de carga horária">
                      <Info size={14} className="text-[#0B2461]"/> Fórmula
                    </button>
                    <button onClick={handleCreateBackup} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"><Save size={14} className="text-[#0B2461]"/> Salvar Imagem</button>
                    <button onClick={()=>setShowBackupModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
                      <HistoryIcon size={14}/> Backups {backups.length>0&&<span className="bg-[#0B2461] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{backups.length}</span>}
                    </button>
                    <button
                      onClick={() => setPinnedCards(p => !p)}
                      title={pinnedCards ? 'Descongelar cabeçalho de servidores' : 'Congelar cabeçalho de servidores'}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm transition-all ${pinnedCards ? 'bg-[#0B2461] text-white border-[#0B2461]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                      </svg>
                      {pinnedCards ? 'Fixado' : 'Fixar cards'}
                    </button>
                  </div>
                </div>
                <div className={`flex flex-col gap-3 flex-shrink-0 ${pinnedCards ? 'sticky top-0 z-10 bg-[#F1F3F7] py-2 -mx-6 px-6 shadow-sm' : ''}`}>
                {(() => {
                  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                  const [refY, refMidx] = refMonthForCarga.split('-').map(Number);
                  const refLabel = new Date(refY, refMidx-1, 1).toLocaleString('pt-BR',{month:'long',year:'numeric'});
                  const todayActive = tasks.filter(t =>
                    t.assigned_to === currentUser.id &&
                    todayStr >= t.data_criacao && todayStr <= t.data_fim && t.status !== 'Concluído'
                  );
                  return (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-3 flex items-center gap-5 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-[#0B2461] flex-shrink-0"/>
                        <div>
                          <p className="font-sora font-bold text-[#0B2461] text-xl leading-none tabular-nums tracking-tight">
                            {now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                          </p>
                          <p className="text-gray-500 text-[10px] mt-0.5 capitalize">
                            {now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
                          </p>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-gray-100 flex-shrink-0"/>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Referência de carga</p>
                        <p className="text-[#0B2461] text-xs font-bold capitalize">{refLabel}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-100 flex-shrink-0"/>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Ativas hoje · {currentUser.name.split(' ')[0]}</p>
                        {todayActive.length > 0
                          ? <p className="text-emerald-600 text-xs font-bold">{todayActive.length} entrega{todayActive.length>1?'s':''} em andamento</p> : <p className="text-gray-400 text-xs">Nenhuma entrega ativa hoje</p>
                        }
                      </div>
                      <div className="h-8 w-px bg-gray-100 flex-shrink-0"/>
                      <div className="ml-auto text-right">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Entregas cadastradas</p>
                        <p className="text-[#0B2461] text-xs font-bold">{tasks.length} entregas · {users.length} servidores</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex gap-3 flex-shrink-0 items-start">
                  {cargaStats.map(stat => (
                    <ServerCard
                      key={stat.id}
                      stat={stat}
                      annualStats={annualStats}
                      systemConfig={systemConfig}
                      refMonthForCarga={refMonthForCarga}
                      tasksWithCalculations={tasksWithCalculations}
                      compact={true}
                    />
                  ))}
                </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">

                  <select value={tableFilters.projeto} onChange={e=>setTableFilters({...tableFilters,projeto:e.target.value})}
                    className={`${selectCls} text-[11px] py-1.5 ${tableFilters.projeto!=='all'?'border-[#0B2461] bg-blue-50 text-[#0B2461] font-semibold':''}`}
                    style={{minWidth:0,width:'auto',maxWidth:160}}>
                    <option value="all">Processo</option>
                    {uniqueProcesses.map(p=><option key={p} value={p}>{p.length>22?p.substring(0,22)+'…':p}</option>)}
                  </select>

                  <div className="relative flex-shrink-0" style={{width:140}}>
                    <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input type="text" placeholder="Entrega…" value={tableFilters.etapa}
                      onChange={e=>setTableFilters({...tableFilters,etapa:e.target.value})}
                      className={`${inputCls} pl-6 py-1.5 text-[11px] ${tableFilters.etapa?'border-[#0B2461] bg-blue-50':''}`}/>
                  </div>

                  <select value={tableFilters.mes} onChange={e=>setTableFilters({...tableFilters,mes:e.target.value})}
                    className={`${selectCls} text-[11px] py-1.5 ${tableFilters.mes!=='all'?'border-[#0B2461] bg-blue-50 text-[#0B2461] font-semibold':''}`}
                    style={{minWidth:0,width:'auto',maxWidth:130}}>
                    <option value="all">Mês (Prazo)</option>
                    {availableMonths.map(m=><option key={m} value={m}>{formatMonthName(m).split(' ')[0].substring(0,3)+' '+m.split('-')[0]}</option>)}
                  </select>

                  <select value={tableFilters.responsavel} onChange={e=>setTableFilters({...tableFilters,responsavel:e.target.value})}
                    className={`${selectCls} text-[11px] py-1.5 ${tableFilters.responsavel!=='all'?'border-[#0B2461] bg-blue-50 text-[#0B2461] font-semibold':''}`}
                    style={{minWidth:0,width:'auto',maxWidth:120}}>
                    <option value="all">Responsável</option>
                    {users.map(u=><option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
                  </select>

                  <select value={tableFilters.status} onChange={e=>setTableFilters({...tableFilters,status:e.target.value})}
                    className={`${selectCls} text-[11px] py-1.5 ${tableFilters.status!=='all'?'border-[#0B2461] bg-blue-50 text-[#0B2461] font-semibold':''}`}
                    style={{minWidth:0,width:'auto',maxWidth:120}}>
                    <option value="all">Status</option>
                    <option>Pendente</option><option>Em andamento</option><option>Concluído</option>
                  </select>

                  <select value={tableFilters.colaborador} onChange={e=>setTableFilters({...tableFilters,colaborador:e.target.value})}
                    className={`${selectCls} text-[11px] py-1.5 ${tableFilters.colaborador!=='all'?'border-[#0B2461] bg-blue-50 text-[#0B2461] font-semibold':''}`}
                    style={{minWidth:0,width:'auto',maxWidth:110}}>
                    <option value="all">Colaborador</option>
                    <option value="com_colab">Com colab.</option>
                    <option value="sem_colab">Sem colab.</option>
                  </select>

                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                      <X size={12}/> Limpar
                    </button>
                  )}

                  <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{filteredTasksForTable.length}/{tasks.length}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {[{v:'table',icon:'⊞',label:'Tabela'},{v:'kanban',icon:'⠿',label:'Kanban'}].map(({v,icon,label}) => (
                    <button key={v} onClick={()=>setTableViewMode(v)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${tableViewMode===v?'bg-[#0B2461] text-white border-[#0B2461] shadow-sm':'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      <span>{icon}</span>{label}
                    </button>
                  ))}
                </div>

                {tableViewMode==='kanban' ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4">
                      <KanbanView
                        tasks={filteredTasksForTable}
                        users={effectiveUsersForCarga}
                        onStatusChange={handleStatusChange}
                        onAssigneeChange={(id,uid)=>handleAssigneeChange(id,uid)}
                        onReorder={handleKanbanReorder}
                        fullWidth={true}
                      />
                    </div>
                  </div>
                ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto" ref={tableScrollRef}>
                    <table className="border-collapse text-sm" style={{minWidth:1800, width:'max-content', tableLayout:'fixed'}}>
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-gray-200" style={{background:'#F8F9FB'}}>
                          {columnOrder.map(colId => {
                            const def = COLUMN_DEFS[colId];
                            const isFixed = def.fixed;
                            const effectiveLabel = colLabelOverrides[colId] || def.label;
                            const dynW = def.resizable ? (colWidths[colId] || (colId==='processo' ? 420 : 360)) : undefined;
                            const hlCls = def.highlight==='blue' ? 'bg-blue-50/60 text-[#0B2461]' : def.highlight==='emerald' ? 'bg-emerald-50/50 text-emerald-700' : 'text-gray-400';
                            const isEditingThis = editingColHeader===colId;
                            const canEdit = currentUser.role==='admin' && !isFixed;
                            return (
                              <th key={colId}
                                draggable={!isFixed && !isEditingThis && !resizingRef.current}
                                onDragStart={e=>{ if(resizingRef.current){e.preventDefault();return;} handleColDragStart(e,colId); }}
                                onDragOver={handleColDragOver}
                                onDrop={e=>handleColDrop(e,colId)}
                                className={`py-3 px-3 text-left font-sora text-[10px] font-semibold tracking-widest uppercase select-none relative ${hlCls} ${draggedColId===colId?'col-dragging':''}`}
                                style={{ width: dynW ?? def.width, minWidth: dynW ?? def.minWidth, textAlign:def.center?'center':undefined }}>
                                <span className="flex items-center gap-1" style={{justifyContent:def.center?'center':undefined}}>
                                  {!isFixed && !isEditingThis && <GripVertical size={10} className="text-gray-300 flex-shrink-0"/>}
                                  {isEditingThis
                                    ? <input
                                        autoFocus
                                        value={editingColValue}
                                        onChange={e=>setEditingColValue(e.target.value)}
                                        onBlur={()=>{setColLabelOverrides(p=>({...p,[colId]:editingColValue||def.label}));setEditingColHeader(null);}}
                                        onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape'){if(e.key==='Enter')setColLabelOverrides(p=>({...p,[colId]:editingColValue||def.label}));setEditingColHeader(null);}}}
                                        onClick={e=>e.stopPropagation()}
                                        className="bg-white border border-blue-400 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase outline-none text-[#0B2461] w-28 shadow-sm"
                                        style={{minWidth:60}}
                                      /> : <span
                                        className={`${canEdit?'cursor-pointer hover:text-[#0B2461] group/lbl relative':''}`}
                                        onClick={e=>{if(!canEdit)return;e.stopPropagation();setEditingColHeader(colId);setEditingColValue(effectiveLabel);}}
                                        title={canEdit?'Clique para renomear':''}
                                      >
                                        {effectiveLabel}
                                        {canEdit&&<span className="ml-1 opacity-0 group-hover/lbl:opacity-60 text-[9px] normal-case tracking-normal">✎</span>}
                                      </span>
                                  }
                                </span>

                                {def.resizable && (
                                  <span
                                    draggable={false}
                                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); startColResize(e, colId); }}
                                    className="absolute right-0 top-0 h-full w-3 cursor-col-resize flex items-center justify-center group/rz z-10"
                                    title="Arraste para redimensionar">
                                    <span className="w-0.5 h-5 rounded-full bg-gray-300 group-hover/rz:bg-[#0B2461] group-hover/rz:shadow transition-all"/>
                                  </span>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody style={{userSelect:'none'}}>
                        {filteredTasksForTable.length===0
                          ? <tr><td colSpan={columnOrder.length} className="py-16 text-center text-gray-400 text-sm">Nenhuma atividade encontrada.</td></tr> : filteredTasksForTable.map(task => {
                            const farolBorder = {'Concluído':'#3B82F6','Atrasado':'#EF4444','Perto':'#F59E0B','Longe':'#10B981'}[task.farol.label]||'#10B981';
                            const subs = task.subentregas || [];
                            const expanded = subEntregasExpanded[task.id];
                            const isMyTask = task.assigned_to === currentUser.id || currentUser.role === 'admin';
                            return (
                              <React.Fragment key={task.id}>
                                <tr
                                  draggable={currentUser.role==='admin'}
                                  onDragStart={e=>handleRowDragStart(e,task.id)}
                                  onDragOver={handleRowDragOver}
                                  onDrop={e=>handleRowDrop(e,task.id)}
                                  className={`border-b border-gray-100 group tr-hover transition-colors ${task.is_running?'tr-running':''} ${draggedRowId===task.id?'opacity-40':''}`}
                                  style={{borderLeft:`3px solid ${farolBorder}`}}>
                                  {columnOrder.map(colId => renderCell(colId, task))}
                                </tr>

                                {expanded && subs.map((sub, si) => (
                                  <tr key={sub.id} className="border-b border-gray-50 bg-slate-50/60">

                                    <td className="py-1.5 px-2" style={{borderLeft:'3px solid #e2e8f0'}}>
                                      <div className="flex items-center gap-1 justify-center">
                                        <span className="text-[9px] text-gray-300 pl-3">└</span>
                                        {isMyTask && (
                                          <button onClick={() => deleteSubEntrega(task.id, sub.id)}
                                            className="text-red-300 hover:text-red-500 p-0.5 rounded transition-colors">
                                            <Trash2 size={10}/>
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    <td colSpan={2} className="py-1.5 px-3">
                                      {isMyTask ? (
                                        <input
                                          value={sub.label}
                                          onChange={e => updateSubEntrega(task.id, sub.id, {label: e.target.value})}
                                          className="w-full text-xs text-gray-600 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-[#0B2461] py-0.5"
                                          placeholder="Descreva a subentrega…"
                                        />
                                      ) : (
                                        <span className="text-xs text-gray-500">{sub.label}</span>
                                      )}
                                    </td>

                                    {columnOrder.slice(3, columnOrder.indexOf('status')).map(c => (
                                      <td key={c} className="py-1.5 px-2"/>
                                    ))}

                                    <td className="py-1.5 px-3">
                                      <select
                                        value={sub.status}
                                        disabled={!isMyTask}
                                        onChange={e => updateSubEntrega(task.id, sub.id, {status: e.target.value})}
                                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none transition-colors ${isMyTask?'cursor-pointer':'cursor-default'} ${
                                          sub.status==='Concluído' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : sub.status==='Em andamento' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                                        }`}>
                                        <option>Pendente</option>
                                        <option>Em andamento</option>
                                        <option>Concluído</option>
                                      </select>
                                    </td>
                                  </tr>
                                ))}

                                {expanded && isMyTask && (
                                  <tr className="border-b border-gray-50">
                                    <td colSpan={columnOrder.length} className="py-1 px-8">
                                      <button
                                        onClick={() => addSubEntrega(task.id)}
                                        className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-semibold hover:bg-emerald-50 px-2 py-1 rounded transition-colors">
                                        <span className="text-sm font-bold leading-none">+</span> Adicionar subentrega
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={{background:'#FAFBFC'}}>
                    <p className="text-[11px] text-gray-400"><strong className="text-[#0B2461]">Carga Mensal</strong> = H/mês × (Score × Complexidade × F.Colab) ÷ Σ · onde <strong className="text-amber-600">Score = (Peso × Complexidade × 2) + U</strong> · U: Vencida=4 · Este mês=3 · ≤30d=2 · &gt;30d=1</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">Hover em Carga → Auditoria</span>
                  </div>
                </div>
                )}
              </div>
            )}
            {currentView==='prioridades' && (
              <PriorityView
                tasksWithCalculations={tasksWithCalculations}
                tasks={tasks}
                users={users}
                currentUser={currentUser}
                refMonthForCarga={refMonthForCarga}
              />
            )}
            {currentView==='dashboards' && (
              <DashboardsView
                tasks={tasks}
                tasksWithCalculations={tasksWithCalculations}
                users={effectiveUsersForCarga}
                cargaStats={cargaStats}
                annualStats={annualStats}
                systemConfig={systemConfig}
                refMonthForCarga={refMonthForCarga}
                todayDate={todayDate}
              />
            )}

            {currentView==='petrvs' && (
              <PetrvsView
                tasks={tasks}
                effectiveUsersForCarga={effectiveUsersForCarga}
                systemConfig={systemConfig}
                users={users}
                petrvsFilter={petrvsFilter}
                setPetrvsFilter={setPetrvsFilter}
                petrvsViewMode={petrvsViewMode}
                setPetrvsViewMode={setPetrvsViewMode}
                isAdmin={isAdmin}
                commitTasks={commitTasks}
                handleStatusChange={handleStatusChange}
                handlePeso2Change={handlePeso2Change}
                handleTitleChange={handleTitleChange}
                uniqueProcesses={uniqueProcesses}
                showToast={showToast}
                getMonthsDifference={getMonthsDifference}
                showNewEntrega={showNewEntrega}
                setShowNewEntrega={setShowNewEntrega}
                newEntregaForm={newEntregaForm}
                setNewEntregaForm={setNewEntregaForm}
                handleAssigneeChange={handleAssigneeChange}
                handleKanbanReorder={handleKanbanReorder}
                petrvsScrollRef={petrvsScrollRef}
              />
            )}

            {currentView==='dashboard' && (
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0B2461] rounded-xl flex items-center justify-center shadow-md"><Target size={22} className="text-white"/></div>
                    <div>
                      <h2 className="font-sora font-bold text-[#0B2461] text-lg leading-tight">Carga de Trabalho</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Peso 2 por atividade + Monitoramentos × 60 · Ajustado por modalidade</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Filter size={14} className="text-gray-400"/>
                    <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} className="bg-transparent border-none text-sm font-semibold text-[#0B2461] focus:outline-none cursor-pointer">
                      <option value="all">Todo o Plano</option>
                      {availableMonths.map(m=><option key={m} value={m}>{formatMonthName(m)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {cargaStats.map(stat => (
                    <ServerCard
                      key={stat.id}
                      stat={stat}
                      annualStats={annualStats}
                      systemConfig={systemConfig}
                      refMonthForCarga={refMonthForCarga}
                      tasksWithCalculations={tasksWithCalculations}
                      compact={false}
                    />
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 leading-relaxed space-y-1">
                  <p><strong>Metodologia — Carga de Trabalho:</strong> Soma dos pontos de Peso Entrega de cada atividade + (Qtd. Monitoramentos × 60 pts por servidor). O fator de modalidade é aplicado como multiplicador da meta esperada.</p>
                  <p><strong>Carga Mensal (Plano Mensal):</strong> H disponível × (Peso Entrega × Complexidade × F.Colaborador × <strong>F.Urgência</strong>) ÷ Σ pesos efetivos. Urgência: vencida=2 · ≤7d=1 · ≤30d=1/15 · ≤90d=1/60 · &gt;90d=1/180. Entrega mais próxima do prazo recebe proporcionalmente mais horas.</p>
                </div>
              </div>
            )}
            {currentView==='configuracoes' && currentUser.role==='admin' && (
              <div className="max-w-6xl mx-auto pb-28">
                <form onSubmit={handleSaveConfig} className="space-y-6">

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2"><Users size={17} className="text-[#0B2461]"/><h3 className="font-sora font-bold text-gray-800">Gestão de Acessos e Equipe</h3></div>
                      <button type="button" onClick={handleAddTempUser} className="flex items-center gap-1.5 text-sm font-semibold text-[#0B2461] bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"><Plus size={14}/> Novo Servidor</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" style={{minWidth:980}}>
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {['Nome','E-mail','Perfil','Modalidade → Fator','Carga/Ano',''].map(h=>(
                              <th key={h} className="text-left px-4 py-3 text-[10px] font-sora font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {tempUsers.map(u => {

                            const m = u.modality?.toLowerCase()||'';
                            const factor = m.includes('parcial') ? parseFloat(tempConfig.factorParcial) : m.includes('integral') ? parseFloat(tempConfig.factorIntegral) : parseFloat(tempConfig.factorPresencial);
                            const factorColor = factor===parseFloat(tempConfig.factorPresencial)?'text-gray-500 bg-gray-50 border-gray-200':factor===parseFloat(tempConfig.factorParcial)?'text-blue-700 bg-blue-50 border-blue-200':'text-violet-700 bg-violet-50 border-violet-200';

                            return (
                              <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-4 py-3"><input type="text" value={u.name} onChange={e=>handleTempUserChange(u.id,'name',e.target.value)} className={inputCls} required/></td>
                                <td className="px-4 py-3"><input type="email" value={u.email} onChange={e=>handleTempUserChange(u.id,'email',e.target.value)} className={inputCls}/></td>
                                <td className="px-4 py-3">
                                  <select value={u.role} onChange={e=>handleTempUserChange(u.id,'role',e.target.value)} className={`${selectCls} font-semibold ${u.role==='admin'?'text-[#0B2461] border-blue-300 bg-blue-50':'text-gray-600'}`}>
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <select value={u.modality} onChange={e=>handleTempUserChange(u.id,'modality',e.target.value)} className={selectCls}>
                                      <option>Presencial</option>
                                      <option value="Teletrabalho parcial">Teletrabalho Parcial</option>
                                      <option value="Teletrabalho integral">Teletrabalho Integral</option>
                                    </select>

                                    <span className={`text-[10px] font-black px-2 py-1 rounded border whitespace-nowrap ${factorColor}`}>×{factor.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    <input type="number" step="1" min="1"
                                      value={u.hoursPerYear ?? (u.hoursPerMonth * 12)}
                                      onChange={e => handleTempUserChange(u.id, 'hoursPerYear', parseInt(e.target.value))}
                                      className={`${inputCls} w-24 text-center font-sora font-bold text-[#0B2461]`}/>
                                    <span className="text-gray-400 text-xs font-medium">h/ano</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3"><button type="button" onClick={()=>handleRemoveTempUser(u.id)} disabled={tempUsers.length===1} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-30"><Trash2 size={15}/></button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-2 border-b pb-3">
                        <Target size={16} className="text-[#0B2461]"/>
                        <h3 className="font-sora font-bold text-gray-800 text-sm">Fatores de Modalidade</h3>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold ml-auto">Conectados à equipe</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4 leading-relaxed">Alterações aqui refletem imediatamente na coluna "Modalidade → Fator" da equipe e nos cálculos de Carga de Trabalho.</p>
                      <div className="space-y-3">
                        {[
                          {label:'Presencial (Linha Base)', key:'factorPresencial', color:'bg-gray-50 border-gray-200', badge:'×1.0'}, {label:'Teletrabalho Parcial', key:'factorParcial', color:'bg-blue-50 border-blue-200', badge:`×${parseFloat(tempConfig.factorParcial).toFixed(1)}`}, {label:'Teletrabalho Integral', key:'factorIntegral', color:'bg-violet-50 border-violet-200', badge:`×${parseFloat(tempConfig.factorIntegral).toFixed(1)}`}, ].map(({label,key,color,badge})=>(
                          <div key={key} className={`flex items-center justify-between p-3.5 rounded-lg border ${color}`}>
                            <label className="text-sm font-semibold text-gray-700">{label}</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" required value={tempConfig[key]} onChange={e=>setTempConfig({...tempConfig,[key]:e.target.value})} className="w-20 border border-gray-300 rounded-lg p-2 font-sora font-bold text-center text-[#0B2461] focus:outline-none focus:ring-2 focus:ring-[#0B2461]/20 text-sm"/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-5 border-b pb-3"><Users size={16} className="text-[#0B2461]"/><h3 className="font-sora font-bold text-gray-800 text-sm">Fator Redutor α</h3></div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">Define a redução de horas ao trabalhar em equipe: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">FR = 1 / c^α</code></p>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-semibold text-gray-700">Intensidade Exponencial</label>
                        <span className="font-sora font-bold text-[#0B2461] text-lg">{tempConfig.alphaParameter}</span>
                      </div>
                      <input type="range" step="0.1" min="0.0" max="1.0" value={tempConfig.alphaParameter} onChange={e=>setTempConfig({...tempConfig,alphaParameter:parseFloat(e.target.value)})} className="w-full accent-[#0B2461]"/>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0.0 (sem redução)</span><span>1.0 (máxima)</span></div>
                    </div>
                  </div>

                  <div className="fixed bottom-0 right-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3 z-20 shadow-lg"
                    style={{left: sidebarCollapsed ? 56 : 240, transition:'left 0.3s'}}>
                    <button type="button" onClick={()=>{setTempConfig(systemConfig);setTempUsers(users);}} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm">Descartar</button>
                    <button type="submit" className="px-6 py-2.5 bg-[#0B2461] text-white rounded-lg font-semibold hover:bg-[#1a3885] transition-colors shadow-md flex items-center gap-2 text-sm"><Save size={15}/> Salvar Configurações</button>
                  </div>
                </form>
              </div>
            )}
          </div>
          {currentView === 'tabela_dinamica' && (
            <div
              ref={bottomBarRef}
              className="overflow-x-auto fixed bottom-0 z-30"
              style={{
                left: sidebarCollapsed ? 56 : 240, right: 0, height: 18, background: '#dde1e9', borderTop: '2px solid #b8bfcc', boxShadow: '0 -3px 10px rgba(0,0,0,0.10)', transition: 'left 0.3s', }}
            >
              <div style={{ height: 1, width: tableScrollWidth }}/>
            </div>
          )}
          {currentView === 'petrvs' && (
            <div
              ref={petrvsBarRef}
              className="overflow-x-auto fixed bottom-0 z-30"
              style={{
                left: sidebarCollapsed ? 56 : 240, right: 0, height: 18, background: '#dde1e9', borderTop: '2px solid #b8bfcc', boxShadow: '0 -3px 10px rgba(0,0,0,0.10)', transition: 'left 0.3s', }}
            >
              <div style={{ height: 1, width: petrvsScrollWidth }}/>
            </div>
          )}
        </main>
        {showFormula && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowFormula(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden modal-anim" style={{maxWidth:680}} onClick={e=>e.stopPropagation()}>

              <div style={{background:'#0B2461'}} className="px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg">⚖️</div>
                  <div>
                    <h2 className="font-sora font-bold text-white text-base">Fórmula de Distribuição de Carga Horária</h2>
                    <p className="text-blue-200/70 text-[11px] mt-0.5">DIGEP · Metodologia de Gestão de Projetos</p>
                  </div>
                </div>
                <button onClick={()=>setShowFormula(false)} className="text-blue-200 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"><X size={18}/></button>
              </div>

              <div className="p-7 space-y-5 overflow-y-auto" style={{maxHeight:'80vh'}}>

                <div className="bg-[#0B2461] rounded-xl p-5 text-center">
                  <p className="text-blue-300/60 text-[10px] font-sora font-semibold uppercase tracking-widest mb-3">Fórmula Principal</p>
                  <div className="font-mono text-white text-sm leading-relaxed">
                    <span className="text-emerald-400 font-bold">Score</span>
                    <span className="text-blue-300"> = </span>
                    <span className="text-white font-bold">(P × Cpx × 2)</span>
                    <span className="text-blue-300"> + </span>
                    <span className="text-yellow-300 font-bold">U</span>
                  </div>
                  <div className="mt-3 font-mono text-[11px] text-blue-300/70 leading-relaxed">
                    Pontos da entrega = <span className="text-yellow-300">Peso</span> × <span className="text-emerald-300">Complexidade</span> · usado em Carga de Trabalho e na distribuição de horas
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[11px] font-sora font-bold text-[#0B2461] uppercase tracking-wider mb-2">📋 Resumo Executivo</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    As horas disponíveis de cada servidor no mês são distribuídas entre suas entregas ativas
                    de forma <strong>proporcional ao peso relativo</strong> de cada uma. Quanto maior a
                    <strong> complexidade</strong>, o <strong>peso</strong> e a <strong>proximidade do prazo</strong>, maior a fatia de horas alocada à entrega. A soma sempre fecha exatamente no total
                    de horas configurado para o servidor.
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider mb-3">Variáveis da Fórmula</p>
                  <div className="space-y-2">
                    {null}
                    {/* content removed */}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-sora font-bold text-gray-500 uppercase tracking-wider mb-3">Escala de Urgência — F_Urgência (calculado com a data de hoje)</p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Situação','Dias Restantes','F_Urgência','Efeito'].map(h=>(
                            <th key={h} className="text-left px-4 py-2.5 font-sora font-semibold text-[10px] text-gray-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {/* data rows */}






                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-[11px] font-sora font-bold text-emerald-800 uppercase tracking-wider mb-2">📐 Exemplo Simplificado — Servidor com 56h/mês e 3 entregas</p>
                  <div className="space-y-1 text-[11px] text-emerald-900 font-mono">
                    <p>Entrega A: Peso 60 × Cpx 3 × F_Colab 1.0 × <span className="font-bold">F_Urg 2.0</span> (vencida)   = PE = 360</p>
                    <p>Entrega B: Peso 30 × Cpx 2 × F_Colab 1.0 × <span className="font-bold">F_Urg 1.0</span> (≤7 dias)  = PE =  60</p>
                    <p>Entrega C: Peso 30 × Cpx 1 × F_Colab 1.0 × <span className="font-bold">F_Urg 0.017</span> (60 dias) = PE = 0.5</p>
                    <div className="border-t border-emerald-300 mt-2 pt-2">
                      <p>Σ PE = 360 + 60 + 0.5 = 420.5</p>
                      <p className="text-emerald-700 font-bold mt-1">H(A) = 56 × 360 ÷ 420.5 = <span className="text-emerald-900">47,9h</span></p>
                      <p className="text-emerald-700 font-bold">H(B) = 56 × 60  ÷ 420.5 = <span className="text-emerald-900">8,0h</span></p>
                      <p className="text-emerald-700 font-bold">H(C) = 56 × 0.5 ÷ 420.5 = <span className="text-emerald-900">0,1h</span></p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/60 flex justify-end">
                <button onClick={()=>setShowFormula(false)} className="px-6 py-2.5 bg-[#0B2461] text-white rounded-xl font-semibold text-sm hover:bg-[#1a3885] transition-colors">Fechar</button>
              </div>
            </div>
          </div>
        )}
        {importModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full modal-anim flex flex-col" style={{maxWidth:780, maxHeight:'90vh'}}>

              <div className="bg-[#0B2461] px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center"><Upload size={17} className="text-white"/></div>
                  <div>
                    <h2 className="font-sora font-bold text-white text-base leading-tight">Importar Planilha</h2>
                    <p className="text-blue-200/70 text-[11px] mt-0.5">{importModal.rows.length} linhas detectadas · {importModal.headers.length} colunas</p>
                  </div>
                </div>
                <button onClick={()=>setImportModal(null)} className="text-blue-200 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X size={18}/></button>
              </div>

              <div className="overflow-y-auto p-6 space-y-5" style={{maxHeight:'65vh'}}>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mr-1">Modo:</span>
                  {[
                    { v:'append', label:'➕ Adicionar às existentes', desc:'Mantém entregas atuais e adiciona as da planilha' }, { v:'replace', label:'🔄 Substituir tudo', desc:'Remove todas as entregas atuais e usa apenas a planilha' }, ].map(opt=>(
                    <button key={opt.v} onClick={()=>setImportModal(m=>({...m,mode:opt.v}))}
                      className={`flex-1 px-4 py-3 rounded-lg border text-left transition-all ${importModal.mode===opt.v?'border-[#0B2461] bg-blue-50':'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <p className={`text-xs font-bold ${importModal.mode===opt.v?'text-[#0B2461]':'text-gray-700'}`}>{opt.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-4 bg-[#0B2461] rounded-full"/>
                    <h3 className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider">Mapeamento de Colunas</h3>
                    <span className="text-[10px] text-gray-400 ml-1">Clique para alterar se necessário</span>
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                      <span className="col-span-5 text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-widest">Coluna da planilha</span>
                      <span className="col-span-1 text-center text-gray-300 text-sm">→</span>
                      <span className="col-span-5 text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-widest">Campo na tabela</span>
                      <span className="col-span-1 text-[10px] font-sora font-semibold text-gray-400 uppercase tracking-widest text-center">Auto</span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                      {importModal.headers.map(h=>{
                        const matched = importModal.mapping[h];
                        const isAuto  = autoMatchField(h, colLabelOverrides) === matched && matched !== '';
                        return (
                          <div key={h} className={`grid grid-cols-12 items-center px-4 py-2.5 hover:bg-gray-50/60 transition-colors ${isAuto?'':'bg-amber-50/30'}`}>
                            <div className="col-span-5 flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-gray-700 truncate" title={h}>{h}</span>
                            </div>
                            <div className="col-span-1 text-center text-gray-300 text-sm">→</div>
                            <div className="col-span-5">
                              <select
                                value={matched||''}
                                onChange={e=>setImportModal(m=>({...m,mapping:{...m.mapping,[h]:e.target.value}}))}
                                className={`w-full text-[11px] font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-[#0B2461]/30 transition-colors ${matched?'border-emerald-300 bg-emerald-50 text-emerald-800':'border-gray-200 bg-white text-gray-400'}`}>
                                {FIELD_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </div>
                            <div className="col-span-1 flex justify-center">
                              {isAuto
                                ? <span className="text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded-full font-bold">AUTO</span> : matched
                                  ? <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full font-bold">MAN</span> : <span className="text-[9px] bg-gray-100 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full font-bold">—</span>
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {importModal.rows.length>0 && (()=>{
                  const mappedFields = Object.entries(importModal.mapping).filter(([,v])=>v);
                  const preview = importModal.rows.slice(0,3).map(row=>{
                    const obj={};
                    mappedFields.forEach(([h,field])=>{
                      const hIdx=importModal.headers.indexOf(h);
                      if(hIdx>=0) obj[field]=row[hIdx];
                    });
                    return obj;
                  });
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full"/>
                        <h3 className="text-xs font-sora font-bold text-gray-700 uppercase tracking-wider">Pré-visualização</h3>
                        <span className="text-[10px] text-gray-400">(primeiras {Math.min(3,importModal.rows.length)} linhas)</span>
                      </div>
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>{mappedFields.map(([,f])=><th key={f} className="text-left px-3 py-2 font-sora font-semibold text-[10px] text-gray-400 uppercase tracking-wider whitespace-nowrap">{FIELD_OPTIONS.find(o=>o.value===f)?.label||f}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {preview.map((row,i)=>(
                                <tr key={i} className="hover:bg-gray-50/60">
                                  {mappedFields.map(([,f])=>(
                                    <td key={f} className="px-3 py-2 text-gray-700 max-w-[200px]">
                                      <span className="truncate block" title={String(row[f]||'')}>{String(row[f]||'—').substring(0,40)}{String(row[f]||'').length>40?'…':''}</span>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Info size={13} className="text-blue-400"/>
                  Campos sem mapeamento receberão valores padrão.
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>setImportModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 text-sm transition-colors">Cancelar</button>
                  <button onClick={executeImport}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    style={{background:'#AAFF00',color:'#0B2461',boxShadow:'0 0 14px rgba(170,255,0,0.45)'}}>
                    <Upload size={15} strokeWidth={2.5}/>
                    Importar {importModal.rows.length} {importModal.rows.length===1?'linha':'linhas'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        {showTaskForm && currentUser.role==='admin' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl modal-anim overflow-hidden">
              <div className="bg-[#0B2461] px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><Plus size={16} className="text-white"/></div><h2 className="font-sora font-bold text-white text-base">Nova Entrega</h2></div>
                <button onClick={()=>setShowTaskForm(false)} className="text-blue-200 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"><X size={18}/></button>
              </div>
              <form onSubmit={handleAddTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Processo</label>
                  <input
                    list="modal-proc-list"
                    value={newTask.title}
                    onChange={e=>setNewTask({...newTask,title:e.target.value})}
                    required
                    placeholder="Selecione ou digite um novo processo…"
                    className={`${inputCls} font-semibold text-[#0B2461]`}
                  />
                  <datalist id="modal-proc-list">
                    {uniqueProcesses.map(p=><option key={p} value={p}/>)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Entrega / Etapa</label>
                  <textarea required rows={3} value={newTask.etapas} onChange={e=>setNewTask({...newTask,etapas:e.target.value})} className={inputCls} placeholder="Descreva a entrega…"/>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Peso Processo</label>
                    <select value={newTask.pesoProcesso||30} onChange={e=>setNewTask({...newTask,pesoProcesso:parseInt(e.target.value)})} className={`${selectCls} font-bold`}>
                      <option value={10}>10 pts</option><option value={30}>30 pts</option><option value={60}>60 pts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Peso Entrega</label>
                    <select value={newTask.peso2} onChange={e=>setNewTask({...newTask,peso2:parseInt(e.target.value)})} className={`${selectCls} font-bold`}>
                      <option value={10}>10 pts</option><option value={30}>30 pts</option><option value={60}>60 pts</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Complexidade</label>
                    <select value={newTask.complexidade||1} onChange={e=>setNewTask({...newTask,complexidade:parseInt(e.target.value)})} className={`${selectCls} font-bold`}>
                      <option value={1}>1 — Baixa</option><option value={2}>2 — Média</option><option value={3}>3 — Alta</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Responsável</label>
                    <select value={newTask.assigned_to} onChange={e=>setNewTask({...newTask,assigned_to:parseInt(e.target.value)})} className={selectCls}>
                      {users.map(u=><option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Início</label>
                    <input required type="date" value={newTask.data_criacao} onChange={e=>setNewTask({...newTask,data_criacao:e.target.value})} className={inputCls}/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Prazo Final</label>
                    <input required type="date" value={newTask.data_fim} onChange={e=>setNewTask({...newTask,data_fim:e.target.value})} className={inputCls}/>
                  </div>
                </div>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={()=>setShowTaskForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
                  <button type="submit" className="flex-[2] py-2.5 text-[#0B2461] rounded-lg font-bold transition-all shadow-md text-sm" style={{background:'#AAFF00',boxShadow:'0 0 12px rgba(170,255,0,0.4)'}}>Salvar Atividade</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBackupModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg modal-anim flex flex-col" style={{maxHeight:'80vh'}}>
              <div className="bg-[#0B2461] px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
                <div className="flex items-center gap-3"><HistoryIcon size={18} className="text-white"/><h2 className="font-sora font-bold text-white">Backups Locais</h2></div>
                <button onClick={()=>setShowBackupModal(false)} className="text-blue-200 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10"><X size={18}/></button>
              </div>
              <div className="overflow-y-auto p-6 space-y-3" style={{maxHeight:'65vh'}}>
                {backups.length===0
                  ? <div className="text-center py-10 text-gray-400"><Save size={40} className="mx-auto mb-3 text-gray-200"/><p className="font-semibold text-gray-500">Nenhum backup encontrado.</p></div> : backups.map(b=>(
                    <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-3">
                      <div><p className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Clock size={14} className="text-gray-400"/>{b.label}</p><p className="text-xs text-gray-400 mt-0.5">{b.data.length} atividades</p></div>
                      <button onClick={()=>setBackupToRestore(b)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B2461] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0"><Download size={13}/> Restaurar</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {backupToRestore!==null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm modal-anim p-7 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={26} className="text-amber-600"/></div>
              <h2 className="font-sora font-bold text-gray-800 text-lg mb-2">Restaurar Imagem?</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Substituirá atividades atuais pelas de <strong>"{backupToRestore.label}"</strong>.</p>
              <div className="flex gap-3">
                <button onClick={()=>setBackupToRestore(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
                <button onClick={confirmRestoreBackup} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 shadow text-sm">Restaurar</button>
              </div>
            </div>
          </div>
        )}

        {taskToDelete!==null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm modal-anim p-7 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={26} className="text-red-600"/></div>
              <h2 className="font-sora font-bold text-gray-800 text-lg mb-2">Remover Atividade?</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Esta ação é permanente. Use o undo se precisar reverter.</p>
              <div className="flex gap-3">
                <button onClick={()=>setTaskToDelete(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow text-sm">Remover</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

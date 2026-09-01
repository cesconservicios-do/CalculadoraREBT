import React, { useEffect, useState } from 'react';
import { STORAGE_KEYS, BUDGET_TEMPLATES, DEFAULT_BUDGET_CONDITIONS } from '../constants';
import { BudgetData, BudgetItem, InstallationWorkType } from '../types';
import { suggestBudgetItems, isGeminiConfigured } from '../services/geminiService';
import {
  FileText, Plus, Trash2, Sparkles, Printer, Share2, Copy, RotateCcw, Save,
  Loader2, AlertTriangle, Eye, PenLine
} from 'lucide-react';

const WORK_TYPES: InstallationWorkType[] = [
  'Instalación eléctrica vivienda',
  'Local comercial',
  'Reforma cuadro eléctrico',
  'Instalación fotovoltaica',
  'Mantenimiento y averías',
  'Instalación industrial',
  'Otro'
];

const formatEUR = (value: number) =>
  value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const emptyInstaller = { companyName: '', taxId: '', installerNumber: '', address: '', phone: '', email: '' };
const emptyClient = { name: '', taxId: '', address: '', phone: '', email: '' };

const nextBudgetNumber = (): string => {
  const year = new Date().getFullYear();
  const counterRaw = localStorage.getItem(STORAGE_KEYS.BUDGET_COUNTER);
  const counter = counterRaw ? parseInt(counterRaw, 10) + 1 : 1;
  localStorage.setItem(STORAGE_KEYS.BUDGET_COUNTER, String(counter));
  return `PRE-${year}-${String(counter).padStart(3, '0')}`;
};

const loadInstaller = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTALLER);
    return raw ? JSON.parse(raw) : emptyInstaller;
  } catch {
    return emptyInstaller;
  }
};

const loadLastBudget = (): BudgetData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_BUDGET);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const freshBudget = (installer = loadInstaller()): BudgetData => ({
  installerData: installer,
  clientData: emptyClient,
  headerData: {
    number: nextBudgetNumber(),
    date: new Date().toISOString().slice(0, 10),
    validityDays: 30,
    installationType: 'Instalación eléctrica vivienda',
    vatRate: 21
  },
  items: [],
  conditions: DEFAULT_BUDGET_CONDITIONS
});

const BudgetModule: React.FC = () => {
  const [budget, setBudget] = useState<BudgetData>(() => loadLastBudget() ?? freshBudget());
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_BUDGET, JSON.stringify(budget));
  }, [budget]);

  const updateInstaller = (patch: Partial<BudgetData['installerData']>) =>
    setBudget(prev => ({ ...prev, installerData: { ...prev.installerData, ...patch } }));

  const updateClient = (patch: Partial<BudgetData['clientData']>) =>
    setBudget(prev => ({ ...prev, clientData: { ...prev.clientData, ...patch } }));

  const updateHeader = (patch: Partial<BudgetData['headerData']>) =>
    setBudget(prev => ({ ...prev, headerData: { ...prev.headerData, ...patch } }));

  const saveInstallerData = () => {
    localStorage.setItem(STORAGE_KEYS.INSTALLER, JSON.stringify(budget.installerData));
  };

  const addItem = (item?: Partial<BudgetItem>) => {
    const newItem: BudgetItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      description: item?.description ?? '',
      units: item?.units ?? 1,
      unitPrice: item?.unitPrice ?? 0
    };
    setBudget(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (id: string, patch: Partial<BudgetItem>) => {
    setBudget(prev => ({ ...prev, items: prev.items.map(it => (it.id === id ? { ...it, ...patch } : it)) }));
  };

  const removeItem = (id: string) => {
    setBudget(prev => ({ ...prev, items: prev.items.filter(it => it.id !== id) }));
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setBudget(prev => {
      const idx = prev.items.findIndex(it => it.id === id);
      const newIdx = idx + direction;
      if (idx === -1 || newIdx < 0 || newIdx >= prev.items.length) return prev;
      const items = [...prev.items];
      [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
      return { ...prev, items };
    });
  };

  const applyTemplate = () => {
    const template = BUDGET_TEMPLATES[budget.headerData.installationType];
    if (!template) return;
    template.forEach(t => addItem(t));
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const items = await suggestBudgetItems(budget.headerData.installationType, aiDescription);
      setBudget(prev => ({ ...prev, items: [...prev.items, ...items] }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Error al obtener sugerencias de la IA.');
    } finally {
      setAiLoading(false);
    }
  };

  const base = budget.items.reduce((sum, it) => sum + it.units * it.unitPrice, 0);
  const vat = base * (budget.headerData.vatRate / 100);
  const total = base + vat;

  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const lines = [
      `*Presupuesto ${budget.headerData.number}*`,
      budget.clientData.name ? `Cliente: ${budget.clientData.name}` : '',
      `Tipo: ${budget.headerData.installationType}`,
      '',
      ...budget.items.map(it => `- ${it.description} (${it.units} ud x ${formatEUR(it.unitPrice)})`),
      '',
      `Base imponible: ${formatEUR(base)}`,
      `IVA (${budget.headerData.vatRate}%): ${formatEUR(vat)}`,
      `*Total: ${formatEUR(total)}*`
    ].filter(Boolean);
    const url = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNew = () => {
    setBudget(freshBudget(budget.installerData));
    setView('form');
  };

  const handleDuplicate = () => {
    setBudget(prev => ({ ...prev, headerData: { ...prev.headerData, number: nextBudgetNumber(), date: new Date().toISOString().slice(0, 10) } }));
  };

  const geminiReady = isGeminiConfigured();

  return (
    <div className="p-6 md:p-10 bg-slate-900 min-h-full tab-content-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-700 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-500 w-8 h-8" />
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Presupuestos</h2>
        </div>
        <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
          <button onClick={() => setView('form')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'form' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>
            <PenLine size={12} /> Formulario
          </button>
          <button onClick={() => setView('preview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'preview' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>
            <Eye size={12} /> Vista previa
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="space-y-8 print:hidden">
          {/* Datos instalador */}
          <div className="bg-slate-950 border border-slate-800 rounded-[28px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">Datos del instalador</h3>
              <button onClick={saveInstallerData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-[9px] font-black uppercase">
                <Save size={12} /> Guardar mis datos
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={budget.installerData.companyName} onChange={e => updateInstaller({ companyName: e.target.value })} placeholder="Empresa / Autónomo" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.installerData.taxId} onChange={e => updateInstaller({ taxId: e.target.value })} placeholder="NIF/CIF" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.installerData.installerNumber} onChange={e => updateInstaller({ installerNumber: e.target.value })} placeholder="Nº instalador (ej: A-12345-ESP)" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.installerData.address} onChange={e => updateInstaller({ address: e.target.value })} placeholder="Dirección" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none md:col-span-2" />
              <input value={budget.installerData.phone} onChange={e => updateInstaller({ phone: e.target.value })} placeholder="Teléfono" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.installerData.email} onChange={e => updateInstaller({ email: e.target.value })} placeholder="Email" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none md:col-span-3" />
            </div>
          </div>

          {/* Datos cliente */}
          <div className="bg-slate-950 border border-slate-800 rounded-[28px] p-6">
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4">Datos del cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={budget.clientData.name} onChange={e => updateClient({ name: e.target.value })} placeholder="Nombre o empresa" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.clientData.taxId} onChange={e => updateClient({ taxId: e.target.value })} placeholder="NIF/CIF (opcional)" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.clientData.phone} onChange={e => updateClient({ phone: e.target.value })} placeholder="Teléfono" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
              <input value={budget.clientData.address} onChange={e => updateClient({ address: e.target.value })} placeholder="Dirección de la obra" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none md:col-span-2" />
              <input value={budget.clientData.email} onChange={e => updateClient({ email: e.target.value })} placeholder="Email" className="bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none" />
            </div>
          </div>

          {/* Cabecera */}
          <div className="bg-slate-950 border border-slate-800 rounded-[28px] p-6">
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4">Cabecera del presupuesto</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Número</label>
                <input value={budget.headerData.number} onChange={e => updateHeader({ number: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl font-mono-tech" />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Fecha</label>
                <input type="date" value={budget.headerData.date} onChange={e => updateHeader({ date: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl" />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Validez (días)</label>
                <input type="number" value={budget.headerData.validityDays} onChange={e => updateHeader({ validityDays: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Tipo instalación</label>
                <select value={budget.headerData.installationType} onChange={e => updateHeader({ installationType: e.target.value as InstallationWorkType })} className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl">
                  {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">IVA</label>
                <select value={budget.headerData.vatRate} onChange={e => updateHeader({ vatRate: Number(e.target.value) as 21 | 10 | 0 })} className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl">
                  <option value={21}>21% General</option>
                  <option value={10}>10% Reducido (obra vivienda)</option>
                  <option value={0}>0% Exento</option>
                </select>
              </div>
            </div>
            {budget.headerData.installationType === 'Otro' && (
              <p className="text-[9px] text-slate-500 mt-3 italic">Si es una instalación provisional de obra (ITC-BT-33), recuerda incluir cuadro normalizado con ICP + diferencial 30mA y tomas con tapa de protección.</p>
            )}
          </div>

          {/* Asistente IA */}
          <div className="bg-slate-950 border border-slate-800 rounded-[28px] p-6">
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={14} className="text-orange-500" /> Asistente de partidas</h3>
            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <input
                value={aiDescription}
                onChange={e => setAiDescription(e.target.value)}
                placeholder="Describe la obra (ej: piso de 90m², reforma integral)..."
                className="flex-grow bg-slate-900 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              <button
                onClick={handleAISuggest}
                disabled={!geminiReady || aiLoading}
                title={!geminiReady ? 'Configura tu clave Gemini en .env.local para usar el asistente IA' : undefined}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase whitespace-nowrap"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Sugerir con IA
              </button>
              <button onClick={applyTemplate} disabled={!BUDGET_TEMPLATES[budget.headerData.installationType]} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 px-5 py-3 rounded-xl text-[10px] font-black uppercase whitespace-nowrap">
                Plantilla rápida
              </button>
            </div>
            {!geminiReady && (
              <p className="text-[9px] text-slate-500 italic">Configura tu clave Gemini en .env.local para usar el asistente IA. Puedes usar la plantilla rápida sin conexión.</p>
            )}
            {aiError && (
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-2">
                <AlertTriangle size={14} /> {aiError}
                <button onClick={handleAISuggest} className="ml-auto underline">Reintentar</button>
              </div>
            )}
          </div>

          {/* Partidas */}
          <div className="bg-slate-950 border border-slate-800 rounded-[28px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">Partidas</h3>
              <button onClick={() => addItem()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-[9px] font-black uppercase">
                <Plus size={12} /> Añadir partida
              </button>
            </div>
            <div className="space-y-3">
              {budget.items.length === 0 && <p className="text-slate-600 text-xs italic text-center py-6">Sin partidas. Añade una manualmente o usa el asistente.</p>}
              {budget.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_90px_120px_110px_auto] gap-2 items-start bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <textarea
                    value={item.description}
                    onChange={e => updateItem(item.id, { description: e.target.value })}
                    placeholder="Descripción del trabajo..."
                    rows={2}
                    className="bg-slate-950 border border-slate-700 text-white text-sm p-2.5 rounded-lg resize-none focus:border-orange-500 focus:outline-none"
                  />
                  <input type="number" min={0} value={item.units} onChange={e => updateItem(item.id, { units: Number(e.target.value) })} className="bg-slate-950 border border-slate-700 text-white text-sm p-2.5 rounded-lg" placeholder="Ud." />
                  <input type="number" min={0} step="0.01" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: Number(e.target.value) })} className="bg-slate-950 border border-slate-700 text-white text-sm p-2.5 rounded-lg" placeholder="€/ud" />
                  <div className="text-orange-400 font-mono-tech font-bold text-sm p-2.5 text-right">{formatEUR(item.units * item.unitPrice)}</div>
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => moveItem(item.id, -1)} disabled={idx === 0} aria-label="Subir partida" className="p-2 text-slate-500 hover:text-slate-300 disabled:opacity-20">↑</button>
                    <button onClick={() => moveItem(item.id, 1)} disabled={idx === budget.items.length - 1} aria-label="Bajar partida" className="p-2 text-slate-500 hover:text-slate-300 disabled:opacity-20">↓</button>
                    <button onClick={() => removeItem(item.id)} aria-label="Eliminar partida" className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 border-t border-slate-800 pt-6">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs text-slate-400"><span>Base imponible</span><span className="font-mono-tech">{formatEUR(base)}</span></div>
                <div className="flex justify-between text-xs text-slate-400"><span>IVA ({budget.headerData.vatRate}%)</span><span className="font-mono-tech">{formatEUR(vat)}</span></div>
                <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800"><span>Total</span><span className="font-mono-tech text-orange-500">{formatEUR(total)}</span></div>
              </div>
            </div>
          </div>

          {/* Condiciones */}
          <div className="bg-slate-950 border border-slate-800 rounded-[28px] p-6">
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4">Condiciones y observaciones</h3>
            <textarea
              value={budget.conditions}
              onChange={e => setBudget(prev => ({ ...prev, conditions: e.target.value }))}
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm p-4 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setView('preview')} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase">
              <Eye size={16} /> Ver presupuesto
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase">
              <Share2 size={16} /> Enviar WhatsApp
            </button>
            <button onClick={handleDuplicate} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-2xl text-xs font-black uppercase">
              <Copy size={16} /> Duplicar
            </button>
            <button onClick={handleNew} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-2xl text-xs font-black uppercase">
              <RotateCcw size={16} /> Nuevo presupuesto
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div id="budget-print-area" className="bg-white text-slate-900 rounded-[28px] p-8 md:p-14 shadow-2xl max-w-4xl mx-auto">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
              <div>
                <h1 className="text-2xl font-black uppercase italic">{budget.installerData.companyName || 'Instalador Autorizado'}</h1>
                <p className="text-xs text-slate-500 mt-1">{budget.installerData.taxId}</p>
                <p className="text-xs text-slate-500">{budget.installerData.address}</p>
                <p className="text-xs text-slate-500">{budget.installerData.phone} {budget.installerData.email}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-orange-600">PRESUPUESTO</h2>
                <p className="text-sm font-mono-tech font-bold">{budget.headerData.number}</p>
                <p className="text-xs text-slate-500">Fecha: {budget.headerData.date}</p>
                <p className="text-xs text-slate-500">Válido {budget.headerData.validityDays} días</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Cliente</h3>
              <p className="font-bold text-sm">{budget.clientData.name || '—'}</p>
              <p className="text-xs text-slate-500">{budget.clientData.taxId}</p>
              <p className="text-xs text-slate-500">{budget.clientData.address}</p>
            </div>

            <table className="w-full text-left mb-8 text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[10px] uppercase">
                  <th className="py-2">Descripción</th>
                  <th className="py-2 text-right">Ud.</th>
                  <th className="py-2 text-right">Precio</th>
                  <th className="py-2 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map(item => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-3 pr-4 whitespace-pre-line">{item.description}</td>
                    <td className="py-3 text-right">{item.units}</td>
                    <td className="py-3 text-right">{formatEUR(item.unitPrice)}</td>
                    <td className="py-3 text-right font-bold">{formatEUR(item.units * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-10">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm"><span>Base imponible</span><span>{formatEUR(base)}</span></div>
                <div className="flex justify-between text-sm"><span>IVA ({budget.headerData.vatRate}%)</span><span>{formatEUR(vat)}</span></div>
                <div className="flex justify-between text-lg font-black border-t-2 border-slate-900 pt-2"><span>Total</span><span>{formatEUR(total)}</span></div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Condiciones</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{budget.conditions}</p>
            </div>

            <div className="mt-10 pt-4 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between">
              <span>Nº Instalador: {budget.installerData.installerNumber || '—'}</span>
              <span>Cumple normativa REBT vigente</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase hover:bg-slate-800">
              <Printer size={16} /> Imprimir / Guardar PDF
            </button>
            <button onClick={() => setView('form')} className="flex items-center gap-2 bg-slate-800 text-slate-200 px-6 py-3 rounded-2xl text-xs font-black uppercase hover:bg-slate-700">
              <PenLine size={16} /> Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetModule;

import React, { useEffect, useState } from 'react';
import { TabType } from './types';
import { STORAGE_KEYS } from './constants';
import InstallationScheme from './components/InstallationScheme';
import DICalculator from './components/DICalculator';
import ProtectionCalculator from './components/ProtectionCalculator';
import RoomGuide from './components/RoomGuide';
import SafetyReference from './components/SafetyReference';
import BudgetModule from './components/BudgetModule';
import ErrorBoundary from './components/ErrorBoundary';
import { FileText, Shield, Sun } from 'lucide-react';

const TABS: { id: TabType; label: string }[] = [
  { id: TabType.SCHEME, label: 'Enlace' },
  { id: TabType.CALCULATOR, label: 'Calculadora' },
  { id: TabType.PROTECTIONS, label: 'Protecciones' },
  { id: TabType.ROOMS, label: 'Estancias' },
  { id: TabType.SAFETY, label: 'Seguridad' },
  { id: TabType.BUDGET, label: 'Presupuesto' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.SCHEME);
  const [fieldMode, setFieldMode] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.FIELD_MODE) === 'true');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIELD_MODE, String(fieldMode));
    document.documentElement.style.fontSize = fieldMode ? '18px' : '';
  }, [fieldMode]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 ${fieldMode ? 'field-mode' : ''}`}>
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 md:p-6 shadow-2xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2.5 rounded-lg shadow-lg shadow-orange-500/20">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">REBT <span className="text-orange-500">Pro</span></h1>
                <p className="hidden md:block text-slate-500 text-[10px] font-mono-tech tracking-widest uppercase">Engineering Tools & Standards</p>
              </div>
            </div>
            <button
              onClick={() => setFieldMode(prev => !prev)}
              aria-label="Alternar modo campo"
              title="Modo Campo (tamaños grandes para uso con guantes)"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${fieldMode ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Sun size={16} /> <span className="hidden sm:inline">Modo Campo</span>
            </button>
          </div>

          <nav className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 w-full md:w-auto shadow-inner overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`flex-shrink-0 px-4 md:px-5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.id === TabType.PROTECTIONS && <Shield size={13} />}
                {tab.id === TabType.BUDGET && <FileText size={13} />}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-0 md:p-6">
        <div key={activeTab} className="bg-slate-900/50 md:rounded-3xl border-x md:border border-slate-800 min-h-[700px] overflow-hidden shadow-2xl tab-content-enter">
          <ErrorBoundary>
            {activeTab === TabType.SCHEME && <InstallationScheme />}
            {activeTab === TabType.CALCULATOR && <DICalculator />}
            {activeTab === TabType.PROTECTIONS && <ProtectionCalculator />}
            {activeTab === TabType.ROOMS && <RoomGuide />}
            {activeTab === TabType.SAFETY && <SafetyReference />}
            {activeTab === TabType.BUDGET && <BudgetModule />}
          </ErrorBoundary>
        </div>
      </main>

      {/* Footer (solo desktop) */}
      <footer className="hidden md:block bg-slate-950 border-t border-slate-900 py-8 px-8 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ITC-BT-10 a ITC-BT-25</p>
            <p className="text-slate-600 text-[10px] mt-1 font-mono-tech">Normativa REBT España - Actualizado 2024</p>
          </div>
          <div className="flex gap-8">
            <span className="text-slate-600 hover:text-orange-500 cursor-pointer text-[10px] font-bold uppercase tracking-widest transition-colors">Documentación</span>
            <span className="text-slate-600 hover:text-orange-500 cursor-pointer text-[10px] font-bold uppercase tracking-widest transition-colors">API</span>
            <span className="text-slate-600 hover:text-orange-500 cursor-pointer text-[10px] font-bold uppercase tracking-widest transition-colors">Contacto</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

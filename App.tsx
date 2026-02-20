
import React, { useState } from 'react';
import { TabType } from './types';
import InstallationScheme from './components/InstallationScheme';
import DICalculator from './components/DICalculator';
import RoomGuide from './components/RoomGuide';
import SafetyReference from './components/SafetyReference';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.SCHEME);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 shadow-2xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-2.5 rounded-lg shadow-lg shadow-orange-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">REBT <span className="text-orange-500">Pro</span></h1>
              <p className="text-slate-500 text-[10px] font-mono-tech tracking-widest uppercase">Engineering Tools & Standards</p>
            </div>
          </div>
          <nav className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 w-full md:w-auto shadow-inner">
            {[
              { id: TabType.SCHEME, label: 'Enlace' },
              { id: TabType.CALCULATOR, label: 'Calculadora' },
              { id: TabType.ROOMS, label: 'Estancias' },
              { id: TabType.SAFETY, label: 'Seguridad' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto w-full p-0 md:p-6">
        <div className="bg-slate-900/50 md:rounded-3xl border-x md:border border-slate-800 min-h-[700px] overflow-hidden shadow-2xl tab-content-enter">
          {activeTab === TabType.SCHEME && <InstallationScheme />}
          {activeTab === TabType.CALCULATOR && <DICalculator />}
          {activeTab === TabType.ROOMS && <RoomGuide />}
          {activeTab === TabType.SAFETY && <SafetyReference />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 px-8 text-center">
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

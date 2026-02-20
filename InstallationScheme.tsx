
import React, { useState } from 'react';
import { INSTALLATION_LINK } from '../constants';
import { LinkElement } from '../types';
import { ChevronRight, ExternalLink, HardDrive, Zap, Home, Building2, ShieldCheck, User, Info } from 'lucide-react';

const InstallationScheme: React.FC = () => {
  const [selected, setSelected] = useState<LinkElement | null>(null);
  const [typology, setTypology] = useState<'single' | 'building'>('building');

  // Filtrar elementos según tipología (En unifamiliar no hay LGA)
  const filteredPath = typology === 'single' 
    ? INSTALLATION_LINK.filter(item => item.id !== 'lga' && item.id !== 'red')
    : INSTALLATION_LINK;

  const getOwnershipIcon = (id: string) => {
    if (['red', 'acom'].includes(id)) return <Building2 size={12} className="text-blue-400" />;
    return <User size={12} className="text-orange-400" />;
  };

  return (
    <div className="p-6 md:p-12 flex flex-col bg-slate-900 min-h-full tab-content-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-800 pb-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">
            La Ruta de la Energía <span className="text-orange-500 font-mono-tech not-italic">REBT</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Esquema técnico interactivo de la Instalación de Enlace (ITC-BT-12 a 17). 
            Representa el camino eléctrico desde la red pública hasta el consumo privado.
          </p>
        </div>
        
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button 
            onClick={() => setTypology('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${typology === 'single' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home size={14} /> Unifamiliar (CPM)
          </button>
          <button 
            onClick={() => setTypology('building')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${typology === 'building' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Building2 size={14} /> Edificio (LGA)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Diagrama de Flujo Vertical */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full space-y-1">
            {filteredPath.map((item, index) => (
              <div key={item.id} className="flex flex-col items-center">
                <button
                  onClick={() => setSelected(item)}
                  className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300
                    ${selected?.id === item.id 
                      ? 'bg-slate-800 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)] z-10' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${selected?.id === item.id ? 'bg-orange-500 scale-110 shadow-lg shadow-orange-500/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                       {item.id === 'cgmp' ? <HardDrive size={22} className="text-white" /> : <Zap size={22} className="text-white" />}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.acronym}</span>
                        {getOwnershipIcon(item.id)}
                      </div>
                      <div className="text-sm font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">{item.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-600 font-bold group-hover:text-slate-400">{item.itc}</span>
                    <ChevronRight size={18} className={`text-slate-700 transition-all ${selected?.id === item.id ? 'rotate-90 text-orange-500' : 'group-hover:translate-x-1'}`} />
                  </div>
                </button>
                
                {index < filteredPath.length - 1 && (
                  <div className="h-8 w-1 bg-slate-800 relative">
                    <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-6 text-[9px] font-black uppercase tracking-tighter text-slate-600 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Distribuidora</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Usuario / Comunidad</div>
          </div>
        </div>

        {/* Panel de Detalles Técnicos Dinámico */}
        <div className="lg:col-span-7 h-full">
          {selected ? (
            <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl sticky top-6 animate-in slide-in-from-right-4 duration-300 overflow-hidden">
              {/* Decoración Fondo */}
              <div className="absolute -top-20 -right-20 text-slate-900 pointer-events-none opacity-20">
                <Zap size={300} strokeWidth={0.5} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-white italic">{selected.name}</h3>
                    <div className="flex gap-3 mt-2">
                      <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-3 py-1 rounded-full border border-orange-500/30 uppercase tracking-widest">{selected.itc}</span>
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Boundary: {selected.acronym}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl mb-8 shadow-inner">
                  <p className="text-slate-300 text-sm leading-relaxed font-medium italic border-l-4 border-orange-500 pl-6">
                    {selected.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <ExternalLink size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Especificaciones de Lámina</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {selected.details.map((detail, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 hover:border-slate-600 transition-all group/item">
                        <div className="w-2 h-2 rounded-full bg-orange-500 group-hover/item:scale-125 transition-transform"></div>
                        <span className="text-sm text-slate-200 font-mono-tech leading-snug">{detail}</span>
                      </div>
                    ))}
                  </div>

                  {selected.id === 'lga' && (
                    <div className="mt-8 p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Info size={14} className="text-blue-400" />
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Dimensionamiento Crítico</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold">
                        El REBT prohibe estrictamente el uso de empalmes en la LGA para evitar puntos de resistencia térmica elevados en el patinillo del edificio.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[40px] p-12 text-center opacity-50 bg-slate-950/20">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Zap size={40} className="text-slate-600" />
              </div>
              <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest italic">Selector de Elementos</h4>
              <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto">Seleccione un componente del diagrama de la izquierda para visualizar los datos técnicos del reglamento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallationScheme;

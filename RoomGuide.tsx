import React, { useState } from 'react';
import { ROOM_GUIDE, ALL_CIRCUITS } from '../constants';
import { ElectrificationLevel, CircuitDef } from '../types';
import { Layout, ShieldAlert, Droplets, Ruler, FileCode, Check, X, Info, Zap, Settings, ArrowRight, Printer } from 'lucide-react';

const RoomGuide: React.FC = () => {
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [showUnifilar, setShowUnifilar] = useState(false);
  const [elecLevel, setElecLevel] = useState<ElectrificationLevel>('basic');
  const [selectedCircuits, setSelectedCircuits] = useState<string[]>(['C1', 'C2', 'C3', 'C4', 'C5']);
  
  const room = ROOM_GUIDE[activeRoomIndex];

  const handleToggleCircuit = (id: string) => {
    if (selectedCircuits.includes(id)) {
      setSelectedCircuits(selectedCircuits.filter(c => c !== id));
    } else {
      const newCircuits = [...selectedCircuits, id].sort((a, b) => {
        const numA = parseInt(a.replace('C', ''));
        const numB = parseInt(b.replace('C', ''));
        return numA - numB;
      });
      setSelectedCircuits(newCircuits);
    }
  };

  const currentCircuits = ALL_CIRCUITS.filter(c => 
    elecLevel === 'elevated' ? true : !c.isElevatedOnly
  );

  return (
    <div className="p-8 bg-slate-900 min-h-full tab-content-enter">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 italic tracking-tight">
            <Layout className="text-orange-500" />
            Dotación y Esquemas ITC-BT-25
          </h2>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Configuración reglamentaria de circuitos por estancia</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex shadow-inner">
            <button
              onClick={() => { setElecLevel('basic'); setSelectedCircuits(['C1', 'C2', 'C3', 'C4', 'C5']); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${elecLevel === 'basic' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Electr. Básica
            </button>
            <button
              onClick={() => setElecLevel('elevated')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${elecLevel === 'elevated' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Electr. Elevada
            </button>
          </div>
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex shadow-inner">
            {ROOM_GUIDE.map((r, idx) => (
              <button
                key={r.room}
                onClick={() => setActiveRoomIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeRoomIndex === idx ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {r.room}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Tabla Dotación */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-8 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">{room.room}: Mínimos Exigidos</h3>
              <button 
                onClick={() => setShowUnifilar(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl shadow-orange-600/20"
              >
                <FileCode size={16} /> Generar Esquema Pro
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[9px] uppercase tracking-widest">
                  <th className="p-6 font-black border-b border-slate-900/50">Circuito</th>
                  <th className="p-6 font-black border-b border-slate-900/50">Servicio</th>
                  <th className="p-6 font-black border-b border-slate-900/50">Protección</th>
                  <th className="p-6 font-black border-b border-slate-900/50">Dotación Mín.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {room.sockets.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-900/30 transition-all">
                    <td className="p-6"><span className="font-mono-tech text-blue-400 font-bold bg-blue-400/5 px-2 py-1 rounded border border-blue-400/20">{s.circuit}</span></td>
                    <td className="p-6 text-slate-100 font-bold text-sm">{s.description}</td>
                    <td className="p-6 text-slate-400 font-mono-tech text-xs">{s.ampere}A / {s.section}mm²</td>
                    <td className="p-6"><span className="text-orange-500 font-black text-lg">{s.count}</span> <span className="text-[9px] text-slate-600 font-bold uppercase">mecanismos</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-[32px] p-8">
            <h4 className="text-white text-xs font-black uppercase mb-6 flex items-center gap-3 tracking-[0.2em]">Selección de Circuitos para Unifilar</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentCircuits.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleToggleCircuit(c.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    selectedCircuits.includes(c.id) 
                    ? 'bg-blue-600 border-blue-400 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono-tech font-bold text-[10px]">{c.id}</span>
                  <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Lateral */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-[32px] shadow-xl">
            <h4 className="text-white text-xs font-black uppercase mb-6 flex items-center gap-2 tracking-widest text-orange-500">
              <ShieldAlert size={16} /> Seguridad Crítica
            </h4>
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-orange-500/40 pl-4">{room.safetyNote}</p>
              {room.volumes && room.volumes.map((v, i) => (
                <div key={i} className="flex items-center gap-3 text-[10px] text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                  <Droplets size={12} className="text-blue-400" /> {v}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-[32px] shadow-xl">
             <h4 className="text-white text-xs font-black uppercase mb-6 flex items-center gap-2 tracking-widest text-blue-500">
              <Ruler size={16} /> Montaje (Lámina)
            </h4>
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <p className="text-[11px] text-slate-300 font-mono-tech leading-relaxed whitespace-pre-line">{room.heights}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ESQUEMA TÉCNICO PROFESIONAL */}
      {showUnifilar && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white text-slate-900 w-full max-w-[1200px] h-[95vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden relative border-8 border-slate-200">
            {/* Header Blueprint */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b-2 border-slate-700">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Esquema Unifilar General <span className="text-orange-500">ITC-BT-25</span></h3>
                <p className="text-[9px] font-mono-tech text-slate-400 mt-1 uppercase tracking-widest">Proyecto Técnico: Vivienda con Electrificación {elecLevel === 'basic' ? 'Básica' : 'Elevada'}</p>
              </div>
              <button onClick={() => setShowUnifilar(false)} className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Contenedor del Dibujo Técnico */}
            <div className="flex-grow p-10 overflow-auto bg-[#fdfdfd] flex items-start justify-center">
              <div className="flex flex-col items-center w-full min-w-[1000px] pb-20">
                
                {/* 1. IGA y Sobretensiones */}
                <div className="flex flex-col items-center mb-0">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 font-mono-tech">ENTRADA DERIVACIÓN INDIVIDUAL</div>
                  <div className="w-0.5 h-12 bg-slate-900"></div>
                  <div className="flex gap-16 items-start">
                    {/* IGA */}
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-32 border-2 border-slate-900 rounded-sm flex flex-col items-center justify-center relative p-2 bg-white shadow-sm">
                         <span className="text-[9px] font-black uppercase mb-1">IGA</span>
                         {/* Símbolo IGA */}
                         <div className="relative w-8 h-12 border-l-2 border-slate-900">
                           <div className="absolute top-2 -left-1 w-2 h-0.5 bg-slate-900"></div>
                           <div className="absolute top-2 left-0 w-8 h-0.5 bg-slate-900 origin-left -rotate-45"></div>
                           <div className="absolute bottom-2 -left-2 w-4 h-4 rounded-full border border-slate-900 opacity-20"></div>
                         </div>
                         <span className="text-xs font-black mt-2 font-mono-tech">{elecLevel === 'basic' ? '25A' : '40A'}</span>
                      </div>
                    </div>
                    {/* PCS */}
                    <div className="flex flex-col items-center pt-8">
                       <div className="w-16 h-16 border-2 border-slate-400 border-dashed flex flex-col items-center justify-center p-2 bg-slate-50">
                          <Zap size={16} className="text-slate-400" />
                          <span className="text-[7px] font-black text-slate-400 mt-1 uppercase">PCS</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="w-0.5 h-10 bg-slate-900"></div>

                {/* 2. DIFERENCIAL(ES) */}
                <div className="w-40 h-28 border-2 border-slate-900 flex flex-col items-center justify-center p-4 bg-white shadow-sm relative">
                  <span className="text-[9px] font-black uppercase mb-1">ID (Clase A)</span>
                  <div className="w-12 h-10 relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center">
                       <div className="w-4 h-0.5 bg-slate-900 rotate-45"></div>
                    </div>
                    <div className="absolute -right-2 top-0 bg-slate-900 text-white text-[7px] px-1 font-bold">T</div>
                  </div>
                  <span className="text-xs font-black mt-1 font-mono-tech">40A / 30mA</span>
                </div>

                {/* 3. EMBARRADO HORIZONTAL (Línea de distribución) */}
                <div className="w-full h-0.5 bg-slate-900 mt-10 mb-0 relative">
                  <div className="absolute -top-1 left-0 w-full h-px bg-slate-300"></div>
                </div>

                {/* 4. DERIVACIONES PIAs DINÁMICAS */}
                <div className="flex justify-between w-full px-4 items-start pt-0">
                  {selectedCircuits.map((cid, idx) => {
                    const c = ALL_CIRCUITS.find(item => item.id === cid);
                    if (!c) return null;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 min-w-[110px]">
                        <div className="w-0.5 h-10 bg-slate-900"></div>
                        {/* El PIA */}
                        <div className="w-20 h-32 border-2 border-slate-900 bg-white flex flex-col items-center p-3 relative group hover:bg-slate-50 transition-colors">
                           <span className="text-[9px] font-black mb-2 text-slate-500">{c.id}</span>
                           <div className="w-6 h-10 border-l-2 border-slate-900 relative">
                             <div className="absolute top-2 left-0 w-8 h-0.5 bg-slate-900 origin-left -rotate-45"></div>
                           </div>
                           <div className="text-center mt-4">
                             <div className="text-xs font-black font-mono-tech">{c.ampere}A</div>
                             <div className="text-[7px] font-bold text-slate-400 mt-1 uppercase">P. Corte 4.5kA</div>
                           </div>
                        </div>

                        {/* Línea de Cable y Tubo (Detalle técnico de la imagen) */}
                        <div className="w-0.5 h-12 bg-slate-900 relative">
                          {/* Trazos oblicuos (///) */}
                          <div className="absolute top-4 -left-4 w-8 h-4 flex gap-1 items-center justify-center">
                             <div className="w-px h-3 bg-slate-900 rotate-45"></div>
                             <div className="w-px h-3 bg-slate-900 rotate-45"></div>
                             <div className="w-px h-3 bg-slate-900 rotate-45"></div>
                          </div>
                        </div>

                        {/* Especificaciones de Cable/Tubo */}
                        <div className="text-center space-y-1">
                          <div className="text-[9px] font-mono-tech font-bold text-slate-700 whitespace-nowrap">{c.cableComposition}</div>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[12px] font-bold">∅</span>
                            <span className="text-[10px] font-mono-tech font-bold">{c.conduitSize}</span>
                          </div>
                          <div className="text-[8px] font-black uppercase text-slate-400 mt-2 leading-tight px-1">{c.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cajetín Profesional */}
            <div className="bg-slate-100 border-t-2 border-slate-300 p-8 grid grid-cols-4 gap-4">
              <div className="border-r-2 border-slate-200 pr-4">
                <span className="text-[8px] font-black text-slate-400 uppercase">Instalador Autorizado</span>
                <p className="text-[10px] font-bold text-slate-900">REBT-PRO AUTOMATED ENGINE</p>
                <p className="text-[8px] text-slate-500 font-mono-tech mt-1">Licencia: #A-77421-2024</p>
              </div>
              <div className="border-r-2 border-slate-200 pr-4">
                <span className="text-[8px] font-black text-slate-400 uppercase">Normativa de Referencia</span>
                <p className="text-[10px] font-bold text-slate-900 uppercase">ITC-BT-25 / GUÍA TÉCNICA</p>
                <p className="text-[8px] text-slate-500 font-mono-tech mt-1">Ministerio de Industria, Comercio y Turismo</p>
              </div>
              <div className="border-r-2 border-slate-200 pr-4">
                <span className="text-[8px] font-black text-slate-400 uppercase">Especificación Cables</span>
                <p className="text-[10px] font-bold text-slate-900">CU H07Z1-K (AS)</p>
                <p className="text-[8px] text-slate-500 font-mono-tech mt-1">LIBRE DE HALÓGENOS</p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-900 text-white p-3 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase shadow-lg hover:bg-slate-800 transition-all"
                >
                  <Printer size={16} /> Imprimir Plano
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomGuide;

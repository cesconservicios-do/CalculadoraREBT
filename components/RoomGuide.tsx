import React, { useState } from 'react';
import { ROOM_GUIDE, ALL_CIRCUITS } from '../constants';
import { ElectrificationLevel } from '../types';
import { Layout, ShieldAlert, Droplets, Ruler, FileCode } from 'lucide-react';
import UnifilarPro from './UnifilarPro';

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
            <div className="p-5 md:p-8 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">{room.room}: Mínimos Exigidos</h3>
              <button
                onClick={() => setShowUnifilar(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl shadow-orange-600/20"
              >
                <FileCode size={16} /> Generar Esquema Pro
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[560px]">
              <thead>
                <tr className="text-slate-500 text-[9px] uppercase tracking-widest">
                  <th className="p-4 md:p-6 font-black border-b border-slate-900/50">Circuito</th>
                  <th className="p-4 md:p-6 font-black border-b border-slate-900/50">Servicio</th>
                  <th className="p-4 md:p-6 font-black border-b border-slate-900/50">Protección</th>
                  <th className="p-4 md:p-6 font-black border-b border-slate-900/50">Dotación Mín.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {room.sockets.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-900/30 transition-all">
                    <td className="p-4 md:p-6"><span className="font-mono-tech text-blue-400 font-bold bg-blue-400/5 px-2 py-1 rounded border border-blue-400/20">{s.circuit}</span></td>
                    <td className="p-4 md:p-6 text-slate-100 font-bold text-sm">{s.description}</td>
                    <td className="p-4 md:p-6 text-slate-400 font-mono-tech text-xs">{s.ampere}A / {s.section}mm²</td>
                    <td className="p-4 md:p-6"><span className="text-orange-500 font-black text-lg">{s.count}</span> <span className="text-[9px] text-slate-600 font-bold uppercase">mecanismos</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
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

      {showUnifilar && (
        <UnifilarPro
          initialCircuits={selectedCircuits}
          initialElectrification={elecLevel}
          onClose={() => setShowUnifilar(false)}
        />
      )}
    </div>
  );
};

export default RoomGuide;

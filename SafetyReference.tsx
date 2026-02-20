
import React from 'react';
import { ShieldCheck, Zap, Award, Info, Box, Droplets, Hammer, Maximize } from 'lucide-react';

const SafetyReference: React.FC = () => {
  return (
    <div className="p-8 md:p-12 space-y-16 bg-slate-900 min-h-full tab-content-enter">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-black text-white tracking-tight mb-3 italic">Manual de Seguridad REBT</h2>
        <div className="h-1 w-20 bg-orange-500 mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Guía visual de protección mecánica y clases de aislamiento reglamentarias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Grados IP/IK */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <ShieldCheck className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Códigos de Envolvente</h3>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <span className="font-black tracking-widest text-xs">CÓDIGO IP (IEC 60529)</span>
              <Info size={16} className="opacity-50" />
            </div>
            <div className="p-8 space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-blue-500 shadow-inner">1º</div>
                <div>
                  <h4 className="text-slate-100 font-bold text-sm mb-1">Protección contra Sólidos</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">
                    IP4X: Contra objetos > 1.0mm. Requisito mín. en canalizaciones residenciales.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-blue-500 shadow-inner">2º</div>
                <div>
                  <h4 className="text-slate-100 font-bold text-sm mb-1">Protección contra Líquidos</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">
                    IPX4: Contra proyecciones de agua. Obligatorio en Baños (Zonas 1/2) y Exterior.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="bg-orange-600 p-5 text-white flex justify-between items-center">
              <span className="font-black tracking-widest text-xs">CÓDIGO IK (EN 62262)</span>
              <Hammer size={16} className="opacity-50" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-5 gap-3 mb-6">
                {[5, 7, 8, 9, 10].map(n => (
                  <div key={n} className={`h-14 rounded-xl border flex flex-col items-center justify-center gap-1 ${n >= 8 ? 'bg-orange-500/10 border-orange-500/40 text-orange-500' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                    <span className="text-xs font-black">{n < 10 ? `0${n}` : n}</span>
                    <span className="text-[7px] font-bold uppercase tracking-tighter">IK{n < 10 ? `0${n}` : n}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500"><Zap size={20} /></div>
                <div>
                  <div className="text-white text-[10px] font-black uppercase">REBT ITC-BT-13</div>
                  <p className="text-[9px] text-slate-500">CGP requiere resistencia IK08 mín (5 Julios de energía de impacto).</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alturas y Aislamientos */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Award className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Alturas Reglamentarias</h3>
          </div>

          <div className="bg-slate-800/20 p-8 rounded-[32px] border border-slate-800 space-y-6">
            <div className="flex justify-between items-center bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Centralización Contadores</span>
              <span className="font-mono-tech text-blue-500 text-xs font-black">0.70m — 1.80m</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Cuadro General (CGMP)</span>
              <span className="font-mono-tech text-blue-500 text-xs font-black">1.40m — 2.00m</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Cajas de Empalme</span>
              <span className="font-mono-tech text-blue-500 text-xs font-black">Mín. 0.30m del techo</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Tomas de Corriente (Vivienda)</span>
              <span className="font-mono-tech text-blue-500 text-xs font-black">> 0.30m del suelo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-950 rounded-2xl border-l-4 border-blue-500">
              <div className="text-blue-400 text-[10px] font-black uppercase mb-2">Clase I</div>
              <p className="text-[10px] text-slate-500">Requiere conexión a tierra. P.e.: Carcasa metálica de electrodomésticos.</p>
            </div>
            <div className="p-6 bg-slate-950 rounded-2xl border-l-4 border-orange-500">
              <div className="text-orange-400 text-[10px] font-black uppercase mb-2">Clase II</div>
              <p className="text-[10px] text-slate-500">Doble aislamiento. No requiere toma de tierra. Máxima seguridad.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SafetyReference;

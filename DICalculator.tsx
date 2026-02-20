import React, { useState, useMemo } from 'react';
import { CABLE_SECTIONS, CONDUCTIVITY, NORMALIZED_POWERS_MONO, NORMALIZED_POWERS_TRI } from '../constants';
import { CalculationResult, LocationType, PhaseType, ConductorMaterial, InsulationType } from '../types';
import { Calculator, CheckCircle2, AlertTriangle, Cpu, Zap, Thermometer, Layers, Keyboard, Info } from 'lucide-react';

const DICalculator: React.FC = () => {
  const [phase, setPhase] = useState<PhaseType>('monophasic');
  const [power, setPower] = useState<number>(5750);
  const [length, setLength] = useState<number>(25);
  const [location, setLocation] = useState<LocationType>('centralized');
  const [material, setMaterial] = useState<ConductorMaterial>('Cu');
  const [insulation, setInsulation] = useState<InsulationType>('XLPE');
  const [isManualPower, setIsManualPower] = useState(false);

  const voltage = phase === 'monophasic' ? 230 : 400;

  const result = useMemo((): CalculationResult => {
    let limitPct = 1;
    if (location === 'partial') limitPct = 0.5;
    if (location === 'single') limitPct = 1.5;

    const limitV = (limitPct / 100) * voltage;
    const currentConductivity = CONDUCTIVITY[material][insulation];
    
    // Sección mínima por REBT ITC-BT-15 (Cu: 6mm, Al: 16mm)
    const minSectionREBT = material === 'Cu' ? 6 : 16;
    const filteredSections = CABLE_SECTIONS.filter(s => s >= minSectionREBT);

    let chosenSection = filteredSections[0];
    let dV_V = 0;
    let dV_Pct = 0;

    for (const s of filteredSections) {
      chosenSection = s;
      // Formula Caída Tensión (Monofásica: 2*L*P / (gamma*S*V) | Trifásica: L*P / (gamma*S*V))
      const factor = phase === 'monophasic' ? 2 : 1;
      dV_V = (factor * length * power) / (currentConductivity * s * voltage);
      dV_Pct = (dV_V / voltage) * 100;
      if (dV_V <= limitV) break;
    }

    return {
      section: chosenSection,
      voltageDropV: dV_V,
      voltageDropPercent: dV_Pct,
      limitV: limitV,
      limitPercent: limitPct,
      isWithinLimit: dV_V <= limitV,
      power,
      length,
      phase,
      voltage,
      conductivity: currentConductivity
    };
  }, [power, length, location, phase, material, insulation]);

  const powerOptions = phase === 'monophasic' ? NORMALIZED_POWERS_MONO : NORMALIZED_POWERS_TRI;

  return (
    <div className="p-6 md:p-10 bg-slate-900 min-h-full tab-content-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <Calculator className="text-orange-500 w-8 h-8" />
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Calculadora DI Pro</h2>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-widest">ITC-BT-15</span>
          <span className="text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full uppercase tracking-widest">Manual Técnico</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          {/* Configuración de Cable y Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                <Zap size={12} className="text-blue-500" /> Sistema
              </label>
              <div className="flex gap-2">
                {['monophasic', 'triphasic'].map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPhase(p as PhaseType); setIsManualPower(false); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition-all border ${phase === p ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                  >
                    {p === 'monophasic' ? 'Mono (230V)' : 'Tri (400V)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                <Thermometer size={12} className="text-orange-500" /> Aislamiento
              </label>
              <div className="flex gap-2">
                {['XLPE', 'PVC'].map((i) => (
                  <button
                    key={i}
                    onClick={() => setInsulation(i as InsulationType)}
                    className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition-all border ${insulation === i ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                  >
                    {i} ({i === 'XLPE' ? '90ºC' : '70ºC'})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
              <Layers size={12} className="text-slate-400" /> Material Conductor
            </label>
            <div className="flex gap-2">
              {['Cu', 'Al'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMaterial(m as ConductorMaterial)}
                  className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition-all border ${material === m ? 'bg-slate-200 border-white text-slate-900 shadow-lg shadow-white/5' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                >
                  {m === 'Cu' ? 'Cobre (Cu)' : 'Aluminio (Al)'}
                </button>
              ))}
            </div>
          </div>

          {/* Selección de Potencia */}
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Potencia Activa (W)</label>
              <button 
                onClick={() => setIsManualPower(!isManualPower)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase transition-all ${isManualPower ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-950 border-slate-700 text-slate-500 hover:text-slate-300'}`}
              >
                <Keyboard size={12} /> {isManualPower ? 'Potencia Libre' : 'Usar Manual'}
              </button>
            </div>

            {!isManualPower ? (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {powerOptions.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPower(p)}
                    className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${power === p ? 'bg-orange-500 border-orange-400 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                  >
                    {(p/1000).toFixed(2)}kW
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative mb-4 group">
                <input 
                  type="number" 
                  value={power} 
                  onChange={e => setPower(Number(e.target.value))}
                  placeholder="Ingrese vatios (W)..."
                  className="w-full bg-slate-950 border-2 border-orange-500/30 focus:border-orange-500 p-5 rounded-xl text-3xl font-mono-tech text-orange-500 focus:outline-none transition-all shadow-inner"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 font-black pointer-events-none">W</div>
              </div>
            )}
          </div>

          {/* Longitud Slider */}
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <div className="flex justify-between mb-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Longitud de Línea</label>
              <span className="font-mono-tech text-orange-500 font-bold">{length}m</span>
            </div>
            <input 
              type="range" min="1" max="300" value={length} 
              onChange={e => setLength(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
          
          {/* Ubicación Config */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'centralized', l: '1%', t: 'Cont. Centr.' },
              { id: 'partial', l: '0.5%', t: 'Parcial' },
              { id: 'single', l: '1.5%', t: 'Cont. Individual' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setLocation(opt.id as LocationType)}
                className={`p-3 rounded-xl border text-[9px] font-black transition-all leading-tight ${location === opt.id ? 'bg-slate-700 border-blue-500 text-white shadow-xl shadow-blue-500/10' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
              >
                {opt.t}<br/><span className="opacity-50 font-mono-tech">{opt.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resultados Técnicos */}
        <div className="space-y-6">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-8 right-10 text-slate-800 group-hover:text-blue-500/10 transition-colors duration-700">
              <Cpu size={140} strokeWidth={0.5} />
            </div>
            
            <div className="text-center mb-12 relative z-10">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] block mb-4">Sección Reglamentaria S</span>
              <div className="text-9xl font-black font-mono-tech text-white inline-flex items-baseline gap-2">
                {result.section}
                <span className="text-2xl text-orange-500 font-bold uppercase">mm²</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold mt-4 uppercase">ITC-BT-19 Table Reference (γ={result.conductivity})</p>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-8 relative z-10">
              <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-3xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Caída de Tensión</span>
                <div className="text-3xl font-mono-tech font-bold text-white">{result.voltageDropV.toFixed(2)}V</div>
                <div className={`text-sm font-black flex items-center gap-1.5 mt-1 ${result.isWithinLimit ? 'text-green-500' : 'text-red-500'}`}>
                  {result.isWithinLimit ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {result.voltageDropPercent.toFixed(3)}%
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-3xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Límite Normativo</span>
                <div className="text-3xl font-mono-tech font-bold text-slate-400">{result.limitV.toFixed(2)}V</div>
                <div className="text-xs text-slate-500 font-bold mt-1">Máx. {result.limitPercent}%</div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl flex items-center justify-center gap-4 border-2 transition-all duration-500 ${result.isWithinLimit ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {result.isWithinLimit ? <CheckCircle2 className="animate-pulse" /> : <AlertTriangle className="animate-bounce" />}
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                {result.isWithinLimit ? 'Cumple Parámetros REBT' : 'Sección Insuficiente (Límite)'}
              </span>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-900 grid grid-cols-2 gap-6 relative z-10">
               <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase block mb-3 tracking-widest">Nomenclatura CPR</span>
                 <div className="text-[11px] text-blue-400 font-mono-tech bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 leading-relaxed">
                   {insulation === 'XLPE' ? 'RZ1-K (AS) 0.6/1kV' : 'H07V-K / H07Z1-K'}<br/>
                   <span className="text-[8px] text-slate-500 font-sans italic opacity-80">Libre de halógenos y no propagador</span>
                 </div>
               </div>
               <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase block mb-3 tracking-widest">Fusible de Seguridad</span>
                 <div className="text-[11px] text-orange-400 font-mono-tech bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 leading-relaxed">
                   Talla NH00 / Cilíndrico<br/>
                   Clase gG: {(power/(voltage * (phase === 'triphasic' ? Math.sqrt(3) : 1)) * 1.1).toFixed(0)}A mín.
                 </div>
               </div>
            </div>
            
            <div className="mt-6 flex items-start gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
               <Info size={16} className="text-slate-500 mt-1 flex-shrink-0" />
               <p className="text-[9px] text-slate-400 leading-relaxed">
                 * El cálculo utiliza la conductividad γ corregida por temperatura de servicio ({CONDUCTIVITY[material][insulation]} m/Ω·mm²) según tablas del manual adjunto. Para conductores de Al, el REBT exige un mínimo de 16 mm² por resistencia mecánica.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DICalculator;
import React, { useMemo, useState } from 'react';
import { ALL_CIRCUITS, NORMALIZED_CALIBRES_PIA, NORMALIZED_CALIBRES_ID } from '../constants';
import { PIACurve, IDClass, PhaseType } from '../types';
import { Shield, Plus, Trash2, CheckCircle2, AlertTriangle, XCircle, Gauge, Zap } from 'lucide-react';

interface BoardCircuit {
  id: string;
  circuitId: string;
  circuitName: string;
  power: number;
  voltage: number;
  phase: PhaseType;
  cosPhi: number;
  cableAmpacity: number;
  curve: PIACurve;
  groupIndex: 0 | 1;
}

interface GroupConfig {
  sensitivity: 30 | 300;
  idClass: IDClass;
  idAmpere: number;
}

const nextCalibre = (value: number, calibres: readonly number[]): number => {
  const found = calibres.find(c => c >= value);
  return found ?? calibres[calibres.length - 1];
};

// cos φ = 0 o negativo produciría Infinity/NaN en I = P/(V·cosφ); un factor de
// potencia real nunca baja de este orden de magnitud en cargas eléctricas.
const safeCosPhi = (value: number): number => Math.max(value, 0.1);

const ProtectionCalculator: React.FC = () => {
  const [installationType, setInstallationType] = useState<'vivienda' | 'local'>('vivienda');
  const [numGroups, setNumGroups] = useState<1 | 2>(1);

  const defaultCircuit = ALL_CIRCUITS[0];
  const [circuitId, setCircuitId] = useState<string>(defaultCircuit.id);
  const [power, setPower] = useState<number>(Math.round(defaultCircuit.ampere * 230 * 0.9));
  const [phase, setPhase] = useState<PhaseType>('monophasic');
  const [cosPhi, setCosPhi] = useState<number>(0.9);
  const [cableAmpacity, setCableAmpacity] = useState<number>(defaultCircuit.ampere);
  const [curve, setCurve] = useState<PIACurve>(defaultCircuit.recommendedCurve ?? 'B');
  const [groupIndex, setGroupIndex] = useState<0 | 1>(0);

  const [board, setBoard] = useState<BoardCircuit[]>([]);
  const [groupConfigs, setGroupConfigs] = useState<GroupConfig[]>([
    { sensitivity: 30, idClass: 'A', idAmpere: 40 },
    { sensitivity: 30, idClass: 'A', idAmpere: 40 }
  ]);

  const selectedCircuitDef = ALL_CIRCUITS.find(c => c.id === circuitId);

  const handleSelectCircuit = (id: string) => {
    setCircuitId(id);
    const def = ALL_CIRCUITS.find(c => c.id === id);
    if (def) {
      setCableAmpacity(def.ampere);
      setCurve(def.recommendedCurve ?? 'B');
      setPower(Math.round(def.ampere * 230 * 0.9));
      setPhase('monophasic');
    }
  };

  const voltage = phase === 'monophasic' ? 230 : 400;

  const iB = useMemo(() => {
    const phi = safeCosPhi(cosPhi);
    if (phase === 'monophasic') return power / (voltage * phi);
    return power / (voltage * Math.sqrt(3) * phi);
  }, [power, voltage, cosPhi, phase]);

  const recommendedPIA = useMemo(() => nextCalibre(iB, NORMALIZED_CALIBRES_PIA), [iB]);
  const isCoordinated = recommendedPIA <= cableAmpacity;
  const usagePercent = (iB / recommendedPIA) * 100;
  const minBreakingCapacity = installationType === 'vivienda' ? '4.5kA' : '6kA';

  const status: 'green' | 'yellow' | 'red' = !isCoordinated
    ? 'red'
    : usagePercent > 80
    ? 'yellow'
    : 'green';

  const addToBoard = () => {
    setBoard(prev => [
      ...prev,
      {
        id: `${Date.now()}`,
        circuitId,
        circuitName: selectedCircuitDef?.name ?? 'Manual',
        power,
        voltage,
        phase,
        cosPhi,
        cableAmpacity,
        curve,
        groupIndex
      }
    ]);
  };

  const removeFromBoard = (id: string) => {
    setBoard(prev => prev.filter(b => b.id !== id));
  };

  const computeRow = (row: BoardCircuit) => {
    const rowPhi = safeCosPhi(row.cosPhi);
    const rowIB = row.phase === 'monophasic'
      ? row.power / (row.voltage * rowPhi)
      : row.power / (row.voltage * Math.sqrt(3) * rowPhi);
    const rowPIA = nextCalibre(rowIB, NORMALIZED_CALIBRES_PIA);
    const rowCoordinated = rowPIA <= row.cableAmpacity;
    const rowUsage = (rowIB / rowPIA) * 100;
    return { rowIB, rowPIA, rowCoordinated, rowUsage };
  };

  const groupSums = useMemo(() => {
    const sums = [0, 0];
    board.forEach(row => {
      const { rowPIA } = computeRow(row);
      sums[row.groupIndex] += rowPIA;
    });
    return sums;
  }, [board]);

  const updateGroupConfig = (idx: number, patch: Partial<GroupConfig>) => {
    setGroupConfigs(prev => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const statusStyles = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', Icon: CheckCircle2 },
    yellow: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', Icon: AlertTriangle },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', Icon: XCircle }
  } as const;
  const S = statusStyles[status];

  const availableCircuits = ALL_CIRCUITS;

  return (
    <div className="p-6 md:p-10 bg-slate-900 min-h-full tab-content-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-orange-500 w-8 h-8" />
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Calculadora de Protecciones</h2>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-widest">ITC-BT-22/23/25</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Panel izquierdo: configuración */}
        <div className="space-y-6">
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Tipo de instalación</label>
            <div className="flex gap-2">
              {(['vivienda', 'local'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setInstallationType(t)}
                  className={`flex-1 py-2 rounded-lg font-bold text-[10px] uppercase transition-all border ${installationType === t ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Selector de circuito (ITC-BT-25)</label>
            <div className="grid grid-cols-4 gap-2">
              {availableCircuits.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCircuit(c.id)}
                  className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${circuitId === c.id ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                >
                  {c.id}
                </button>
              ))}
            </div>
            {selectedCircuitDef && (
              <p className="text-[10px] text-slate-500 mt-3 italic">{selectedCircuitDef.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Potencia (W)</label>
              <input
                type="number"
                value={power}
                onChange={e => setPower(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 p-3 rounded-xl text-white text-base focus:outline-none"
              />
            </div>
            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Sistema</label>
              <div className="flex gap-2">
                {(['monophasic', 'triphasic'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPhase(p)}
                    className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition-all border ${phase === p ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                  >
                    {p === 'monophasic' ? 'Mono' : 'Tri'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Cos φ</label>
              <input
                type="number" step="0.05" min="0.1" max="1" value={cosPhi}
                onChange={e => setCosPhi(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 p-3 rounded-xl text-white text-base focus:outline-none"
              />
            </div>
            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">I. admisible cable Iz (A)</label>
              <input
                type="number" value={cableAmpacity}
                onChange={e => setCableAmpacity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 p-3 rounded-xl text-white text-base focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Curva del PIA</label>
            <div className="flex gap-2">
              {(['B', 'C', 'D'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurve(c)}
                  className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition-all border ${curve === c ? 'bg-slate-200 border-white text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                >
                  Curva {c}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-2">B: alumbrado/doméstico. C: motores/arranques frecuentes. D: cargas muy inductivas.</p>
          </div>

          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Grupo diferencial</label>
            <div className="flex gap-2">
              {Array.from({ length: numGroups }, (_, i) => i as 0 | 1).map(g => (
                <button
                  key={g}
                  onClick={() => setGroupIndex(g)}
                  className={`flex-1 py-2 rounded-lg font-bold text-[10px] transition-all border ${groupIndex === g ? 'bg-violet-600 border-violet-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-500'}`}
                >
                  Grupo {g + 1}
                </button>
              ))}
              {numGroups === 1 && (
                <button
                  onClick={() => setNumGroups(2)}
                  className="px-3 rounded-lg text-[9px] font-bold border border-dashed border-slate-700 text-slate-500 hover:text-slate-300"
                >
                  + Añadir 2º grupo
                </button>
              )}
            </div>
          </div>

          <button
            onClick={addToBoard}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white py-3.5 rounded-2xl text-xs font-black uppercase transition-all shadow-xl shadow-orange-500/20"
          >
            <Plus size={16} /> Añadir al cuadro
          </button>
        </div>

        {/* Panel derecho: resultados con semáforo */}
        <div className="space-y-6">
          <div className={`bg-slate-950 border-2 ${S.border} rounded-[32px] p-8 shadow-2xl`}>
            <div className="flex items-center gap-3 mb-6">
              <Gauge className="text-slate-500" size={18} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Resultado del circuito</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">I. de diseño (I_B)</span>
                <div className="text-2xl font-mono-tech font-bold text-white">{iB.toFixed(2)}A</div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">PIA recomendado</span>
                <div className="text-2xl font-mono-tech font-bold text-orange-500">{recommendedPIA}A / {curve}</div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Iz cable</span>
                <div className="text-2xl font-mono-tech font-bold text-slate-300">{cableAmpacity}A</div>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/50">
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">% de uso</span>
                <div className="text-2xl font-mono-tech font-bold text-slate-300">{usagePercent.toFixed(0)}%</div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl flex items-center justify-center gap-3 border-2 ${S.bg} ${S.border} ${S.text}`}>
              <S.Icon size={20} />
              <span className="text-xs font-black uppercase tracking-[0.15em]">
                {status === 'red' && 'No cumple: I_B ≤ I_n ≤ I_z no se satisface'}
                {status === 'yellow' && 'Cumple, al límite de capacidad (>80%)'}
                {status === 'green' && 'Cumple parámetros de coordinación'}
              </span>
            </div>

            <p className="text-[9px] text-slate-500 mt-4 leading-relaxed">
              Poder de corte mínimo requerido para {installationType}: <span className="text-slate-300 font-bold">{minBreakingCapacity}</span>. Verificar que I₂ ≤ 1,45×Iz (garantizado por construcción en PIA UNE-EN 60898 cuando I_n ≤ Iz).
            </p>
          </div>

          {/* Configuración de diferenciales por grupo */}
          <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 space-y-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Zap size={14} /> Diferencial(es)</span>
            {Array.from({ length: numGroups }, (_, i) => i).map(g => {
              const cfg = groupConfigs[g];
              const sum = groupSums[g];
              const idOk = cfg.idAmpere >= sum;
              return (
                <div key={g} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-violet-400 uppercase">Grupo {g + 1}</span>
                    <span className="text-[9px] text-slate-500 font-mono-tech">Suma PIAs: {sum}A</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={cfg.sensitivity}
                      onChange={e => updateGroupConfig(g, { sensitivity: Number(e.target.value) as 30 | 300 })}
                      className="bg-slate-950 border border-slate-700 text-white text-[11px] rounded-lg p-2"
                    >
                      <option value={30}>30mA</option>
                      <option value={300}>300mA</option>
                    </select>
                    <select
                      value={cfg.idClass}
                      onChange={e => updateGroupConfig(g, { idClass: e.target.value as IDClass })}
                      className="bg-slate-950 border border-slate-700 text-white text-[11px] rounded-lg p-2"
                    >
                      <option value="A">Clase A</option>
                      <option value="AC">Clase AC</option>
                    </select>
                    <select
                      value={cfg.idAmpere}
                      onChange={e => updateGroupConfig(g, { idAmpere: Number(e.target.value) })}
                      className="bg-slate-950 border border-slate-700 text-white text-[11px] rounded-lg p-2"
                    >
                      {NORMALIZED_CALIBRES_ID.map(a => <option key={a} value={a}>{a}A</option>)}
                    </select>
                  </div>
                  <div className={`text-[9px] font-black uppercase flex items-center gap-2 ${idOk ? 'text-green-400' : 'text-red-400'}`}>
                    {idOk ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    {idOk ? 'ID cubre la suma de PIAs del grupo' : `ID insuficiente: requiere ≥${sum}A`}
                  </div>
                </div>
              );
            })}
            <p className="text-[8px] text-slate-600 leading-relaxed">
              Sensibilidad 30mA obligatoria para protección de personas en viviendas (ITC-BT-24/25). Clase A recomendada: detecta corrientes residuales pulsantes y continuas (cargadores VE, electrónica). El PIA debe disparar antes que el ID ante cortocircuito (coordinación de curvas).
            </p>
          </div>
        </div>
      </div>

      {/* Resumen del cuadro */}
      <div className="mt-10 bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden">
        <div className="p-6 bg-slate-900 border-b border-slate-800">
          <h3 className="text-white text-xs font-black uppercase tracking-widest">Resumen del cuadro</h3>
        </div>
        {board.length === 0 ? (
          <p className="text-slate-600 text-xs p-8 text-center italic">Aún no has añadido circuitos al cuadro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-slate-500 text-[9px] uppercase tracking-widest">
                  <th className="p-4 font-black border-b border-slate-900/50">Grupo</th>
                  <th className="p-4 font-black border-b border-slate-900/50">Circuito</th>
                  <th className="p-4 font-black border-b border-slate-900/50">PIA</th>
                  <th className="p-4 font-black border-b border-slate-900/50">Carga</th>
                  <th className="p-4 font-black border-b border-slate-900/50">% uso</th>
                  <th className="p-4 font-black border-b border-slate-900/50">Estado</th>
                  <th className="p-4 font-black border-b border-slate-900/50"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {board.map(row => {
                  const { rowPIA, rowCoordinated, rowUsage } = computeRow(row);
                  const rowStatus = !rowCoordinated ? 'red' : rowUsage > 80 ? 'yellow' : 'green';
                  const RS = statusStyles[rowStatus];
                  return (
                    <tr key={row.id} className="hover:bg-slate-900/30">
                      <td className="p-4 text-slate-300 text-xs font-bold">G{row.groupIndex + 1}</td>
                      <td className="p-4 text-slate-100 text-sm font-bold">{row.circuitName} <span className="text-slate-600 font-mono-tech text-[10px]">({row.circuitId})</span></td>
                      <td className="p-4 text-orange-400 font-mono-tech text-xs">{rowPIA}A / {row.curve}</td>
                      <td className="p-4 text-slate-400 font-mono-tech text-xs">{row.power}W</td>
                      <td className="p-4 text-slate-400 font-mono-tech text-xs">{rowUsage.toFixed(0)}%</td>
                      <td className="p-4"><RS.Icon size={16} className={RS.text} /></td>
                      <td className="p-4">
                        <button onClick={() => removeFromBoard(row.id)} aria-label="Eliminar circuito" className="text-slate-600 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectionCalculator;

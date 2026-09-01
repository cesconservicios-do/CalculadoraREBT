import React, { useMemo, useRef, useState } from 'react';
import { ALL_CIRCUITS, STORAGE_KEYS } from '../constants';
import { InstallerData, UnifilarConfig } from '../types';
import { FileCode, Printer, Download, Clipboard, X } from 'lucide-react';

const PAGE_W = 1122;
const PAGE_H = 794;
const MARGIN = 50;
const COLORS = {
  line: '#1e293b',
  iga: '#1d4ed8',
  id: '#7c3aed',
  pia: '#0f766e',
  pcs: '#b45309'
};

interface Props {
  initialCircuits?: string[];
  initialElectrification?: 'basic' | 'elevated';
  onClose?: () => void;
}

const readInstaller = (): InstallerData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTALLER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

interface BreakerBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  sublabel?: string;
  toroid?: boolean;
  dashed?: boolean;
}

const BreakerBox: React.FC<BreakerBoxProps> = ({ x, y, width, height, color, label, sublabel, toroid, dashed }) => (
  <g>
    <rect x={x} y={y} width={width} height={height} fill="#ffffff" stroke={color} strokeWidth={2}
      strokeDasharray={dashed ? '4 3' : undefined} rx={4} />
    <text x={x + width / 2} y={y + 15} textAnchor="middle" fontSize={9} fontWeight={900} fill={color} fontFamily="Arial, sans-serif">
      {label}
    </text>
    <line x1={x + width / 2} y1={y + 22} x2={x + width / 2} y2={y + height - (sublabel ? 26 : 12)} stroke={COLORS.line} strokeWidth={2} />
    <line x1={x + width / 2 - 9} y1={y + height / 2 + 7} x2={x + width / 2 + 9} y2={y + height / 2 - 7} stroke={COLORS.line} strokeWidth={2} />
    {toroid && (
      <circle cx={x + width / 2} cy={y + height / 2 + 2} r={12} fill="none" stroke={color} strokeWidth={2} />
    )}
    {sublabel && (
      <text x={x + width / 2} y={y + height - 10} textAnchor="middle" fontSize={9} fontWeight={700} fill={COLORS.line} fontFamily="monospace">
        {sublabel}
      </text>
    )}
  </g>
);

const UnifilarPro: React.FC<Props> = ({ initialCircuits, initialElectrification, onClose }) => {
  const [config, setConfig] = useState<UnifilarConfig>({
    projectRef: '',
    tipo: 'vivienda',
    electrification: initialElectrification ?? 'basic',
    igaAmpere: 25,
    numDiferenciales: 1,
    hasPCS: true,
    selectedCircuits: initialCircuits ?? ['C1', 'C2', 'C3', 'C4', 'C5']
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const installer = useMemo(readInstaller, []);

  const availableCircuits = ALL_CIRCUITS.filter(c => config.electrification === 'elevated' ? true : !c.isElevatedOnly);

  const toggleCircuit = (id: string) => {
    setConfig(prev => ({
      ...prev,
      selectedCircuits: prev.selectedCircuits.includes(id)
        ? prev.selectedCircuits.filter(c => c !== id)
        : [...prev.selectedCircuits, id].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    }));
  };

  const circuitDefs = config.selectedCircuits
    .map(id => ALL_CIRCUITS.find(c => c.id === id))
    .filter((c): c is typeof ALL_CIRCUITS[number] => !!c);

  // Distribuir circuitos entre 1 o 2 diferenciales
  const groups: (typeof ALL_CIRCUITS)[] = config.numDiferenciales === 2
    ? [circuitDefs.slice(0, Math.ceil(circuitDefs.length / 2)), circuitDefs.slice(Math.ceil(circuitDefs.length / 2))]
    : [circuitDefs];

  const contentWidth = PAGE_W - MARGIN * 2;
  const igaW = 90, igaH = 90;
  const pcsW = 55, pcsH = 55;
  const idW = 95, idH = 80;

  const handlePrint = () => window.print();

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([`<?xml version="1.0" standalone="no"?>\r\n${source}`], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unifilar-${config.projectRef || 'proyecto'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyImage = async () => {
    if (!svgRef.current) return;
    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgRef.current);
      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = PAGE_W * 2;
      canvas.height = PAGE_H * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(async blob => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch {
          /* portapapeles no soportado en este navegador */
        }
      }, 'image/png');
    } catch {
      /* fallo silencioso: la copia de imagen es una utilidad secundaria */
    }
  };

  const renderGroupRow = (group: typeof circuitDefs, groupTop: number, busY: number, xStart: number, xWidth: number) => {
    const count = group.length;
    if (count === 0) return null;
    const rows = count > 10 ? 2 : 1;
    const perRow = Math.ceil(count / rows);
    const rawSlot = xWidth / perRow;
    const slot = Math.max(45, Math.min(95, rawSlot));
    const rowHeight = 165;

    return (
      <>
        {group.map((c, idx) => {
          const rowIdx = Math.floor(idx / perRow);
          const colIdx = idx % perRow;
          const rowCount = Math.min(perRow, count - rowIdx * perRow);
          const rowStartX = xStart + (xWidth - slot * rowCount) / 2;
          const cx = rowStartX + colIdx * slot + slot / 2;
          const y = groupTop + rowIdx * rowHeight;
          const piaW = Math.min(60, slot * 0.65);
          const piaH = 85;
          return (
            <g key={c.id}>
              <line x1={cx} y1={rowIdx === 0 ? busY : y - 20} x2={cx} y2={y} stroke={COLORS.line} strokeWidth={1.5} />
              <BreakerBox x={cx - piaW / 2} y={y} width={piaW} height={piaH} color={COLORS.pia} label={c.id} sublabel={`${c.ampere}A/${c.recommendedCurve ?? 'B'}`} />
              {/* marcas de conductor /// */}
              <g transform={`translate(${cx - 8}, ${y + piaH + 6})`}>
                <line x1={0} y1={10} x2={6} y2={0} stroke={COLORS.line} strokeWidth={1} />
                <line x1={6} y1={10} x2={12} y2={0} stroke={COLORS.line} strokeWidth={1} />
                <line x1={12} y1={10} x2={18} y2={0} stroke={COLORS.line} strokeWidth={1} />
              </g>
              <line x1={cx} y1={y + piaH} x2={cx} y2={y + piaH + 22} stroke={COLORS.line} strokeWidth={1.5} />
              <text x={cx} y={y + piaH + 36} textAnchor="middle" fontSize={9} fontWeight={700} fill={COLORS.line} fontFamily="monospace">
                {c.cableComposition}
              </text>
              <text x={cx} y={y + piaH + 48} textAnchor="middle" fontSize={9} fontWeight={700} fill={COLORS.line} fontFamily="monospace">
                ⌀{c.conduitSize}mm
              </text>
              <text x={cx} y={y + piaH + 62} textAnchor="middle" fontSize={8} fontWeight={900} fill="#475569" style={{ textTransform: 'uppercase' }}>
                {c.name.length > 14 ? `${c.name.slice(0, 13)}…` : c.name}
              </text>
            </g>
          );
        })}
      </>
    );
  };

  const igaCx = PAGE_W / 2 - (config.hasPCS ? 60 : 0);
  const igaX = igaCx - igaW / 2;
  const igaY = 130;
  const pcsX = igaCx + igaW / 2 + 30;
  const pcsY = igaY + 15;

  const igaBottom = igaY + igaH;
  const idY = igaBottom + 40;
  const idBottom = idY + idH;
  const busY1 = idBottom + 20;
  const groupTop = busY1 + 20;
  const halfGap = 10;

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-6 print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 w-full max-w-[1200px] h-[95vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden relative border-8 border-slate-200 print:border-0 print:rounded-none print:h-auto">
        <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row justify-between md:items-center gap-3 border-b-2 border-slate-700 print:hidden">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <FileCode className="text-orange-500" size={20} /> Generador de Esquema Unifilar
            </h3>
            <p className="text-[9px] font-mono-tech text-slate-400 mt-1 uppercase tracking-widest">ITC-BT-17 / ITC-BT-25 / UNE-EN 60617</p>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Cerrar generador de esquemas" className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all self-end md:self-auto">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-grow overflow-auto flex flex-col lg:flex-row">
          {/* Configuración */}
          <div className="lg:w-[320px] flex-shrink-0 bg-slate-50 border-r border-slate-200 p-6 space-y-5 overflow-y-auto print:hidden">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Referencia de proyecto</label>
              <input
                value={config.projectRef}
                onChange={e => setConfig(p => ({ ...p, projectRef: e.target.value }))}
                placeholder="Ej: Vivienda C/Mayor 12"
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Tipo</label>
              <div className="flex gap-2">
                {(['vivienda', 'local'] as const).map(t => (
                  <button key={t} onClick={() => setConfig(p => ({ ...p, tipo: t }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border ${config.tipo === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Electrificación</label>
              <div className="flex gap-2">
                {([{ v: 'basic', l: 'Básica ≤5.750W' }, { v: 'elevated', l: 'Elevada ≤9.200W' }] as const).map(o => (
                  <button key={o.v} onClick={() => setConfig(p => ({ ...p, electrification: o.v }))}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase border leading-tight ${config.electrification === o.v ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">IGA principal</label>
              <div className="flex gap-2">
                {([25, 40, 63] as const).map(a => (
                  <button key={a} onClick={() => setConfig(p => ({ ...p, igaAmpere: a }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold border ${config.igaAmpere === a ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                    {a}A
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nº diferenciales</label>
              <div className="flex gap-2">
                {([1, 2] as const).map(n => (
                  <button key={n} onClick={() => setConfig(p => ({ ...p, numDiferenciales: n }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold border ${config.numDiferenciales === n ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                    {n === 1 ? 'Simple' : 'Doble (2 grupos)'}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 bg-white border border-slate-300 rounded-lg p-3 cursor-pointer">
              <input type="checkbox" checked={config.hasPCS} onChange={e => setConfig(p => ({ ...p, hasPCS: e.target.checked }))} className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-700">Incluir PCS (sobretensiones)</span>
            </label>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Circuitos ({config.selectedCircuits.length})</label>
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {availableCircuits.map(c => (
                  <button key={c.id} onClick={() => toggleCircuit(c.id)}
                    className={`p-2 rounded-lg border text-[9px] font-bold ${config.selectedCircuits.includes(c.id) ? 'bg-teal-700 border-teal-700 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                    {c.id}<br /><span className="text-[7px] font-black uppercase">{c.ampere}A</span>
                  </button>
                ))}
              </div>
              {config.selectedCircuits.length === 0 && (
                <p className="text-[10px] text-red-600 font-bold mt-2">Selecciona al menos un circuito para generar el esquema.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-800">
                <Printer size={14} /> Imprimir
              </button>
              <button onClick={handleDownloadSVG} className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-300">
                <Download size={14} /> Descargar SVG
              </button>
              <button onClick={handleCopyImage} className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-300">
                <Clipboard size={14} /> Copiar imagen
              </button>
            </div>
          </div>

          {/* Área de dibujo */}
          <div id="unifilar-print-area" className="flex-grow overflow-auto bg-[#fdfdfd] flex items-start justify-center p-6">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
              width="100%"
              style={{ maxWidth: `${PAGE_W}px` }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="#ffffff" />
              <text x={PAGE_W / 2} y={40} textAnchor="middle" fontSize={16} fontWeight={900} fill={COLORS.line} fontFamily="Arial, sans-serif" style={{ textTransform: 'uppercase', fontStyle: 'italic' }}>
                Esquema Unifilar — {config.tipo === 'vivienda' ? 'Vivienda' : 'Local Comercial'} ({config.electrification === 'basic' ? 'Electrificación Básica' : 'Electrificación Elevada'})
              </text>
              <text x={PAGE_W / 2} y={60} textAnchor="middle" fontSize={10} fill="#64748b" fontFamily="monospace">
                {config.projectRef || 'Proyecto sin referencia'}
              </text>

              <text x={MARGIN} y={100} fontSize={9} fontWeight={700} fill="#64748b" fontFamily="monospace" style={{ textTransform: 'uppercase' }}>
                Entrada Derivación Individual
              </text>
              <line x1={igaCx} y1={106} x2={igaCx} y2={igaY} stroke={COLORS.line} strokeWidth={2} />

              <BreakerBox x={igaX} y={igaY} width={igaW} height={igaH} color={COLORS.iga} label="IGA" sublabel={`${config.igaAmpere}A / C`} />

              {config.hasPCS && (
                <>
                  <line x1={igaX + igaW} y1={igaY + igaH / 2} x2={pcsX} y2={igaY + igaH / 2} stroke={COLORS.line} strokeWidth={1.5} />
                  <rect x={pcsX} y={pcsY} width={pcsW} height={pcsH} fill="#ffffff" stroke={COLORS.pcs} strokeWidth={2} strokeDasharray="4 3" rx={4} />
                  <text x={pcsX + pcsW / 2} y={pcsY + 14} textAnchor="middle" fontSize={8} fontWeight={900} fill={COLORS.pcs}>PCS</text>
                  <path d={`M ${pcsX + pcsW / 2 + 4} ${pcsY + 18} L ${pcsX + pcsW / 2 - 6} ${pcsY + 32} L ${pcsX + pcsW / 2} ${pcsY + 32} L ${pcsX + pcsW / 2 - 4} ${pcsY + 44} L ${pcsX + pcsW / 2 + 8} ${pcsY + 28} L ${pcsX + pcsW / 2 + 2} ${pcsY + 28} Z`} fill={COLORS.pcs} />
                  <text x={pcsX + pcsW / 2} y={pcsY + pcsH - 6} textAnchor="middle" fontSize={7} fontWeight={700} fill={COLORS.pcs}>2.5kV</text>
                </>
              )}

              <line x1={igaCx} y1={igaY + igaH} x2={igaCx} y2={groups.length === 1 ? idY : idY - 20} stroke={COLORS.line} strokeWidth={2} />

              {groups.length === 1 ? (
                <>
                  <BreakerBox x={igaCx - idW / 2} y={idY} width={idW} height={idH} color={COLORS.id} label="ID (Clase A)" sublabel="40A/30mA" toroid />
                  <line x1={igaCx} y1={idBottom} x2={igaCx} y2={busY1} stroke={COLORS.line} strokeWidth={2} />
                  <line x1={MARGIN} y1={busY1} x2={PAGE_W - MARGIN} y2={busY1} stroke={COLORS.line} strokeWidth={2.5} />
                  {renderGroupRow(circuitDefs, groupTop, busY1, MARGIN, contentWidth)}
                </>
              ) : (
                <>
                  <line x1={PAGE_W / 4} y1={idY - 20} x2={(3 * PAGE_W) / 4} y2={idY - 20} stroke={COLORS.line} strokeWidth={2} />
                  <line x1={PAGE_W / 4} y1={idY - 20} x2={PAGE_W / 4} y2={idY} stroke={COLORS.line} strokeWidth={2} />
                  <line x1={(3 * PAGE_W) / 4} y1={idY - 20} x2={(3 * PAGE_W) / 4} y2={idY} stroke={COLORS.line} strokeWidth={2} />

                  <BreakerBox x={PAGE_W / 4 - idW / 2} y={idY} width={idW} height={idH} color={COLORS.id} label="ID 1 (Clase A)" sublabel="40A/30mA" toroid />
                  <BreakerBox x={(3 * PAGE_W) / 4 - idW / 2} y={idY} width={idW} height={idH} color={COLORS.id} label="ID 2 (Clase A)" sublabel="40A/30mA" toroid />

                  <line x1={PAGE_W / 4} y1={idBottom} x2={PAGE_W / 4} y2={busY1} stroke={COLORS.line} strokeWidth={2} />
                  <line x1={(3 * PAGE_W) / 4} y1={idBottom} x2={(3 * PAGE_W) / 4} y2={busY1} stroke={COLORS.line} strokeWidth={2} />

                  <line x1={MARGIN} y1={busY1} x2={PAGE_W / 2 - halfGap} y2={busY1} stroke={COLORS.line} strokeWidth={2.5} />
                  <line x1={PAGE_W / 2 + halfGap} y1={busY1} x2={PAGE_W - MARGIN} y2={busY1} stroke={COLORS.line} strokeWidth={2.5} />

                  {renderGroupRow(groups[0], groupTop, busY1, MARGIN, PAGE_W / 2 - halfGap - MARGIN)}
                  {renderGroupRow(groups[1], groupTop, busY1, PAGE_W / 2 + halfGap, PAGE_W / 2 - halfGap - MARGIN)}
                </>
              )}

              {/* Cajetín técnico */}
              <g>
                <rect x={MARGIN} y={PAGE_H - 100} width={PAGE_W - MARGIN * 2} height={70} fill="#f1f5f9" stroke={COLORS.line} strokeWidth={1.5} />
                <line x1={MARGIN + (PAGE_W - MARGIN * 2) / 4} y1={PAGE_H - 100} x2={MARGIN + (PAGE_W - MARGIN * 2) / 4} y2={PAGE_H - 30} stroke="#cbd5e1" strokeWidth={1} />
                <line x1={MARGIN + (PAGE_W - MARGIN * 2) / 2} y1={PAGE_H - 100} x2={MARGIN + (PAGE_W - MARGIN * 2) / 2} y2={PAGE_H - 30} stroke="#cbd5e1" strokeWidth={1} />
                <line x1={MARGIN + (3 * (PAGE_W - MARGIN * 2)) / 4} y1={PAGE_H - 100} x2={MARGIN + (3 * (PAGE_W - MARGIN * 2)) / 4} y2={PAGE_H - 30} stroke="#cbd5e1" strokeWidth={1} />

                <text x={MARGIN + 14} y={PAGE_H - 82} fontSize={8} fontWeight={900} fill="#64748b" style={{ textTransform: 'uppercase' }}>Instalador Autorizado</text>
                <text x={MARGIN + 14} y={PAGE_H - 66} fontSize={10} fontWeight={700} fill={COLORS.line}>{installer?.companyName || 'REBT PRO — Sin datos de instalador'}</text>
                <text x={MARGIN + 14} y={PAGE_H - 52} fontSize={8} fill="#64748b" fontFamily="monospace">{installer?.installerNumber || 'Nº instalador: —'}</text>

                <text x={MARGIN + (PAGE_W - MARGIN * 2) / 4 + 14} y={PAGE_H - 82} fontSize={8} fontWeight={900} fill="#64748b" style={{ textTransform: 'uppercase' }}>Referencia Proyecto</text>
                <text x={MARGIN + (PAGE_W - MARGIN * 2) / 4 + 14} y={PAGE_H - 66} fontSize={10} fontWeight={700} fill={COLORS.line}>{config.projectRef || 'Sin referencia'}</text>
                <text x={MARGIN + (PAGE_W - MARGIN * 2) / 4 + 14} y={PAGE_H - 52} fontSize={8} fill="#64748b" fontFamily="monospace">Normativa: ITC-BT-25</text>

                <text x={MARGIN + (PAGE_W - MARGIN * 2) / 2 + 14} y={PAGE_H - 82} fontSize={8} fontWeight={900} fill="#64748b" style={{ textTransform: 'uppercase' }}>Especificación Cable</text>
                <text x={MARGIN + (PAGE_W - MARGIN * 2) / 2 + 14} y={PAGE_H - 66} fontSize={10} fontWeight={700} fill={COLORS.line}>Cu H07Z1-K (AS)</text>
                <text x={MARGIN + (PAGE_W - MARGIN * 2) / 2 + 14} y={PAGE_H - 52} fontSize={8} fill="#64748b" fontFamily="monospace">Libre de halógenos</text>

                <text x={MARGIN + (3 * (PAGE_W - MARGIN * 2)) / 4 + 14} y={PAGE_H - 82} fontSize={8} fontWeight={900} fill="#64748b" style={{ textTransform: 'uppercase' }}>Fecha</text>
                <text x={MARGIN + (3 * (PAGE_W - MARGIN * 2)) / 4 + 14} y={PAGE_H - 66} fontSize={10} fontWeight={700} fill={COLORS.line}>{new Date().toLocaleDateString('es-ES')}</text>
                <text x={MARGIN + (3 * (PAGE_W - MARGIN * 2)) / 4 + 14} y={PAGE_H - 52} fontSize={8} fill="#64748b" fontFamily="monospace">REBT Pro — Generado</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifilarPro;

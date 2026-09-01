export type LocationType = 'centralized' | 'partial' | 'single';
export type PhaseType = 'monophasic' | 'triphasic';
export type ConductorMaterial = 'Cu' | 'Al';
export type InsulationType = 'XLPE' | 'PVC';
export type ElectrificationLevel = 'basic' | 'elevated';
export type InstallationTypology = 'vivienda' | 'local';
export type PIACurve = 'B' | 'C' | 'D';
export type IDClass = 'A' | 'AC';

export interface LinkElement {
  id: string;
  name: string;
  acronym: string;
  itc: string;
  description: string;
  details: string[];
  specs?: string;
}

export interface CircuitDef {
  id: string;
  name: string;
  ampere: number;
  section: number;
  description: string;
  cableComposition: string; // Ej: "2x1,5 + 1,5"
  conduitSize: number;      // Ej: 16
  isElevatedOnly?: boolean;
  recommendedCurve?: PIACurve;
}

export interface SocketRequirement {
  count: number;
  circuit: string;
  description: string;
  ampere: number;
  section: number;
}

export interface RoomRequirement {
  room: string;
  lightPoints: number;
  sockets: SocketRequirement[];
  heights: string;
  safetyNote: string;
  volumes?: string[];
}

export interface CalculationResult {
  section: number;
  voltageDropV: number;
  voltageDropPercent: number;
  limitV: number;
  limitPercent: number;
  isWithinLimit: boolean;
  power: number;
  length: number;
  phase: PhaseType;
  voltage: number;
  conductivity: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  power: number;
  length: number;
  material: ConductorMaterial;
  phase: PhaseType;
  section: number;
}

// --- Protecciones (M1) ---
export interface ProtectionResult {
  circuitId: string;
  loadCurrent: number;
  recommendedPIA: number;
  recommendedPIACurve: PIACurve;
  cableAmpacity: number;
  isCoordinated: boolean;
  warnings: string[];
}

export interface ProtectionGroup {
  id: string;
  circuitIds: string[];
  idSensitivity: 30 | 300;
  idClass: IDClass;
  idAmpere: 25 | 40 | 63 | 80 | 100;
}

// --- Unifilar (M2) ---
export interface UnifilarConfig {
  projectRef: string;
  tipo: InstallationTypology;
  electrification: ElectrificationLevel;
  igaAmpere: 25 | 40 | 63;
  numDiferenciales: 1 | 2;
  hasPCS: boolean;
  selectedCircuits: string[];
}

export interface CircuitSelection {
  circuitId: string;
  groupIndex: number;
}

// --- Presupuesto (M3) ---
export interface BudgetItem {
  id: string;
  description: string;
  units: number;
  unitPrice: number;
}

export interface InstallerData {
  companyName: string;
  taxId: string;
  installerNumber: string;
  address: string;
  phone: string;
  email: string;
}

export interface ClientData {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
}

export type InstallationWorkType =
  | 'Instalación eléctrica vivienda'
  | 'Local comercial'
  | 'Reforma cuadro eléctrico'
  | 'Instalación fotovoltaica'
  | 'Mantenimiento y averías'
  | 'Instalación industrial'
  | 'Otro';

export interface BudgetHeaderData {
  number: string;
  date: string;
  validityDays: number;
  installationType: InstallationWorkType;
  vatRate: 21 | 10 | 0;
}

export interface BudgetData {
  installerData: InstallerData;
  clientData: ClientData;
  headerData: BudgetHeaderData;
  items: BudgetItem[];
  conditions: string;
}

export enum TabType {
  SCHEME = 'scheme',
  CALCULATOR = 'calculator',
  PROTECTIONS = 'protections',
  ROOMS = 'rooms',
  SAFETY = 'safety',
  BUDGET = 'budget'
}

export type LocationType = 'centralized' | 'partial' | 'single';
export type PhaseType = 'monophasic' | 'triphasic';
export type ConductorMaterial = 'Cu' | 'Al';
export type InsulationType = 'XLPE' | 'PVC';
export type ElectrificationLevel = 'basic' | 'elevated';

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

export enum TabType {
  SCHEME = 'scheme',
  CALCULATOR = 'calculator',
  ROOMS = 'rooms',
  SAFETY = 'safety'
}
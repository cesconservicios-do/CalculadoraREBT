import { LinkElement, RoomRequirement, CircuitDef } from './types';

// ITC-BT-19 Tabla 1: conductividad corregida por temperatura de servicio del aislamiento (m/Ω·mm²)
export const CONDUCTIVITY = {
  Cu: { XLPE: 44, PVC: 48 },
  Al: { XLPE: 28, PVC: 30 }
};

// ITC-BT-10: potencias normalizadas de previsión de carga por vivienda
export const NORMALIZED_POWERS_MONO = [3450, 4600, 5750, 6900, 8050, 9200, 11500, 14490];
export const NORMALIZED_POWERS_TRI = [10392, 13856, 17321, 20784, 24249, 27713, 34641, 43647];

// Secciones para derivación individual (mínimo 6mm² Cu / 16mm² Al según ITC-BT-15)
export const CABLE_SECTIONS = [6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// Secciones para circuitos interiores de vivienda/local (ITC-BT-25)
export const INTERIOR_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25];

// Calibres normalizados de PIA (magnetotérmico) según UNE-EN 60898
export const NORMALIZED_CALIBRES_PIA = [6, 10, 16, 20, 25, 32, 40, 50, 63];

// Intensidades nominales normalizadas de interruptor diferencial
export const NORMALIZED_CALIBRES_ID = [25, 40, 63, 80, 100] as const;

export const ALL_CIRCUITS: CircuitDef[] = [
  { id: 'C1', name: 'Iluminación', ampere: 10, section: 1.5, cableComposition: "2x1,5 + 1,5", conduitSize: 16, description: 'Puntos de luz y alumbrado general.', recommendedCurve: 'B' },
  { id: 'C2', name: 'TC uso gral y frigo', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Tomas de corriente de uso general y frigorífico.', recommendedCurve: 'B' },
  { id: 'C3', name: 'Cocina - Horno', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Circuito para cocina eléctrica y horno.', recommendedCurve: 'C' },
  { id: 'C4', name: 'Lavadora/Lavavajillas', ampere: 20, section: 4, cableComposition: "2x4 + 4", conduitSize: 20, description: 'Lavadora, lavavajillas y termo eléctrico.', recommendedCurve: 'C' },
  { id: 'C5', name: 'TC baño y cocina', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Tomas de baño y auxiliares de cocina.', recommendedCurve: 'B' },
  { id: 'C6', name: 'Iluminación 2', ampere: 10, section: 1.5, cableComposition: "2x1,5 + 1,5", conduitSize: 16, description: 'Adicional de alumbrado (>30 puntos).', isElevatedOnly: true, recommendedCurve: 'B' },
  { id: 'C7', name: 'TC uso gral 2', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Adicional de tomas general (>20 tomas o >160m²).', isElevatedOnly: true, recommendedCurve: 'B' },
  { id: 'C8', name: 'Calefacción', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Calefacción eléctrica.', isElevatedOnly: true, recommendedCurve: 'C' },
  { id: 'C9', name: 'Aire Acondic.', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Aire acondicionado.', isElevatedOnly: true, recommendedCurve: 'C' },
  { id: 'C10', name: 'Secadora', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Secadora independiente.', isElevatedOnly: true, recommendedCurve: 'C' },
  { id: 'C11', name: 'Domótica', ampere: 10, section: 1.5, cableComposition: "2x1,5 + 1,5", conduitSize: 16, description: 'Sistemas de automatización, gestión técnica de la energía y seguridad.', isElevatedOnly: true, recommendedCurve: 'B' },
  { id: 'C12', name: 'Cocina/Baño Adic.', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Circuito adicional para cocina/horno (previsión >5.400W) o calefacción de baño.', isElevatedOnly: true, recommendedCurve: 'C' },
  { id: 'C13', name: 'Recarga VE', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Infraestructura para recarga de vehículo eléctrico (ITC-BT-52).', isElevatedOnly: true, recommendedCurve: 'C' },
];

export const INSTALLATION_LINK: LinkElement[] = [
  {
    id: 'red',
    name: 'Red de Distribución',
    acronym: 'RED',
    itc: 'Propiedad Distribuidora',
    description: 'Origen de la energía en Media o Baja Tensión.',
    details: [
      'Propiedad de la Compañía Eléctrica.',
      'Suministro estándar: 230V / 400V.',
      'Redes antiguas pueden presentar 127V/220V.'
    ]
  },
  {
    id: 'acom',
    name: 'Acometida',
    acronym: 'ACOM',
    itc: 'ITC-BT-11',
    description: 'Punto de entrega que une la red con el edificio.',
    details: [
      'Cables: Aluminio (mín 16mm²) o Cobre (mín 10mm²).',
      'Tipos: Aérea (posada/tensada), Subterránea o Mixta.',
      'Frontera: Termina en la CGP.'
    ]
  },
  {
    id: 'cgp',
    name: 'Caja General de Protección',
    acronym: 'CGP',
    itc: 'ITC-BT-13',
    description: 'Aloja los fusibles generales. Marca el inicio de la propiedad del usuario.',
    details: [
      'Neutro: Siempre a la izquierda de las fases.',
      'Esquemas habituales: Esquema 7 (LGA única) o Esquema 10.',
      'Protección: Fusibles tipo cuchilla NH o cilíndricos.',
      'Cierre: Precintable por la distribuidora.',
      'Envolvente: Grado IK08 mínimo (EN 62262).'
    ]
  },
  {
    id: 'lga',
    name: 'Línea General de Alimentación',
    acronym: 'LGA',
    itc: 'ITC-BT-14',
    description: 'Arteria principal entre CGP y Centralización.',
    details: [
      'Prohibido realizar empalmes en todo su recorrido.',
      'Conducto: Obra de fábrica RF-120 (Patinillo).',
      'Tabla REBT (Sección -> Tubo):',
      '16mm² -> 75mm',
      '35mm² -> 110mm',
      '70mm² -> 140mm'
    ]
  },
  {
    id: 'cont',
    name: 'Centralización de Contadores',
    acronym: 'CC',
    itc: 'ITC-BT-16',
    description: 'El corazón de la medida. Control y equilibrado de cargas.',
    details: [
      'IGM: Interruptor General de Maniobra (mín 160A).',
      'Embarrados R, S, T: Obligatorio equilibrado de cargas.',
      'Ubicación: Local o armario exclusivo con acceso directo.',
      'Contadores: Digitales con capacidad de telegestión.'
    ]
  },
  {
    id: 'di',
    name: 'Derivación Individual',
    acronym: 'DI',
    itc: 'ITC-BT-15',
    description: 'Enlaza el contador con el cuadro privado del usuario.',
    details: [
      'Cables: Libres de halógenos (AS - Alta Seguridad).',
      'Diámetro mín. tubo: 32mm.',
      'Hilo de mando: 1.5mm² (color naranja) para cambio de tarifa.',
      'Mantenimiento: Responsabilidad de la propiedad.'
    ]
  },
  {
    id: 'cgmp',
    name: 'Cuadro General (CGMP)',
    acronym: 'CGMP',
    itc: 'ITC-BT-17',
    description: 'Destino final. Dispositivos de mando y protección.',
    details: [
      'Elementos: IGA, PCS (Sobretensiones), ID (Diferencial) y PIAs.',
      'Ubicación: Junto a la entrada (Altura 1.40m a 2m).',
      'Protección total: Cortocircuitos, sobrecargas y contactos indirectos.'
    ]
  }
];

export const ROOM_GUIDE: RoomRequirement[] = [
  {
    room: 'Cocina',
    lightPoints: 1,
    sockets: [
      { count: 1, circuit: 'C1', description: 'Alumbrado', ampere: 10, section: 1.5 },
      { count: 2, circuit: 'C2', description: 'Frigo / Extractor', ampere: 16, section: 2.5 },
      { count: 1, circuit: 'C3', description: 'Cocina / Horno', ampere: 25, section: 6 },
      { count: 1, circuit: 'C4', description: 'Lavadora / Termo', ampere: 20, section: 4 },
      { count: 3, circuit: 'C5', description: 'Tomas Auxiliares', ampere: 16, section: 2.5 }
    ],
    heights: 'Plano trabajo: 1.10m. Tomas suelo: 0.30m.',
    safetyNote: 'Circuitos C3/C4 con calibres específicos. Distancia a fregadero >0.50m.'
  },
  {
    room: 'Baño',
    lightPoints: 1,
    sockets: [
      { count: 1, circuit: 'C1', description: 'Alumbrado', ampere: 10, section: 1.5 },
      { count: 1, circuit: 'C5', description: 'Toma Lavabo', ampere: 16, section: 2.5 }
    ],
    heights: 'Interruptores fuera de Vol 0/1/2.',
    safetyNote: 'Volumen 0: Inmersión. Volumen 1: Ducha (solo MBTS). IPX4 mín.',
    volumes: ['Vol 0: Recipiente', 'Vol 1: Proyección vertical', 'Vol 2: 0.60m lateral']
  },
  {
    room: 'Habitación / Salón',
    lightPoints: 1,
    sockets: [
      { count: 1, circuit: 'C1', description: 'Alumbrado', ampere: 10, section: 1.5 },
      { count: 3, circuit: 'C2', description: 'Tomas Uso Gral', ampere: 16, section: 2.5 }
    ],
    heights: 'Tomas: 0.30m. Interruptores: 1.10m.',
    safetyNote: 'Mínimo 1 toma por cada 6m² de superficie habitable. Salón: mín. 3 bases (≥6 en electrificación elevada).'
  },
  {
    room: 'Garaje',
    lightPoints: 1,
    sockets: [
      { count: 1, circuit: 'C1', description: 'Alumbrado', ampere: 10, section: 1.5 },
      { count: 1, circuit: 'C2', description: 'Toma 16A (garaje individual)', ampere: 16, section: 2.5 }
    ],
    heights: 'Tomas: 0.30m del suelo mín.',
    safetyNote: 'Garaje individual: mín. 1 base de 16A. Garaje comunitario: ventilación e IP mecánica reforzada (impacto de vehículos).'
  },
  {
    room: 'Exterior / Terraza',
    lightPoints: 1,
    sockets: [
      { count: 1, circuit: 'C2', description: 'Toma exterior protegida', ampere: 16, section: 2.5 }
    ],
    heights: 'Tomas con tapa: >0.30m del suelo.',
    safetyNote: 'Grado de protección mínimo IPX4 (proyecciones de agua). Usar mecanismos con tapa estanca.'
  },
  {
    room: 'Local Comercial',
    lightPoints: 1,
    sockets: [
      { count: 1, circuit: 'C1', description: 'Alumbrado general', ampere: 10, section: 1.5 },
      { count: 1, circuit: 'C2', description: 'Tomas de uso general', ampere: 16, section: 2.5 },
      { count: 1, circuit: 'C11', description: 'Alumbrado de emergencia', ampere: 10, section: 1.5 }
    ],
    heights: 'CGMP: 1.40m - 2.00m.',
    safetyNote: 'Previsión de carga mínima 100W/m² (ITC-BT-10). Obligatorio alumbrado de emergencia y proyecto técnico si supera 50kW o superficie reglamentaria.'
  }
];

// Plantillas rápidas de partidas de presupuesto (sin IA), precios orientativos mercado español 2024-2025
export const BUDGET_TEMPLATES: Record<string, { description: string; units: number; unitPrice: number }[]> = {
  'Instalación eléctrica vivienda': [
    { description: 'Desmontaje y retirada de instalación existente', units: 1, unitPrice: 250 },
    { description: 'Cuadro eléctrico con protecciones según REBT', units: 1, unitPrice: 380 },
    { description: 'Cableado y canalizaciones empotradas', units: 1, unitPrice: 1200 },
    { description: 'Mecanismos (interruptores y bases de enchufe)', units: 1, unitPrice: 650 },
    { description: 'Puntos de luz', units: 12, unitPrice: 35 },
    { description: 'Toma de tierra', units: 1, unitPrice: 220 },
    { description: 'Pruebas, verificaciones y documentación (Boletín/CIE)', units: 1, unitPrice: 180 }
  ],
  'Local comercial': [
    { description: 'Proyecto técnico e ingeniería', units: 1, unitPrice: 600 },
    { description: 'Cuadro general de protección', units: 1, unitPrice: 750 },
    { description: 'Circuitos de fuerza y alumbrado', units: 1, unitPrice: 1500 },
    { description: 'Canalizaciones en bandeja o tubo', units: 1, unitPrice: 900 },
    { description: 'Cuadro de distribución secundario', units: 1, unitPrice: 420 },
    { description: 'Alumbrado de emergencia', units: 6, unitPrice: 45 },
    { description: 'Puesta a tierra y equipotencialidad', units: 1, unitPrice: 300 },
    { description: 'Certificado de instalación REBT', units: 1, unitPrice: 220 }
  ]
};

export const DEFAULT_BUDGET_CONDITIONS = 'Los precios incluyen materiales y mano de obra especificados. Trabajos adicionales fuera del alcance definido se presupuestarán aparte. Garantía de mano de obra: 2 años. Los materiales cumplen la normativa REBT vigente.';

export const STORAGE_KEYS = {
  INSTALLER: 'rebtpro_installer_data',
  LAST_BUDGET: 'rebtpro_last_budget',
  BUDGET_COUNTER: 'rebtpro_budget_counter',
  DI_HISTORY: 'rebtpro_di_history',
  FIELD_MODE: 'rebtpro_field_mode'
};

import { LinkElement, RoomRequirement, CircuitDef } from './types';

export const CONDUCTIVITY = {
  Cu: { XLPE: 44, PVC: 48 },
  Al: { XLPE: 28, PVC: 30 }
};

export const NORMALIZED_POWERS_MONO = [3450, 4600, 5750, 6900, 8050, 9200, 11500, 14490];
export const NORMALIZED_POWERS_TRI = [10392, 13856, 17321, 20784, 24249, 27713, 34641, 43647];

export const ALL_CIRCUITS: CircuitDef[] = [
  { id: 'C1', name: 'Iluminación', ampere: 10, section: 1.5, cableComposition: "2x1,5 + 1,5", conduitSize: 16, description: 'Puntos de luz y alumbrado general.' },
  { id: 'C2', name: 'TC uso gral y frigo', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Tomas de corriente de uso general y frigorífico.' },
  { id: 'C3', name: 'Cocina - Horno', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Circuito para cocina eléctrica y horno.' },
  { id: 'C4', name: 'Lavadora/Lavavajillas', ampere: 20, section: 4, cableComposition: "2x4 + 4", conduitSize: 20, description: 'Lavadora, lavavajillas y termo eléctrico.' },
  { id: 'C5', name: 'TC baño y cocina', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Tomas de baño y auxiliares de cocina.' },
  { id: 'C6', name: 'Iluminación 2', ampere: 10, section: 1.5, cableComposition: "2x1,5 + 1,5", conduitSize: 16, description: 'Adicional de alumbrado (>30 puntos).', isElevatedOnly: true },
  { id: 'C7', name: 'TC uso gral 2', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Adicional de tomas general (>20 tomas o >160m²).', isElevatedOnly: true },
  { id: 'C8', name: 'Calefacción', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Calefacción eléctrica.', isElevatedOnly: true },
  { id: 'C9', name: 'Aire Acondic.', ampere: 25, section: 6, cableComposition: "2x6 + 6", conduitSize: 25, description: 'Aire acondicionado.', isElevatedOnly: true },
  { id: 'C10', name: 'Secadora', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Secadora independiente.', isElevatedOnly: true },
  { id: 'C11', name: 'Domótica', ampere: 10, section: 1.5, cableComposition: "2x1,5 + 1,5", conduitSize: 16, description: 'Sistemas de automatización.', isElevatedOnly: true },
  { id: 'C13', name: 'Recarga VE', ampere: 16, section: 2.5, cableComposition: "2x2,5 + 2,5", conduitSize: 20, description: 'Infraestructura para vehículo eléctrico (ITC-BT-52).', isElevatedOnly: true },
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
      'Cierre: Precintable por la distribuidora.'
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
    safetyNote: 'Mínimo 1 toma por cada 6m² de superficie habitable.'
  }
];

export const CABLE_SECTIONS = [6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

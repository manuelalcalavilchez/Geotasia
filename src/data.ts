import { ProjectConfig } from './types';

export const DEFAULT_CONFIG: ProjectConfig = {
  kDriveUrl: 'https://kdrive.infomaniak.com/app/collaborate/2817260/c2b3831c-6495-4118-bad0-ac3a1d762559',
  externalGeovisorUrl: 'https://ovc.catastro.meh.es/',
  externalRutasUrl: 'https://www.google.com/maps',
  externalNotasSimplesUrl: 'https://registradores.org',
  externalAplicacionesUrl: 'https://www.geotasalia.es',
  externalVisorUrbanisticoUrl: 'https://www.miteco.gob.es/es/cartografia-y-sig/visores-sig.html',
  rgpdResponsable: 'Jorge Martínez Martínez - GEOTASALIA',
  rgpdNif: '44321987-X',
  rgpdDireccion: 'Calle Técnica Agrónoma 14, Alcalá de Guadaíra, 41500 Sevilla',
  rgpdEmail: 'jorge.martinez@geotasalia.es',
  rgpdDpd: 'gestion@geotasalia.es',
  customLogoUrl: '',
  theme: 'navy-gold',
};

export const CATASTRAL_SAMPLES = [
  {
    ref: '4752801VK4745S0001YD',
    address: 'Calle Mayor 12, Madrid',
    use: 'Residencial',
    surface: 180,
    year: 1998,
    boundary: [
      { x: 30, y: 20 },
      { x: 120, y: 15 },
      { x: 130, y: 95 },
      { x: 40, y: 110 },
      { x: 30, y: 20 }
    ],
    owner: 'D. Juan Martínez'
  },
  {
    ref: '9823104VK4798N0001AZ',
    address: 'Avenida de la Constitución 45, Sevilla',
    use: 'Oficinas',
    surface: 450,
    year: 2005,
    boundary: [
      { x: 40, y: 30 },
      { x: 150, y: 40 },
      { x: 140, y: 120 },
      { x: 20, y: 100 },
      { x: 40, y: 30 }
    ],
    owner: 'Geotasalia Inversiones S.L.'
  },
  {
    ref: '1245902VK4712F0001OP',
    address: 'Polígono Industrial Las Arenas, Parcela 8, Zaragoza',
    use: 'Industrial',
    surface: 1200,
    year: 2012,
    boundary: [
      { x: 15, y: 15 },
      { x: 180, y: 20 },
      { x: 170, y: 140 },
      { x: 10, y: 130 },
      { x: 15, y: 15 }
    ],
    owner: 'Talleres del Ebro S.A.'
  }
];

export const CTE_SOIL_TYPES = [
  { id: 'T1', name: 'Roca o Suelo Muy Rígido (Tipo I)', description: 'Rocas compactas, arenas o gravas muy densas.' },
  { id: 'T2', name: 'Suelo de Rigidez Media (Tipo II)', description: 'Gravas y arenas de densidad media, arcillas firmes.' },
  { id: 'T3', name: 'Suelo Blando o Flojo (Tipo III)', description: 'Suelos cohesivos blandos, arenas sueltas, fangos.' }
];

export const CTE_BUILDING_TYPES = [
  { id: 'C0', name: 'Construcción Sencilla (C-0)', description: 'Hasta 1 planta, luces < 6m, superficie < 100 m².' },
  { id: 'C1', name: 'Construcción Media (C-1)', description: 'De 1 a 3 plantas, luces < 12m, superficie < 1000 m².' },
  { id: 'C2', name: 'Construcción Compleja (C-2)', description: 'De 4 a 10 plantas, luces < 20m, superficie de 1000 a 5000 m².' },
  { id: 'C3', name: 'Construcción Singular (C-3)', description: 'Más de 10 plantas, luces > 20m o sótanos profundos.' }
];

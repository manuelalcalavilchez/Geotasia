export interface ProjectConfig {
  kDriveUrl: string;
  externalGeovisorUrl: string;
  externalRutasUrl: string;
  externalNotasSimplesUrl: string;
  externalAplicacionesUrl: string;
  externalVisorUrbanisticoUrl: string;
  rgpdResponsable?: string;
  rgpdNif?: string;
  rgpdDireccion?: string;
  rgpdEmail?: string;
  rgpdDpd?: string;
  customLogoUrl?: string;
}

export type ServiceType = 
  | 'tasacion' 
  | 'geotecnia' 
  | 'topografia' 
  | 'nota_simple' 
  | 'certificado_energetico';

export interface CalculationResult {
  baseFee: number;
  travelExpenses: number;
  tax: number;
  total: number;
  details: string[];
}

export interface RouteCalculation {
  distanceKm: number;
  fuelRate: number;
  dietRate: number;
  totalDays: number;
  totalCost: number;
}

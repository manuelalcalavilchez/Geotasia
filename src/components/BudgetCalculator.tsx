import React, { useState, useEffect } from 'react';
import { Calculator, Euro, Building2, Layers, CheckCircle2, Copy, Send } from 'lucide-react';
import { ServiceType, CalculationResult } from '../types';

interface BudgetCalculatorProps {
  onApplyPreset: (msg: string, service: string) => void;
}

export default function BudgetCalculator({ onApplyPreset }: BudgetCalculatorProps) {
  const [service, setService] = useState<ServiceType>('tasacion');
  const [surface, setSurface] = useState<number>(120);
  const [distance, setDistance] = useState<number>(20);
  const [propertyType, setPropertyType] = useState<string>('residencial');
  const [soilComplexity, setSoilComplexity] = useState<number>(1.0); // Coefficient
  const [result, setResult] = useState<CalculationResult>({
    baseFee: 0,
    travelExpenses: 0,
    tax: 0,
    total: 0,
    details: [],
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    calculateBudget();
  }, [service, surface, distance, propertyType, soilComplexity]);

  const calculateBudget = () => {
    let baseFee = 0;
    const details: string[] = [];
    const travelRate = 0.28; // €/km
    const travelExpenses = distance * 2 * travelRate;

    switch (service) {
      case 'tasacion':
        baseFee = 250;
        details.push('Tasa base de Tasación de Inmueble: 250€');
        
        let surfaceSurcharge = surface * 0.45;
        if (propertyType === 'comercial') {
          surfaceSurcharge = surface * 0.65;
          details.push(`Recargo comercial: +${surfaceSurcharge.toFixed(2)}€ (${surface} m²)`);
        } else if (propertyType === 'industrial') {
          surfaceSurcharge = surface * 0.75;
          details.push(`Recargo industrial/logístico: +${surfaceSurcharge.toFixed(2)}€ (${surface} m²)`);
        } else {
          details.push(`Recargo residencial: +${surfaceSurcharge.toFixed(2)}€ (${surface} m²)`);
        }
        baseFee += surfaceSurcharge;
        break;

      case 'geotecnia':
        baseFee = 950;
        details.push('Estudio Geotécnico Estándar (mínimo legal): 950€');
        
        const geoSurcharge = surface * 1.1;
        baseFee += geoSurcharge;
        details.push(`Recargo de superficie edificable: +${geoSurcharge.toFixed(2)}€ (${surface} m²)`);

        if (soilComplexity > 1.0) {
          const complexSurcharge = baseFee * (soilComplexity - 1.0);
          baseFee += complexSurcharge;
          details.push(`Surcharge de Suelo Complejo/Blando: +${complexSurcharge.toFixed(2)}€`);
        }
        break;

      case 'topografia':
        baseFee = 380;
        details.push('Levantamiento Topográfico Base: 380€');
        
        if (surface > 500) {
          const topoSurf = (surface - 500) * 0.15;
          baseFee += topoSurf;
          details.push(`Surcharge superficie de terreno (>500m²): +${topoSurf.toFixed(2)}€`);
        }
        break;

      case 'nota_simple':
        baseFee = 28;
        details.push('Gestión y aranceles de Nota Simple: 28€');
        break;

      case 'certificado_energetico':
        baseFee = 95;
        details.push('Certificación Energética Base: 95€');
        const certSurcharge = surface * 0.15;
        baseFee += certSurcharge;
        details.push(`Recargo superficie energética: +${certSurcharge.toFixed(2)}€`);
        break;
    }

    if (distance > 0) {
      details.push(`Desplazamiento técnico (${distance * 2} km totales): +${travelExpenses.toFixed(2)}€`);
    }

    const subtotal = baseFee + travelExpenses;
    const tax = subtotal * 0.21; // 21% IVA Spain
    const total = subtotal + tax;

    setResult({
      baseFee,
      travelExpenses,
      tax,
      total,
      details,
    });
  };

  const handleCopyBudget = () => {
    const text = `Presupuesto Estimado GeoTasalia:
Servicio: ${service.replace('_', ' ').toUpperCase()}
Características: ${surface} m², a ${distance} km
Base imponible: ${(result.baseFee + result.travelExpenses).toFixed(2)}€
IVA (21%): ${result.tax.toFixed(2)}€
Total Estimado: ${result.total.toFixed(2)}€
Calculadora: GeoTasalia Web`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToForm = () => {
    const serviceLabels: Record<ServiceType, string> = {
      tasacion: 'Tasación / Valoración',
      geotecnia: 'Estudio Geotécnico CTE',
      topografia: 'Levantamiento Topográfico',
      nota_simple: 'Gestión de Nota Simple',
      certificado_energetico: 'Certificado Energético',
    };

    const message = `Hola Jorge, me gustaría solicitar un presupuesto formal para ${serviceLabels[service]} de un inmueble de ${surface} m² situado a unos ${distance} km de vuestra oficina central. El coste estimado en la calculadora es de ${result.total.toFixed(2)}€ (IVA incluido).`;
    onApplyPreset(message, serviceLabels[service]);
  };

  return (
    <div className="border border-gray-800 rounded-2xl bg-[#0b1329]/80 backdrop-blur-md shadow-lg p-5 md:p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
          <Calculator size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white font-sans">Calculadora de Presupuestos</h3>
          <p className="text-xs text-gray-400">Genera una estimación automática y envíala al formulario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parametros */}
        <div className="space-y-4">
          {/* Tipo de Servicio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Servicio Técnico</label>
            <select
              className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-sm text-white focus:border-yellow-500/50 outline-none transition-all"
              value={service}
              onChange={(e) => setService(e.target.value as ServiceType)}
            >
              <option value="tasacion">Valoración / Tasación de Inmueble</option>
              <option value="geotecnia">Estudio Geotécnico (CTE)</option>
              <option value="topografia">Levantamiento Topográfico</option>
              <option value="nota_simple">Localización de Nota Simple</option>
              <option value="certificado_energetico">Certificación Energética</option>
            </select>
          </div>

          {/* Superficie */}
          {service !== 'nota_simple' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                <span>Superficie ({service === 'topografia' ? 'Terreno m²' : 'Construida m²'})</span>
                <span className="text-yellow-500 font-mono text-xs">{surface} m²</span>
              </label>
              <input
                type="range"
                min="10"
                max={service === 'topografia' ? "10000" : "2000"}
                step="5"
                className="w-full accent-yellow-500 cursor-pointer"
                value={surface}
                onChange={(e) => setSurface(Number(e.target.value))}
              />
            </div>
          )}

          {/* Características Extra por Servicio */}
          {service === 'tasacion' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Uso del Inmueble</label>
              <div className="grid grid-cols-3 gap-2">
                {['residencial', 'comercial', 'industrial'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                      propertyType === type
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-md shadow-yellow-500/5'
                        : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-950/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {service === 'geotecnia' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Complejidad del Terreno</label>
              <select
                className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-sm text-white focus:border-yellow-500/50 outline-none"
                value={soilComplexity}
                onChange={(e) => setSoilComplexity(Number(e.target.value))}
              >
                <option value="1.0">Terreno Estable / Plano (coef. 1.0)</option>
                <option value="1.15">Terreno en Pendiente Media (coef. 1.15)</option>
                <option value="1.3">Terreno Inestable / Arcilla expansiva (coef. 1.3)</option>
              </select>
            </div>
          )}

          {/* Distancia */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
              <span>Distancia desde Oficina central (KM)</span>
              <span className="text-yellow-500 font-mono text-xs">{distance} KM</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              className="w-full accent-yellow-500 cursor-pointer"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Desglose de Precios */}
        <div className="flex flex-col justify-between bg-gray-950/50 rounded-xl p-4 border border-gray-800/80">
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-400 font-mono uppercase tracking-widest block">
              Desglose Estimativo
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {result.details.map((detail, idx) => (
                <div key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-500 mt-1 shrink-0">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 mt-4 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-400">Total (IVA 21% inc.)</span>
              <span className="text-3xl font-bold font-sans text-white flex items-center">
                {result.total.toFixed(2)}
                <Euro size={22} className="text-yellow-500 ml-1" />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyBudget}
                className="py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 border border-gray-800 transition-all"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" /> ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copiar
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSendToForm}
                className="py-2.5 bg-yellow-500 hover:bg-yellow-600 text-[#0b1329] text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-yellow-500/10"
              >
                <Send size={14} /> Aplicar a Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

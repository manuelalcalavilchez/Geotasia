import React, { useState, useEffect } from 'react';
import { ShieldCheck, HelpCircle, FileWarning, CheckCircle } from 'lucide-react';
import { CTE_BUILDING_TYPES, CTE_SOIL_TYPES } from '../data';

export default function CteChecker() {
  const [buildingType, setBuildingType] = useState('C1');
  const [soilType, setSoilType] = useState('T1');
  const [hasSewer, setHasSewer] = useState(true);
  const [hasSlope, setHasSlope] = useState(false);
  const [isMandatory, setIsMandatory] = useState(true);
  const [assessment, setAssessment] = useState('');

  useEffect(() => {
    // Determine geotechnical necessity according to Spanish CTE SE-C (Cimientos)
    // Geotechnical is mandatory for all structures EXCEPT C-0 (1-story, simple, <100m2)
    // under very stable soil, with no slopes, sewers or special conditions.
    if (buildingType === 'C0' && soilType === 'T1' && !hasSlope && hasSewer) {
      setIsMandatory(false);
      setAssessment('No estrictamente obligatorio por CTE SE-C, pero aconsejable si existen dudas de rellenos antrópicos o humedades locales.');
    } else {
      setIsMandatory(true);
      let reason = 'Estudio Geotécnico Obligatorio según CTE (DB-SE-C). ';
      if (buildingType !== 'C0') reason += 'Supera los límites de la categoría de construcción C-0. ';
      if (soilType !== 'T1') reason += 'El terreno presenta variabilidad o rigidez media/baja (T-2, T-3). ';
      if (hasSlope) reason += 'La pendiente del terreno puede generar riesgos de inestabilidad o deslizamiento. ';
      setAssessment(reason);
    }
  }, [buildingType, soilType, hasSewer, hasSlope]);

  return (
    <div className="border border-gray-800 rounded-2xl bg-[#0b1329]/80 backdrop-blur-md shadow-lg p-5 md:p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white font-sans">Validador Obligatoriedad Estudio Geotécnico (CTE)</h3>
          <p className="text-xs text-gray-400">Verifica si el Código Técnico de la Edificación te exige estudio del suelo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Tipo de Edificación */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo de Construcción</label>
            <select
              className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white focus:border-yellow-500/50 outline-none"
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
            >
              {CTE_BUILDING_TYPES.map((type) => (
                <option key={type.id} value={type.id.substring(2)}>{type.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 italic">
              {buildingType === '0' && 'Construcción en una planta, luces < 6m, < 100 m².'}
              {buildingType === '1' && 'De 1 a 3 plantas, luces < 12m, < 1000 m².'}
              {buildingType === '2' && 'De 4 a 10 plantas, luces < 20m, de 1000 a 5000 m².'}
              {buildingType === '3' && 'Más de 10 plantas, luces > 20m, o sótanos complejos.'}
            </p>
          </div>

          {/* Tipo de Suelo aproximado */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Características del Suelo</label>
            <select
              className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white focus:border-yellow-500/50 outline-none"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            >
              {CTE_SOIL_TYPES.map((soil) => (
                <option key={soil.id} value={soil.id}>{soil.name}</option>
              ))}
            </select>
          </div>

          {/* Factores de Riesgo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Factores de Riesgo Local</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-800 bg-gray-950 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                  checked={hasSlope}
                  onChange={(e) => setHasSlope(e.target.checked)}
                />
                <span>El terreno tiene pendiente pronunciada (&gt;15%) o talud cercano</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-800 bg-gray-950 text-yellow-500 focus:ring-0 focus:ring-offset-0"
                  checked={!hasSewer}
                  onChange={(e) => setHasSewer(!e.target.checked)}
                />
                <span>Presencia de aguas subterráneas, nivel freático alto o red de saneamiento rota</span>
              </label>
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="flex flex-col justify-center items-center p-5 rounded-xl border transition-all duration-300 bg-gray-950/40 border-gray-800/80">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {isMandatory ? (
                <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 shadow-lg shadow-red-500/5">
                  <FileWarning size={32} />
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <CheckCircle size={32} />
                </div>
              )}
            </div>

            <div>
              <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isMandatory ? 'text-red-400' : 'text-emerald-400'}`}>
                {isMandatory ? 'ESTUDIO OBLIGATORIO' : 'NO OBLIGATORIO'}
              </span>
              <p className="text-sm font-semibold text-white mt-1">
                {isMandatory 
                  ? 'Se exige Estudio Geotécnico visado por Ley' 
                  : 'Exento según CTE (con reservas)'}
              </p>
            </div>

            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              {assessment}
            </p>

            <div className="pt-2">
              <span className="text-[10px] text-gray-500 italic block">
                *Criterio técnico basado en el Documento Básico SE-C del Código Técnico de la Edificación.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

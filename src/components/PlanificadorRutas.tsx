import React, { useState } from 'react';
import { Navigation, Route, Euro, Clock, MapPin, ArrowUpRight, Check } from 'lucide-react';
import { RouteCalculation } from '../types';

interface PlanificadorRutasProps {
  onApplyRoute: (msg: string) => void;
  externalUrl: string;
}

export default function PlanificadorRutas({ onApplyRoute, externalUrl }: PlanificadorRutasProps) {
  const [destination, setDestination] = useState('Marbella, Málaga');
  const [distance, setDistance] = useState(65); // Default km
  const [days, setDays] = useState(1);
  const [fuelRate, setFuelRate] = useState(0.28); // Standard Spanish legal travel rate
  const [dietRate, setDietRate] = useState(48.50); // Daily diet/expense rate

  const totalKm = distance * 2; // Round trip
  const travelCost = totalKm * fuelRate * days;
  const dietCost = dietRate * days;
  const totalCost = travelCost + dietCost;

  const handleApply = () => {
    const msg = `Hola Jorge, requiero planificar una salida de campo/tasación técnica hacia ${destination}. Distancia: ${distance} km (Ida). Estimación de gastos de viaje y dietas: ${totalCost.toFixed(2)}€ para un trabajo de ${days} día(s).`;
    onApplyRoute(msg);
  };

  return (
    <div className="border border-gray-800 rounded-2xl bg-[#0b1329]/80 backdrop-blur-md shadow-lg p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <Navigation size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-sans">Planificador de Rutas y Dietas Técnicas</h3>
            <p className="text-xs text-gray-400">Calcula kilometraje, tiempos de viaje y gastos de campo</p>
          </div>
        </div>
        <a
          href={`${externalUrl}/search/${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-[#0b1329] text-xs font-bold rounded-lg shadow-md transition-all shrink-0"
        >
          Ver en Mapa <ArrowUpRight size={13} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Municipio de Destino</label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full pl-9 pr-4 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/50"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <MapPin className="absolute left-3 top-2.5 text-yellow-500" size={14} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                <span>Distancia (Ida)</span>
                <span className="text-yellow-500 font-mono">{distance} km</span>
              </label>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                className="w-full accent-yellow-500 cursor-pointer"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                <span>Días de Visita</span>
                <span className="text-yellow-500 font-mono">{days} d</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                className="w-full accent-yellow-500 cursor-pointer"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Tarifa (€/KM)</label>
              <input
                type="number"
                step="0.01"
                min="0.10"
                max="1.00"
                className="w-full px-3 py-1.5 bg-gray-950/60 border border-gray-800 rounded-lg text-xs font-mono text-white outline-none focus:border-yellow-500/50"
                value={fuelRate}
                onChange={(e) => setFuelRate(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Dieta Diaria (€)</label>
              <input
                type="number"
                step="0.50"
                min="0"
                max="150"
                className="w-full px-3 py-1.5 bg-gray-950/60 border border-gray-800 rounded-lg text-xs font-mono text-white outline-none focus:border-yellow-500/50"
                value={dietRate}
                onChange={(e) => setDietRate(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="flex flex-col justify-between bg-gray-950/40 rounded-xl p-4 border border-gray-800/80">
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 font-mono uppercase tracking-widest block">
              Logística Estimada de Viaje
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0b1329] p-2.5 rounded-lg border border-gray-900/60 flex items-center gap-2.5">
                <Route className="text-yellow-500 shrink-0" size={18} />
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Recorrido Total</span>
                  <span className="text-xs font-bold text-white font-mono">{totalKm} km / día</span>
                </div>
              </div>

              <div className="bg-[#0b1329] p-2.5 rounded-lg border border-gray-900/60 flex items-center gap-2.5">
                <Clock className="text-yellow-500 shrink-0" size={18} />
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Tiempo Conducción</span>
                  <span className="text-xs font-bold text-white font-mono">~{(totalKm / 85).toFixed(1)} hrs</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Gastos de Desplazamiento ({fuelRate.toFixed(2)}€/km):</span>
                <span className="font-mono">{travelCost.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Dietas Técnicas y manutención:</span>
                <span className="font-mono">{dietCost.toFixed(2)}€</span>
              </div>
              <div className="border-t border-gray-800 my-2 pt-2 flex justify-between font-bold text-white">
                <span>Subtotal Presupuestado:</span>
                <span className="font-mono text-yellow-500">{totalCost.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-[#0b1329] text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 mt-4"
          >
            <Euro size={14} /> Aplicar Viáticos al Formulario
          </button>
        </div>
      </div>
    </div>
  );
}

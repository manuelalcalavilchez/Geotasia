import React, { useState } from 'react';
import { Map, Search, Info, Layers, Crosshair, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { CATASTRAL_SAMPLES } from '../data';

interface GeovisorCatastralProps {
  onSelectParcel: (address: string, ref: string) => void;
  externalUrl: string;
}

export default function GeovisorCatastral({ onSelectParcel, externalUrl }: GeovisorCatastralProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParcel, setSelectedParcel] = useState(CATASTRAL_SAMPLES[0]);
  const [layer, setLayer] = useState<'catastro' | 'satelite'>('catastro');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().toUpperCase();
    const found = CATASTRAL_SAMPLES.find(
      p => p.ref.includes(cleanQuery) || p.address.toUpperCase().includes(cleanQuery)
    );

    if (found) {
      setSelectedParcel(found);
      setStatusMsg('');
    } else {
      setStatusMsg('Referencia o dirección no encontrada. Prueba con: ' + CATASTRAL_SAMPLES[1].ref);
    }
  };

  const handleSelectSample = (parcel: typeof CATASTRAL_SAMPLES[0]) => {
    setSelectedParcel(parcel);
    setSearchQuery(parcel.ref);
    setStatusMsg('');
  };

  const handleRequestService = () => {
    onSelectParcel(selectedParcel.address, selectedParcel.ref);
  };

  return (
    <div className="border border-gray-800 rounded-2xl bg-[#0b1329]/80 backdrop-blur-md shadow-lg overflow-hidden flex flex-col h-[520px]">
      {/* Top Banner/Header */}
      <div className="p-4 bg-[#0d1630] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <Map size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-sans">Geovisor Catastral Geotasalia</h3>
            <p className="text-[10px] text-gray-400">Visor interactivo de parcelas rústicas y urbanas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* External Button Link requested by user ("su botoncico") */}
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-[#0b1329] text-[11px] font-bold rounded-md shadow-md transition-all shrink-0"
          >
            Sede Catastro <ArrowUpRight size={11} />
          </a>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Map View Area (7 cols) */}
        <div className="md:col-span-7 bg-[#060b18] relative flex items-center justify-center overflow-hidden border-r border-gray-900">
          
          {/* Simulation Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          {/* Satellite vs Catastral Base Map Drawing */}
          {layer === 'satelite' ? (
            <div className="absolute inset-0 bg-radial-gradient from-gray-900 to-black flex items-center justify-center">
              <span className="text-[10px] text-gray-500 font-mono">Modo Satélite: Vista Ortofoto PNOA</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#040812] flex items-center justify-center">
              <span className="text-[10px] text-gray-600 font-mono">Capa Catastral: Cartografía Digital SEC</span>
            </div>
          )}

          {/* The Live Interactive SVG Polygon Parcel representation */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 150" className="w-full max-w-sm h-auto max-h-64 drop-shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              {/* Surrounding background parcel guides (gray lines) */}
              <polygon points="10,10 120,5 90,80 5,70 10,10" fill="none" stroke="#1f2937" strokeWidth="1" strokeDasharray="2,2" />
              <polygon points="120,5 190,20 180,90 90,80 120,5" fill="none" stroke="#1f2937" strokeWidth="1" strokeDasharray="2,2" />
              <polygon points="5,70 90,80 70,145 10,140 5,70" fill="none" stroke="#1f2937" strokeWidth="1" strokeDasharray="2,2" />
              <polygon points="90,80 180,90 190,145 70,145 90,80" fill="none" stroke="#1f2937" strokeWidth="1" strokeDasharray="2,2" />

              {/* Active Selected Parcel (Highlighted in Gold) */}
              <polygon
                points={selectedParcel.boundary.map(p => `${p.x},${p.y}`).join(' ')}
                className="fill-yellow-500/10 stroke-yellow-500 animate-pulse"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Boundary vertex markers */}
              {selectedParcel.boundary.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-white stroke-yellow-500"
                  strokeWidth="1.5"
                />
              ))}

              {/* Center point marker */}
              <g transform="translate(100, 75)">
                <circle cx="0" cy="0" r="1.5" fill="#fff" />
                <path d="M-8,0 H8 M0,-8 V8" stroke="#D4AF37" strokeWidth="0.75" strokeOpacity="0.8" />
              </g>
            </svg>
          </div>

          {/* Overlay Map Controls */}
          <div className="absolute bottom-3 left-3 z-20 flex gap-2">
            <button
              onClick={() => setLayer('catastro')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                layer === 'catastro'
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                  : 'bg-gray-950/80 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Layers size={12} /> Catastro
            </button>
            <button
              onClick={() => setLayer('satelite')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                layer === 'satelite'
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                  : 'bg-gray-950/80 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Crosshair size={12} /> Ortofoto
            </button>
          </div>
        </div>

        {/* Parcel Details / Search Panel (5 cols) */}
        <div className="md:col-span-5 bg-[#0b1329] p-4 flex flex-col justify-between overflow-y-auto">
          {/* Search form */}
          <div className="space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/50 transition-all font-mono"
                placeholder="Ref. Catastral o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
            </form>

            {statusMsg && <p className="text-[10px] text-rose-400 font-semibold">{statusMsg}</p>}

            {/* Quick Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Muestras de Catastro</span>
              <div className="flex flex-col gap-1.5">
                {CATASTRAL_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`text-left p-2 rounded-lg border text-xs flex flex-col transition-all ${
                      selectedParcel.ref === sample.ref
                        ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-500'
                        : 'border-gray-900 bg-gray-950/30 text-gray-300 hover:border-gray-800 hover:bg-gray-950/50'
                    }`}
                  >
                    <span className="font-semibold truncate">{sample.address}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{sample.ref}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Parcel Info Card */}
          <div className="mt-4 border border-gray-800/80 rounded-xl bg-gray-950/40 p-3.5 space-y-3">
            <div className="flex items-start gap-2.5">
              <Info className="text-yellow-500 mt-0.5 shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Detalles Registrados</h4>
                <p className="text-[11px] text-gray-300 font-mono mt-1 break-all">{selectedParcel.ref}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#0b1329] p-2 rounded border border-gray-900">
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Superficie Catastral</span>
                <span className="text-white font-semibold font-mono">{selectedParcel.surface} m²</span>
              </div>
              <div className="bg-[#0b1329] p-2 rounded border border-gray-900">
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Clase de Uso</span>
                <span className="text-white font-semibold">{selectedParcel.use}</span>
              </div>
              <div className="bg-[#0b1329] p-2 rounded border border-gray-900">
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Año Construcción</span>
                <span className="text-white font-semibold font-mono">{selectedParcel.year}</span>
              </div>
              <div className="bg-[#0b1329] p-2 rounded border border-gray-900">
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Titular Catastral</span>
                <span className="text-white font-semibold truncate block">{selectedParcel.owner}</span>
              </div>
            </div>

            <button
              onClick={handleRequestService}
              className="w-full py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-[#0b1329] text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1"
            >
              <CheckCircle2 size={13} /> Solicitar Tasación de esta Parcela
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

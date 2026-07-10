import React, { useState } from 'react';
import { FileSearch, Search, ShieldAlert, FileText, Check, ArrowUpRight, RotateCw } from 'lucide-react';

interface BuscadorNotasSimplesProps {
  onApplyService: (msg: string) => void;
  externalUrl: string;
}

export default function BuscadorNotasSimples({ onApplyService, externalUrl }: BuscadorNotasSimplesProps) {
  const [cru, setCru] = useState('');
  const [municipio, setMunicipio] = useState('Sevilla');
  const [fincaNum, setFincaNum] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchResult(null);

    setTimeout(() => {
      setSearching(false);
      // Mock result based on input
      setSearchResult({
        cru: cru || '29003001248905',
        finca: fincaNum || '45812-A',
        registro: `Registro de la Propiedad de ${municipio} Nº 3`,
        titular: 'Herederos de Carmen Sotomayor Gil',
        cargas: 'Hipoteca activa a favor de Banco Santander (Pte. de Cancelación)',
        descripcion: 'Finca urbana, vivienda unifamiliar pareada sita en término municipal. Consta de planta baja y alta, con jardín privado. Superficie solar: 240 m², Edificados: 165 m².'
      });
    }, 1500);
  };

  const handleRequestSimple = () => {
    if (!searchResult) return;
    const msg = `Hola Jorge, requiero la tramitación oficial de la Nota Simple para la finca registrada en ${searchResult.registro}, Finca Nº ${searchResult.finca}, con CRU/IDUFIR: ${searchResult.cru}. Titular actual: ${searchResult.titular}.`;
    onApplyService(msg);
  };

  return (
    <div className="border border-gray-800 rounded-2xl bg-[#0b1329]/80 backdrop-blur-md shadow-lg p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <FileSearch size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-sans">Buscador y Solicitud de Notas Simples</h3>
            <p className="text-xs text-gray-400">Tramita o localiza inscripciones del Registro de la Propiedad</p>
          </div>
        </div>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-[#0b1329] text-xs font-bold rounded-lg shadow-md transition-all shrink-0"
        >
          Registro Público <ArrowUpRight size={13} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">CRU / IDUFIR</label>
              <input
                type="text"
                maxLength={14}
                className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs font-mono text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                placeholder="29003001248905"
                value={cru}
                onChange={(e) => setCru(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Número de Finca</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs font-mono text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                placeholder="45812-A"
                value={fincaNum}
                onChange={(e) => setFincaNum(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Municipio del Registro</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/50"
              placeholder="Ej. Sevilla, Madrid, Marbella"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg border border-gray-800 transition-all flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <RotateCw size={14} className="animate-spin text-yellow-500" /> Consultando Registro de la Propiedad...
              </>
            ) : (
              <>
                <Search size={14} className="text-yellow-500" /> Consultar Finca (Simulador)
              </>
            )}
          </button>
        </form>

        {/* Results / Help Panel */}
        <div className="flex flex-col justify-between bg-gray-950/40 rounded-xl p-4 border border-gray-800/80 min-h-[200px]">
          {searchResult ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
                  <Check size={14} /> INFORMACIÓN PRELIMINAR LOCALIZADA
                </div>
                
                <div className="space-y-2 text-xs">
                  <p className="text-gray-400"><strong className="text-gray-300">Registro:</strong> {searchResult.registro}</p>
                  <p className="text-gray-400"><strong className="text-gray-300">CRU/IDUFIR:</strong> {searchResult.cru}</p>
                  <p className="text-gray-400"><strong className="text-gray-300">Titular registral:</strong> {searchResult.titular}</p>
                  <p className="text-rose-400"><strong className="text-gray-300">Cargas/Gravámenes:</strong> {searchResult.cargas}</p>
                  <p className="text-gray-400 bg-[#0b1329] p-2.5 rounded border border-gray-900 font-mono text-[10px] leading-relaxed max-h-24 overflow-y-auto">
                    {searchResult.descripcion}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRequestSimple}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-[#0b1329] text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <FileText size={14} /> Solicitar Tramitación Oficial
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3 flex flex-col items-center justify-center my-auto">
              <ShieldAlert className="text-gray-600" size={32} />
              <div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Inicia una consulta</p>
                <p className="text-[11px] text-gray-500 max-w-xs mt-1">
                  Introduce el CRU o datos registrales para ver un extracto simulado. Para notas oficiales, puedes solicitar el trámite urgente directamente a GeoTasalia.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

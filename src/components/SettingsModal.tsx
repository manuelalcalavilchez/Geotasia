import React, { useState } from 'react';
import { ProjectConfig } from '../types';
import { X, Save, RotateCcw, Link2, FileUp, Palette } from 'lucide-react';
import { DEFAULT_CONFIG } from '../data';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  onSave: (newConfig: ProjectConfig) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<ProjectConfig>({ ...config });
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        ...DEFAULT_CONFIG,
        ...config
      });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleChange = (key: keyof ProjectConfig, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleRestore = () => {
    if (window.confirm('¿Deseas restaurar las URLs por defecto?')) {
      setFormData({ ...DEFAULT_CONFIG });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-[#0b1329] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-[#0d1630] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white font-sans">Configurar Enlaces Externos</h2>
              <p className="text-[10px] sm:text-xs text-gray-400">Personaliza las URLs de "tus botoncitos" y el Buzón Seguro</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-h-0 scrollbar-thin scrollbar-thumb-gray-800">
            {/* kDrive Upload Link */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-yellow-500 flex items-center gap-2">
              <FileUp size={16} /> Buzón Seguro (Enlace kDrive / Infomaniak)
            </label>
            <input
              type="url"
              required
              className="w-full px-4 py-2.5 bg-gray-950/60 border border-gray-800 rounded-xl focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 text-gray-100 outline-none transition-all font-mono text-xs"
              placeholder="https://kdrop.kdrive.infomaniak.com/..."
              value={formData.kDriveUrl}
              onChange={(e) => handleChange('kDriveUrl', e.target.value)}
            />
            <p className="text-[11px] text-gray-400">
              Esta es la URL de tu buzón kDrive seguro. Al hacer clic en "Enviar Documentación" o "Ir al Buzón Seguro", los clientes accederán aquí.
            </p>
          </div>

          <div className="border-t border-gray-900/60 my-4"></div>

          {/* Other Service Links */}
          <h3 className="text-sm font-medium text-white uppercase tracking-wider">Enlaces de tus Aplicaciones ("Tus Botoncicos")</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Geovisor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Enlace: geovisor</label>
              <input
                type="url"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.externalGeovisorUrl}
                onChange={(e) => handleChange('externalGeovisorUrl', e.target.value)}
              />
            </div>

            {/* Gestor de rutas */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Enlace: gestor de rutas</label>
              <input
                type="url"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.externalRutasUrl}
                onChange={(e) => handleChange('externalRutasUrl', e.target.value)}
              />
            </div>

            {/* Visor urbanístico */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Enlace: visor urbanístico</label>
              <input
                type="url"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.externalVisorUrbanisticoUrl}
                onChange={(e) => handleChange('externalVisorUrbanisticoUrl', e.target.value)}
              />
            </div>

            {/* Análisis registral */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Enlace: análisis registral</label>
              <input
                type="url"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.externalNotasSimplesUrl}
                onChange={(e) => handleChange('externalNotasSimplesUrl', e.target.value)}
              />
            </div>

            {/* Portal Aplicaciones */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-medium text-gray-300">Página Web Principal / Corporativa de Servicios</label>
              <input
                type="url"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.externalAplicacionesUrl}
                onChange={(e) => handleChange('externalAplicacionesUrl', e.target.value)}
              />
            </div>
          </div>

          {/* Web Aesthetics Selector */}
          <div className="border-t border-gray-900/60 my-4"></div>
          
          <h3 className="text-sm font-medium text-yellow-500 uppercase tracking-wider flex items-center gap-2">
            <Palette size={16} /> Estética y Colores del Portal
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Theme Card 1 */}
            <button
              type="button"
              onClick={() => handleChange('theme', 'navy-gold')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                formData.theme === 'navy-gold' || !formData.theme
                  ? 'border-yellow-500 bg-yellow-500/5'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-white">Gabinete Clásico</span>
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              </div>
              <div className="flex gap-1">
                <span className="h-3 w-3 rounded-sm bg-[#040814]"></span>
                <span className="h-3 w-3 rounded-sm bg-[#0b1329]"></span>
                <span className="h-3 w-3 rounded-sm bg-[#eab308]"></span>
              </div>
              <p className="text-[9px] text-gray-400 mt-1.5 font-sans">Slate y oro elegante corporativo.</p>
            </button>

            {/* Theme Card 2 */}
            <button
              type="button"
              onClick={() => handleChange('theme', 'emerald-warm')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                formData.theme === 'emerald-warm'
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-white">Rústico Agrícola</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex gap-1">
                <span className="h-3 w-3 rounded-sm bg-[#03140f]"></span>
                <span className="h-3 w-3 rounded-sm bg-[#072a20]"></span>
                <span className="h-3 w-3 rounded-sm bg-[#fbbf24]"></span>
              </div>
              <p className="text-[9px] text-gray-400 mt-1.5 font-sans">Verde monte y ámbar tradicional.</p>
            </button>

            {/* Theme Card 3 */}
            <button
              type="button"
              onClick={() => handleChange('theme', 'cyan-steel')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                formData.theme === 'cyan-steel'
                  ? 'border-cyan-400 bg-cyan-400/5'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-white">Soporte Técnico</span>
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              </div>
              <div className="flex gap-1">
                <span className="h-3 w-3 rounded-sm bg-[#0b0f19]"></span>
                <span className="h-3 w-3 rounded-sm bg-[#16222f]"></span>
                <span className="h-3 w-3 rounded-sm bg-[#22d3ee]"></span>
              </div>
              <p className="text-[9px] text-gray-400 mt-1.5 font-sans">Cian y acero de alta tecnología.</p>
            </button>

            {/* Theme Card 4 */}
            <button
              type="button"
              onClick={() => handleChange('theme', 'minimal-light')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                formData.theme === 'minimal-light'
                  ? 'border-amber-600 bg-amber-500/5'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-200">Modo Claro</span>
                <span className="h-2 w-2 rounded-full bg-amber-600"></span>
              </div>
              <div className="flex gap-1">
                <span className="h-3 w-3 rounded-sm bg-[#f8fafc]"></span>
                <span className="h-3 w-3 rounded-sm bg-white border border-slate-200"></span>
                <span className="h-3 w-3 rounded-sm bg-[#ca8a04]"></span>
              </div>
              <p className="text-[9px] text-gray-400 mt-1.5 font-sans">Limpio y claro para pleno día.</p>
            </button>
          </div>

          <div className="border-t border-gray-900/60 my-4"></div>

          {/* Custom Logo & RGPD Configuration */}
          <h3 className="text-sm font-medium text-yellow-500 uppercase tracking-wider">Identidad Visual y Protección de Datos (RGPD)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Logo URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-medium text-gray-300">URL del Logotipo Personalizado (PNG / JPG / SVG)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                placeholder="https://ejemplo.com/mi-logo.png (Dejar vacío para usar monograma dorado por defecto)"
                value={formData.customLogoUrl || ''}
                onChange={(e) => handleChange('customLogoUrl', e.target.value)}
              />
              <p className="text-[10px] text-gray-400">Si se especifica, sustituirá al monograma SVG dorado del encabezado de la página.</p>
            </div>

            {/* RGPD Responsable */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Responsable del Tratamiento</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs outline-none focus:border-yellow-500/50"
                value={formData.rgpdResponsable || ''}
                onChange={(e) => handleChange('rgpdResponsable', e.target.value)}
              />
            </div>

            {/* RGPD NIF */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">NIF / CIF del Responsable</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.rgpdNif || ''}
                onChange={(e) => handleChange('rgpdNif', e.target.value)}
              />
            </div>

            {/* RGPD Direccion */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-medium text-gray-300">Dirección Postal para Notificaciones RGPD</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs outline-none focus:border-yellow-500/50"
                value={formData.rgpdDireccion || ''}
                onChange={(e) => handleChange('rgpdDireccion', e.target.value)}
              />
            </div>

            {/* RGPD Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Correo Electrónico de Contacto RGPD</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.rgpdEmail || ''}
                onChange={(e) => handleChange('rgpdEmail', e.target.value)}
              />
            </div>

            {/* RGPD Delegado de Protección de Datos */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Email del DPD o Gestión (Opcional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-950/40 border border-gray-800 rounded-lg text-xs font-mono outline-none focus:border-yellow-500/50"
                value={formData.rgpdDpd || ''}
                onChange={(e) => handleChange('rgpdDpd', e.target.value)}
              />
            </div>
          </div>

          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 sm:p-6 border-t border-gray-800 bg-[#0d1630] shrink-0">
            <button
              type="button"
              onClick={handleRestore}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} /> Restaurar valores por defecto
            </button>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={success}
                className="flex items-center gap-2 px-5 py-2 text-xs bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-[#0b1329] font-semibold rounded-lg transition-all shadow-lg shadow-yellow-500/10 cursor-pointer"
              >
                {success ? '¡Guardado con éxito!' : (
                  <>
                    <Save size={14} /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

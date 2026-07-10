import React, { useState } from 'react';
import { 
  Settings, Phone, Mail, MessageSquare, ExternalLink, 
  ChevronRight, Send, ShieldCheck, Award, MapPin, 
  Globe, Map, Route, Compass, BookOpen, Lock, Unlock, 
  LogIn, LogOut, Info, Shield, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { ProjectConfig } from './types';
import { DEFAULT_CONFIG } from './data';

import Logo from './components/Logo';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Load configuration from localStorage or fallback to default
  const [config, setConfig] = useState<ProjectConfig>(() => {
    const saved = localStorage.getItem('geotasalia_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed
        };
      } catch (e) {
        console.error('Error parsing config, using defaults', e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Auth state
  const [userRole, setUserRole] = useState<'guest' | 'cliente' | 'admin'>(() => {
    return (localStorage.getItem('geotasalia_user_role') as 'guest' | 'cliente' | 'admin') || 'guest';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPurpose, setAuthPurpose] = useState<'general' | 'tool'>('general');
  const [selectedToolName, setSelectedToolName] = useState('');
  
  // Auth form credentials state
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Legal Modal states
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'legal' | 'cookies' | null>(null);

  // Contact Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Valoración Agrícola',
    cadastralRef: '',
    message: '',
    rgpdAccepted: false
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: number; progress?: number; status: 'uploading' | 'success' | 'error' }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Email Dispatch Modal state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [preparedEmail, setPreparedEmail] = useState({ to: '', bcc: '', subject: '', body: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);

    // Simulate uploading for each file
    newFiles.forEach(newFile => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 25) + 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setAttachedFiles(prev => prev.map(f => f.name === newFile.name ? { ...f, progress: 100, status: 'success' } : f));
        } else {
          setAttachedFiles(prev => prev.map(f => f.name === newFile.name ? { ...f, progress: currentProgress } : f));
        }
      }, 150);
    });
  };

  const removeFile = (fileName: string) => {
    setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const saveConfig = (newConfig: ProjectConfig) => {
    setConfig(newConfig);
    localStorage.setItem('geotasalia_config', JSON.stringify(newConfig));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rgpdAccepted) {
      alert('Debe aceptar la Política de Privacidad de datos para enviar su consulta.');
      return;
    }
    setFormSubmitted(true);
    
    // Create WhatsApp/Email pre-filled link for Jorge & BCC arnydivision@gmail.com (hidden)
    const subject = `[GeoTasalia] Solicitud de Consulta Técnica: ${formData.service}`;
    
    let filesListText = '';
    if (attachedFiles.length > 0) {
      filesListText = `\nDOCUMENTACIÓN ADJUNTA PRESENTADA (${attachedFiles.length} archivos):\n` +
        attachedFiles.map(f => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join('\n') + `\n`;
    }

    const body = 
      `Estimado Jorge,\n\n` +
      `Se ha recibido una nueva consulta técnica desde el portal corporativo:\n\n` +
      `-----------------------------------------\n` +
      `Nombre: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Teléfono: ${formData.phone}\n` +
      `Servicio solicitado: ${formData.service}\n` +
      `Ref. Catastral: ${formData.cadastralRef || 'No aportada'}\n` +
      `${filesListText}` +
      `-----------------------------------------\n\n` +
      `Descripción de la Consulta:\n` +
      `${formData.message}\n` +
      `-----------------------------------------\n\n` +
      `✓ El cliente ha aceptado de forma expresa la política de protección de datos (RGPD) en base al Responsable del Tratamiento especificado en la configuración del gabinete.\n\n` +
      `Un saludo,\n` +
      `Sistema de Soporte GeoTasalia`;
    
    setTimeout(() => {
      setFormSubmitted(false);
      setPreparedEmail({
        to: 'jorge.martinez@geotasalia.es',
        bcc: 'arnydivision@gmail.com',
        subject: subject,
        body: body
      });
      setIsDispatchModalOpen(true);
    }, 1200);
  };

  // Helper to handle smooth scrolls
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Pre-fill form from buttons if they want to ask for info on specific services
  const prefillService = (serviceName: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      service: serviceName,
      message: text
    }));
    scrollToSection('contacto-tecnico');
  };

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const username = authUsername.trim().toLowerCase();
    const password = authPassword;

    if (username === 'admin' && password === 'admin2026') {
      setUserRole('admin');
      localStorage.setItem('geotasalia_user_role', 'admin');
      setIsAuthModalOpen(false);
      resetAuthForm();
    } else if (username === 'cliente' && password === 'cliente2026') {
      setUserRole('cliente');
      localStorage.setItem('geotasalia_user_role', 'cliente');
      setIsAuthModalOpen(false);
      resetAuthForm();
    } else {
      setAuthError('Credenciales incorrectas. Pruebe "cliente" / "cliente2026" para visualizar herramientas o "admin" / "admin2026" para gestión.');
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    localStorage.removeItem('geotasalia_user_role');
  };

  const resetAuthForm = () => {
    setAuthUsername('');
    setAuthPassword('');
    setAuthError('');
  };

  const triggerToolAccess = (toolName: string) => {
    if (userRole !== 'guest') {
      // Allow access!
      return true;
    } else {
      // Locked: Trigger auth modal with context
      setAuthPurpose('tool');
      setSelectedToolName(toolName);
      setIsAuthModalOpen(true);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#040814] text-gray-200 selection:bg-yellow-500/30 selection:text-yellow-200 relative overflow-x-hidden">
      
      {/* Decorative Top Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-[#d4af37]/5 via-transparent to-transparent -z-10 blur-3xl pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="border-b border-gray-900 bg-[#060c1e]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} customLogoUrl={config.customLogoUrl} />
            <div>
              <span className="font-sans font-bold text-white tracking-widest text-sm uppercase">GEOTASALIA</span>
              <span className="hidden sm:inline text-[10px] text-yellow-500 tracking-[0.2em] uppercase ml-2 border-l border-gray-800 pl-2">
                Ingeniería Agrícola y Valoración
              </span>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToSection('herramientas-enlaces')} 
              className="text-xs text-gray-400 hover:text-white transition-colors hidden md:block"
            >
              Herramientas Técnicas
            </button>
            <button 
              onClick={() => scrollToSection('especialidades')} 
              className="text-xs text-gray-400 hover:text-white transition-colors hidden lg:block"
            >
              Servicios
            </button>
            <button 
              onClick={() => scrollToSection('contacto-tecnico')} 
              className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 transition-all font-semibold"
            >
              Contacto
            </button>

            <span className="h-4 w-px bg-gray-800 hidden md:block"></span>

            {/* Auth Session Button */}
            {userRole === 'guest' ? (
              <button
                onClick={() => {
                  setAuthPurpose('general');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-yellow-500 bg-gray-950/60 border border-gray-800 px-2.5 py-1.5 rounded-lg transition-all"
                title="Acceso Clientes / Admin"
              >
                <LogIn size={13} />
                <span className="hidden sm:inline">Acceso Privado</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#091024] border border-gray-800 pl-2.5 pr-1.5 py-1 rounded-lg">
                <span className={`h-1.5 w-1.5 rounded-full ${userRole === 'admin' ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300 font-mono">
                  {userRole === 'admin' ? 'Gabinete (Admin)' : 'Cliente'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-gray-800 text-gray-400 hover:text-red-400 rounded-md transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Settings trigger only visible for Admin */}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg border border-yellow-500/30 transition-all animate-pulse"
                title="Configuración de Enlaces y RGPD"
                id="settings-trigger-btn"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-6">
        <Logo size="lg" showText={true} customLogoUrl={config.customLogoUrl} />
        
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.3em] text-yellow-500 uppercase">Gabinete Técnico Agropecuario</p>
          <h2 className="text-2xl sm:text-3xl font-light text-white font-sans tracking-tight">
            Ingeniería Agrícola & Valoraciones Rústicas
          </h2>
        </div>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 font-light leading-relaxed">
          Especialistas en tasaciones oficiales de fincas, dictámenes periciales rústicos, proyectos de regadío, topografía de precisión y análisis de viabilidad registral. Rigor técnico y confidencialidad en cada proyecto.
        </p>

        {/* Action Directives / Contact buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <a
            href="tel:633067650"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-950/80 hover:bg-gray-950 border border-gray-800 rounded-xl text-xs font-semibold text-gray-200 transition-all hover:border-yellow-500/40"
            id="call-jorge-link"
          >
            <Phone size={14} className="text-yellow-500" /> Llamar: 633 067 650
          </a>
          <a
            href="mailto:jorge.martinez@geotasalia.es"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-950/80 hover:bg-gray-950 border border-gray-800 rounded-xl text-xs font-semibold text-gray-200 transition-all hover:border-yellow-500/40"
            id="mail-jorge-link"
          >
            <Mail size={14} className="text-yellow-500" /> jorge.martinez@geotasalia.es
          </a>
          <a
            href="https://wa.me/34633067650?text=Hola%20Jorge,%20necesito%20consultarte%20un%20servicio%20técnico%20de%20ingeniería/valoración%20agrícola"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-400 transition-all"
            id="whatsapp-jorge-link"
          >
            <MessageSquare size={14} /> WhatsApp Directo
          </a>
          <a
            href={config.externalAplicacionesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl text-xs font-semibold text-yellow-500 transition-all"
            id="corporate-site-link"
          >
            <Globe size={14} /> Web Principal <ExternalLink size={11} />
          </a>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-16">
        
        {/* SECTION: Direct Tool Launchers ("Tus botoncicos") */}
        <section id="herramientas-enlaces" className="space-y-6">
          <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display flex items-center justify-center md:justify-start gap-2">
                <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
                Herramientas Técnicas y Enlaces Exclusivos
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Utilidades de cartografía, planificación de salidas al campo y verificación rústica para clientes del gabinete:
              </p>
            </div>
            
            {userRole === 'guest' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-[10px] text-yellow-500 uppercase tracking-widest font-semibold">
                <Lock size={12} /> Acceso restringido a clientes
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* BUTTON 1: geovisor */}
            <a 
              href={userRole !== 'guest' ? config.externalGeovisorUrl : undefined} 
              onClick={(e) => {
                if (!triggerToolAccess('geovisor')) e.preventDefault();
              }}
              target={userRole !== 'guest' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group p-5 bg-[#0b1329]/60 border border-gray-800 rounded-2xl hover:border-yellow-500/50 hover:bg-[#0b1329] transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-geovisor"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl w-fit group-hover:bg-yellow-500 group-hover:text-[#0b1329] transition-colors">
                    <Map size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-gray-600 group-hover:text-yellow-500/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-white uppercase tracking-wider group-hover:text-yellow-500 transition-colors">geovisor</h3>
                <p className="text-xs text-gray-400 line-clamp-2">Visualización ágil de parcelación, linderos y cartografía catastral rústica.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-yellow-500 font-semibold pt-2">
                <span>{userRole === 'guest' ? 'Exclusivo Clientes' : 'Abrir visor'}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* BUTTON 2: gestor de rutas */}
            <a 
              href={userRole !== 'guest' ? config.externalRutasUrl : undefined} 
              onClick={(e) => {
                if (!triggerToolAccess('gestor de rutas')) e.preventDefault();
              }}
              target={userRole !== 'guest' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group p-5 bg-[#0b1329]/60 border border-gray-800 rounded-2xl hover:border-yellow-500/50 hover:bg-[#0b1329] transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-rutas"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl w-fit group-hover:bg-yellow-500 group-hover:text-[#0b1329] transition-colors">
                    <Route size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-gray-600 group-hover:text-yellow-500/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-white uppercase tracking-wider group-hover:text-yellow-500 transition-colors">gestor de rutas</h3>
                <p className="text-xs text-gray-400 line-clamp-2">Planificación de salidas al campo, cálculo de distancias y logística técnica.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-yellow-500 font-semibold pt-2">
                <span>{userRole === 'guest' ? 'Exclusivo Clientes' : 'Planificar salida'}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* BUTTON 3: visor urbanístico */}
            <a 
              href={userRole !== 'guest' ? config.externalVisorUrbanisticoUrl : undefined} 
              onClick={(e) => {
                if (!triggerToolAccess('visor urbanístico')) e.preventDefault();
              }}
              target={userRole !== 'guest' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group p-5 bg-[#0b1329]/60 border border-gray-800 rounded-2xl hover:border-yellow-500/50 hover:bg-[#0b1329] transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-urbanismo"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl w-fit group-hover:bg-yellow-500 group-hover:text-[#0b1329] transition-colors">
                    <Compass size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-gray-600 group-hover:text-yellow-500/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-white uppercase tracking-wider group-hover:text-yellow-500 transition-colors">visor urbanístico</h3>
                <p className="text-xs text-gray-400 line-clamp-2">Calificaciones de suelo rústico, planeamiento urbanístico municipal y ordenación.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-yellow-500 font-semibold pt-2">
                <span>{userRole === 'guest' ? 'Exclusivo Clientes' : 'Consultar urbanismo'}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* BUTTON 4: análisis registral */}
            <a 
              href={userRole !== 'guest' ? config.externalNotasSimplesUrl : undefined} 
              onClick={(e) => {
                if (!triggerToolAccess('análisis registral')) e.preventDefault();
              }}
              target={userRole !== 'guest' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group p-5 bg-[#0b1329]/60 border border-gray-800 rounded-2xl hover:border-yellow-500/50 hover:bg-[#0b1329] transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-registro"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl w-fit group-hover:bg-yellow-500 group-hover:text-[#0b1329] transition-colors">
                    <BookOpen size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-gray-600 group-hover:text-yellow-500/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-white uppercase tracking-wider group-hover:text-yellow-500 transition-colors">análisis registral</h3>
                <p className="text-xs text-gray-400 line-clamp-2">Buscador y verificación técnica de cargas, titularidades y fincas registrales.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-yellow-500 font-semibold pt-2">
                <span>{userRole === 'guest' ? 'Exclusivo Clientes' : 'Verificar finca'}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

          </div>
          
          <div className="p-3 bg-gray-950/40 rounded-xl border border-gray-900 text-center">
            {userRole === 'guest' ? (
              <p className="text-[11px] text-gray-400">
                🔒 <span className="font-semibold text-gray-300">¿Eres cliente de GeoTasalia?</span> Pulsa el botón de <span className="text-yellow-500 font-semibold underline cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>Acceso Privado</span> para desbloquear el acceso instantáneo a todas las plataformas con tus credenciales.
              </p>
            ) : (
              <p className="text-[11px] text-emerald-400">
                ✔️ <span className="font-semibold">Acceso de Cliente Concedido:</span> Tiene acceso directo completo a las herramientas técnicas. {userRole === 'admin' && 'Como administrador, puede personalizar estas URLs desde el botón de engranaje superior.'}
              </p>
            )}
          </div>
        </section>

        {/* SECTION: Core Business Services Presentation */}
        <section id="especialidades" className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display flex items-center justify-center md:justify-start gap-2">
              <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
              Especialidades en Ingeniería Agrónoma y Consultoría
            </h2>
            <p className="text-xs text-gray-400 mt-1">Servicios técnicos integrales adaptados a las normativas vigentes en España</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SERVICE CARD 1 */}
            <div 
              onClick={() => prefillService('Valoración Agrícola', 'Hola Jorge, solicito información y presupuesto detallado para la tasación oficial de una finca rústica o valoración de cultivo.')}
              className="p-6 bg-gradient-to-b from-[#090f22] to-[#060b19] border border-gray-900 rounded-2xl hover:border-yellow-500/20 transition-all cursor-pointer group text-left animate-fade-in"
            >
              <h3 className="text-base font-semibold text-white group-hover:text-yellow-500 transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
                Valoraciones Agrícolas
              </h3>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Tasaciones oficiales de fincas rústicas para herencias, divorcios, expropiaciones forzosas, garantías hipotecarias y valoraciones de cosechas, cultivos leñosos o derechos de agua de riego.
              </p>
              <div className="mt-4 text-[11px] font-semibold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                Solicitar presupuesto <ChevronRight size={12} />
              </div>
            </div>

            {/* SERVICE CARD 2 */}
            <div 
              onClick={() => prefillService('Ingeniería Agrícola', 'Hola Jorge, necesito consultarte sobre un proyecto técnico de ingeniería agrícola (pozos, balsas de riego o naves).')}
              className="p-6 bg-gradient-to-b from-[#090f22] to-[#060b19] border border-gray-900 rounded-2xl hover:border-yellow-500/20 transition-all cursor-pointer group text-left animate-fade-in"
            >
              <h3 className="text-base font-semibold text-white group-hover:text-yellow-500 transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
                Ingeniería Agronómica
              </h3>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Proyectos de legalización de pozos, diseño de balsas e infraestructuras de riego, naves agrícolas, planes de ordenación de explotaciones, estudios de impacto ambiental e informes periciales.
              </p>
              <div className="mt-4 text-[11px] font-semibold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                Solicitar información <ChevronRight size={12} />
              </div>
            </div>

            {/* SERVICE CARD 3 */}
            <div 
              onClick={() => prefillService('Topografía y Catastro', 'Hola Jorge, necesito realizar un levantamiento topográfico, deslinde o subsanación de discrepancias catastrales.')}
              className="p-6 bg-gradient-to-b from-[#090f22] to-[#060b19] border border-gray-900 rounded-2xl hover:border-yellow-500/20 transition-all cursor-pointer group text-left animate-fade-in"
            >
              <h3 className="text-base font-semibold text-white group-hover:text-yellow-500 transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
                Topografía y Catastro
              </h3>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Mediciones de fincas rústicas mediante GPS de precisión, deslindes contradictorios, segregaciones, planos GML y tramitación de expedientes catastrales (art. 18.1 LCI) por discrepancias de cabida.
              </p>
              <div className="mt-4 text-[11px] font-semibold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                Solicitar topografía <ChevronRight size={12} />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: Technical Inquiry Form with Integrated kDrive Option */}
        <section id="contacto-tecnico" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Brand Info Rail (4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                Garantía de Privacidad
              </h3>
              
              <div className="space-y-4 text-xs text-gray-400">
                <div className="flex gap-3">
                  <Award className="text-yellow-500 shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-gray-300">Ingeniería Certificada</p>
                    <p className="mt-0.5">Todos nuestros dictámenes, tasaciones oficiales e informes de linderos se emiten con validez oficial ante notarías, registros de la propiedad, catastro y juzgados.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck className="text-yellow-500 shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-gray-300">Tratamiento Seguro RGPD</p>
                    <p className="mt-0.5">Cumplimiento estricto de la normativa española y europea en el tratamiento de su información catastral, planos y escrituras.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="text-yellow-500 shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-gray-300">Ámbito de Cobertura</p>
                    <p className="mt-0.5">Asistencia técnica agropecuaria y mediciones de campo rústicas en toda Andalucía meridional, Extremadura y zona centro.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link block */}
            <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 space-y-3">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-mono">Enlaces de Servicios Corporativos</p>
              <div className="grid grid-cols-1 gap-2">
                <a 
                  href={config.externalAplicacionesUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-yellow-500 hover:underline flex items-center justify-between"
                >
                  Página Web Geotasalia <ExternalLink size={10} />
                </a>
                <button 
                  onClick={() => scrollToSection('herramientas-enlaces')} 
                  className="text-xs text-yellow-500 hover:underline flex items-center justify-between text-left"
                >
                  Acceso Herramientas Técnicas <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Form Area (8 cols) */}
          <div className="lg:col-span-8 border border-gray-800 rounded-2xl bg-[#0b1329]/50 backdrop-blur-md shadow-lg p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                Formulario de Consulta Técnica
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Háganos llegar sus dudas catastrales o necesidades de valoración para recibir respuesta en menos de 24 horas.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Nombre / Empresa</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Teléfono de contacto</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                    placeholder="633067650"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Área o Tipo de Servicio</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white focus:border-yellow-500/50 outline-none animate-none"
                    value={formData.service}
                    onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                  >
                    <option value="Valoración Agrícola">Valoración Agrícola / Fincas Rústicas</option>
                    <option value="Ingeniería Agrícola">Ingeniería Agrícola / Pozos y Balsas</option>
                    <option value="Topografía y Catastro">Topografía, Deslindes y Cabidas</option>
                    <option value="Informes Periciales">Dictamen / Informe Pericial Judicial</option>
                    <option value="Análisis Registral">Análisis Registral de Cargas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">Referencia Catastral (Opcional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs font-mono text-white placeholder-gray-600 outline-none focus:border-yellow-500/50"
                    placeholder="Ej. 4752801VK4745S0001YD"
                    value={formData.cadastralRef}
                    onChange={(e) => setFormData(prev => ({ ...prev, cadastralRef: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Descripción de la Consulta Técnica</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/50 resize-none"
                  placeholder="Escriba las características de su parcela o describa el trabajo que requiere..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              {/* Interactive File Uploader with Drag and Drop & Progress Bar */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-300">
                  Planos, escrituras o notas simples (Opcional - Adjuntar al Formulario)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 cursor-pointer relative ${
                    isDragging
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-gray-800 bg-[#0d1630]/30 hover:border-gray-700 hover:bg-[#0d1630]/50'
                  }`}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.svg,.zip,.gml,.xml"
                  />
                  <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Arrastre sus documentos aquí o haga clic para seleccionarlos
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Admite PDF, Imágenes (PNG, JPG), Planos GML, XML o archivos ZIP (Máx. 25MB)
                    </p>
                  </div>
                </div>

                {/* Attached Files List with Upload Progress Simulation */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2 bg-[#091024]/60 border border-gray-900 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Documentos Preparados para el Gabinete ({attachedFiles.length})
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex flex-col gap-1 bg-gray-950/40 border border-gray-800/60 rounded-lg p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="truncate max-w-[70%] font-medium text-gray-200">{file.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 font-mono">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              {file.status === 'uploading' ? (
                                <span className="text-[10px] text-yellow-500 font-medium animate-pulse">
                                  Cargando...
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Listo
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.name);
                                }}
                                className="text-gray-500 hover:text-red-400 p-0.5 transition-colors font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                          
                          {/* File progress bar */}
                          {file.status === 'uploading' && (
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-yellow-500 h-full transition-all duration-200"
                                style={{ width: `${file.progress || 0}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Secondary Secure kDrive Link */}
                <div className="flex items-center justify-between p-2.5 bg-blue-950/20 rounded-lg border border-blue-500/10 text-[10px] text-gray-400">
                  <p className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    ¿Prefieres subir a nuestro kDrive encriptado directamente?
                  </p>
                  <a
                    href={config.kDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
                  >
                    Abrir kDrive <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* GDPR Legal Consent and Detailed Board */}
              <div className="space-y-3 pt-3 border-t border-gray-900/60">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 shrink-0 rounded border-gray-800 bg-gray-950/60 text-yellow-500 focus:ring-yellow-500/30 focus:ring-offset-0"
                    checked={formData.rgpdAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, rgpdAccepted: e.target.checked }))}
                  />
                  <span className="text-[11px] text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    He leído y acepto expresamente la <span className="text-yellow-500 font-semibold underline" onClick={(e) => { e.preventDefault(); setActiveLegalModal('privacy'); }}>Política de Privacidad de GEOTASALIA</span> de conformidad con el Reglamento General de Protección de Datos (RGPD) europeo y la Ley Orgánica 3/2018 (LOPDGDD).
                  </span>
                </label>

                {/* Detailed Dynamic Spanish GDPR Summary Grid */}
                <div className="bg-gray-950/40 border border-gray-900 rounded-xl p-3 text-[10px] text-gray-400 space-y-2 leading-relaxed">
                  <p className="font-semibold text-gray-300 border-b border-gray-900 pb-1 uppercase tracking-wider text-[8px]">
                    Información Básica sobre Protección de Datos (RGPD)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 font-sans">
                    <p>
                      <strong className="text-gray-300">Responsable:</strong> {config.rgpdResponsable || 'Jorge Martínez Martínez - GEOTASALIA'} (NIF: {config.rgpdNif || '44321987-X'})
                    </p>
                    <p>
                      <strong className="text-gray-300">Finalidad:</strong> Tramitar su consulta técnica, tasación o estudio agronómico y contacto técnico comercial.
                    </p>
                    <p>
                      <strong className="text-gray-300">Legitimación:</strong> Consentimiento expreso del interesado mediante marcado de casilla.
                    </p>
                    <p>
                      <strong className="text-gray-300">Dirección:</strong> {config.rgpdDireccion || 'Calle Técnica Agrónoma 14, Alcalá de Guadaíra, 41500 Sevilla'}
                    </p>
                    <p className="sm:col-span-2">
                      <strong className="text-gray-300">Derechos:</strong> Acceso, rectificación, supresión y portabilidad enviando un email a <span className="text-yellow-500">{config.rgpdEmail || 'jorge.martinez@geotasalia.es'}</span> {config.rgpdDpd && <span>o DPD: <span className="text-yellow-500">{config.rgpdDpd}</span></span>}.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitted}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-[#0b1329] text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-500/10 transition-all flex items-center justify-center gap-2"
              >
                {formSubmitted ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0b1329] border-t-transparent rounded-full animate-spin"></div>
                    Procesando consulta...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Enviar Consulta a Geotasalia
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="border-t border-gray-900 bg-[#02040a] mt-24 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-900 pb-8">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} customLogoUrl={config.customLogoUrl} />
              <div>
                <p className="text-xs font-bold text-white tracking-widest uppercase">GEOTASALIA</p>
                <p className="text-[10px] text-gray-500">Gabinete de Ingeniería Agrónoma &copy; 2026. Todos los derechos reservados.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              <button onClick={() => setActiveLegalModal('legal')} className="hover:text-yellow-500">Aviso Legal</button>
              <span>&bull;</span>
              <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-yellow-500">Política de Privacidad</button>
              <span>&bull;</span>
              <button onClick={() => setActiveLegalModal('cookies')} className="hover:text-yellow-500">Política de Cookies</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-600">
            <p>
              Diseño de identidad visual verificado para Jorge Martínez - Ingeniería Rústica.
            </p>
            
            {/* TECNOLOGIA ALCALA CREDIT SIGNATURE */}
            <p className="font-mono flex items-center gap-1 bg-gray-950/40 px-3 py-1.5 rounded-lg border border-gray-900/60 text-gray-500">
              Desarrollada por <span className="text-yellow-500/80 font-bold tracking-wider hover:text-yellow-500 transition-colors">Tecnologia Alcalá</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Auth / Login Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1329] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100">
            <div className="p-6 border-b border-gray-800 bg-[#0d1630]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogIn className="text-yellow-500" size={18} />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    {authPurpose === 'tool' ? 'Herramienta Restringida' : 'Acceso Privado'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    resetAuthForm();
                  }}
                  className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {authPurpose === 'tool' 
                  ? `Para abrir la herramienta "${selectedToolName}" necesita acceder como cliente registrado de GeoTasalia.` 
                  : 'Ingrese sus credenciales de cliente para acceder a las herramientas técnicas o de administrador para gestionar.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex gap-2 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{authError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Usuario de Acceso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. cliente o admin"
                  className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500/50 font-mono"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">Contraseña Secreta</label>
                <input
                  type="password"
                  required
                  placeholder="Ej. cliente2026 o admin2026"
                  className="w-full px-3 py-2 bg-gray-950/60 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500/50 font-mono"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-[#0b1329] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Acceder a la Plataforma
              </button>

              <div className="p-3 bg-gray-950/30 rounded-xl border border-gray-900 text-center text-[10px] text-gray-400">
                💡 <span className="font-semibold text-gray-300">Indicación de prueba:</span> Use usuario <span className="text-yellow-500 font-mono">cliente</span> y clave <span className="text-yellow-500 font-mono">cliente2026</span> para simular la visualización de un cliente rústico registrado, o <span className="text-yellow-500 font-mono">admin</span> / <span className="text-yellow-500 font-mono">admin2026</span> para administración.
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customizable Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={saveConfig}
      />

      {/* Legal / Policy Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0b1329] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-200 text-left">
            <div className="p-6 border-b border-gray-800 bg-[#0d1630] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-yellow-500" size={18} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                  {activeLegalModal === 'privacy' && 'Política de Privacidad y Tratamiento (RGPD)'}
                  {activeLegalModal === 'legal' && 'Aviso Legal'}
                  {activeLegalModal === 'cookies' && 'Política de Cookies'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded-lg transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-xs text-gray-400 leading-relaxed font-sans">
              {activeLegalModal === 'privacy' && (
                <>
                  <p className="text-gray-300 font-bold text-sm">1. Responsabilidad sobre sus datos personales</p>
                  <p>
                    De acuerdo con el Reglamento General de Protección de Datos (RGPD) de la UE 2016/679 y la Ley Orgánica 3/2018 de Protección de Datos Personales (LOPDGDD), el interesado queda informado de que el responsable del tratamiento de los datos aportados en este formulario es <strong className="text-gray-300">{config.rgpdResponsable}</strong>, con domicilio legal en <strong className="text-gray-300">{config.rgpdDireccion}</strong> y NIF <strong className="text-gray-300">{config.rgpdNif}</strong>.
                  </p>

                  <p className="text-gray-300 font-bold text-sm">2. Finalidad del Tratamiento</p>
                  <p>
                    Los datos recabados únicamente se destinarán al estudio de su finca o parcela rústica, el cálculo técnico de honorarios correspondientes y la tramitación de la consulta técnica requerida (valoraciones, topografía, proyectos de pozos, etc.). Los datos nunca serán vendidos ni transferidos con fines comerciales ajenos a este gabinete.
                  </p>

                  <p className="text-gray-300 font-bold text-sm">3. Legitimación y Conservación</p>
                  <p>
                    La base jurídica que legitima este tratamiento es su consentimiento expreso al marcar la casilla voluntaria de envío. Los datos personales proporcionados se conservarán durante los plazos legalmente previstos para la prescripción de responsabilidades contractuales u obligaciones del encargo técnico.
                  </p>

                  <p className="text-gray-300 font-bold text-sm">4. Ejercicio de sus Derechos</p>
                  <p>
                    Puede ejercer gratuitamente sus derechos de acceso, rectificación, limitación, portabilidad y supresión enviando un correo al email de contacto del responsable: <strong className="text-yellow-500">{config.rgpdEmail}</strong> {config.rgpdDpd && <span>o al Delegado de Protección de Datos en <strong className="text-yellow-500">{config.rgpdDpd}</strong></span>}.
                  </p>
                </>
              )}

              {activeLegalModal === 'legal' && (
                <>
                  <p className="text-gray-300 font-bold text-sm">Información General e Identificación</p>
                  <p>
                    En cumplimiento del deber de información contemplado en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se hace constar que el portal web <strong className="text-gray-300">GeoTasalia Web</strong> es administrado por <strong className="text-gray-300">{config.rgpdResponsable}</strong> con NIF {config.rgpdNif} y domicilio a efectos de contacto en {config.rgpdDireccion}.
                  </p>
                  <p className="text-gray-300 font-bold text-sm">Propiedad Intelectual y Uso</p>
                  <p>
                    Los contenidos del sitio web (código fuente, textos, imágenes, gráficos de linderos, logotipos e identidad corporativa) son de exclusiva titularidad de GeoTasalia o cuentan con la preceptiva autorización de uso. Queda totalmente prohibida la reproducción parcial o total sin consentimiento previo expreso.
                  </p>
                  <p className="text-gray-300 font-bold text-sm">Exclusión de Responsabilidad</p>
                  <p>
                    Este gabinete técnico no asume responsabilidades por las discrepancias que puedan surgir debido al uso indebido o desactualizado de las herramientas cartográficas externas de referencia.
                  </p>
                </>
              )}

              {activeLegalModal === 'cookies' && (
                <>
                  <p className="text-gray-300 font-bold text-sm">Uso de Cookies Técnicas y Analíticas</p>
                  <p>
                    Este sitio web utiliza únicamente cookies técnicas de almacenamiento local (localStorage) que son necesarias para recordar su estado de sesión como cliente o administrador y su configuración personalizada de linderos rústicos.
                  </p>
                  <p className="text-gray-300 font-bold text-sm">Cookies de Terceros</p>
                  <p>
                    No recopilamos datos personales de comportamiento para publicidad dirigida ni utilizamos trackers comerciales. El acceso a las plataformas externas de mapeo (geovisor catastral, gestor de rutas, visor urbanístico y registro) puede estar regido por sus propias políticas de cookies una vez que abandone nuestro sitio web técnico.
                  </p>
                </>
              )}
            </div>

            <div className="p-4 bg-gray-950/60 border-t border-gray-800 text-center text-[10px] text-gray-500">
              GEOTASALIA &copy; 2026. Adecuado estrictamente a las Leyes de Tratamiento de Datos de España y Europa.
            </div>
          </div>
        </div>
      )}

      {/* Email Dispatch / Success Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0b1329] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-gray-100">
            <div className="p-6 border-b border-gray-800 bg-[#0d1630]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 animate-bounce" size={20} />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    ¡Consulta Técnica Procesada!
                  </h3>
                </div>
                <button 
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 rounded transition-colors font-semibold"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Su consulta se ha preparado conforme al RGPD de GeoTasalia. Al ser un portal técnico estático, puede enviarla usando cualquiera de las siguientes opciones:
              </p>
            </div>

            <div className="p-5 space-y-4 text-left">
              <div className="p-3.5 bg-gray-950/50 border border-gray-900 rounded-xl space-y-2 text-[11px]">
                <div>
                  <span className="text-gray-500 font-mono text-[9px] block uppercase tracking-wider">Destinatario Principal:</span>
                  <span className="text-gray-200 font-mono font-semibold">{preparedEmail.to}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-mono text-[9px] block uppercase tracking-wider">Asunto:</span>
                  <span className="text-yellow-500 font-semibold">{preparedEmail.subject}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* GMAIL WEB */}
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(preparedEmail.to)}&bcc=${encodeURIComponent(preparedEmail.bcc)}&su=${encodeURIComponent(preparedEmail.subject)}&body=${encodeURIComponent(preparedEmail.body)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold text-red-400 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Mail size={16} />
                  <span>Gmail Web</span>
                </a>

                {/* MAILTO DEFAULT */}
                <a
                  href={`mailto:${preparedEmail.to}?bcc=${preparedEmail.bcc}&subject=${encodeURIComponent(preparedEmail.subject)}&body=${encodeURIComponent(preparedEmail.body)}`}
                  className="p-3.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold text-yellow-500 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <ExternalLink size={16} />
                  <span>Mail/Outlook</span>
                </a>

                {/* COPY TO CLIPBOARD */}
                <button
                  type="button"
                  onClick={() => {
                    const fullText = `Para: ${preparedEmail.to}\nAsunto: ${preparedEmail.subject}\n\n${preparedEmail.body}`;
                    navigator.clipboard.writeText(fullText);
                    alert('¡Texto de la consulta copiado al portapapeles! Ya puede pegarlo en su gestor de correo.');
                  }}
                  className="p-3.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold text-blue-400 hover:scale-[1.02] active:scale-95"
                >
                  <FileText size={16} />
                  <span>Copiar Texto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

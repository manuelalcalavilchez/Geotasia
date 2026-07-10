import React, { useState } from 'react';
import { 
  Settings, Phone, Mail, MessageSquare, ExternalLink, 
  ChevronRight, Send, ShieldCheck, Award, MapPin, 
  Globe, Map, Route, Compass, BookOpen, Lock, Unlock, 
  LogIn, LogOut, Info, Shield, CheckCircle2, AlertCircle, FileText,
  Trash2, RefreshCw, Search, Inbox
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
        // Migrate old kDriveUrl default if found
        if (parsed.kDriveUrl === 'https://kdrop.kdrive.infomaniak.com/web-recepcion-geotasalia') {
          parsed.kDriveUrl = DEFAULT_CONFIG.kDriveUrl;
        }
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

  // Email Dispatch / Submission states
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isBackendSuccessOpen, setIsBackendSuccessOpen] = useState(false);
  const [preparedEmail, setPreparedEmail] = useState({ to: '', bcc: '', subject: '', body: '' });
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Admin Inbox Management States
  const [consultas, setConsultas] = useState<any[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [activeConsultaId, setActiveConsultaId] = useState<string | null>(null);

  // Load inquiries when admin logged in
  const fetchConsultas = React.useCallback(() => {
    if (userRole !== 'admin') return;
    setIsLoadingConsultas(true);
    fetch('/api/consultas', {
      headers: {
        'x-admin-token': 'admin2026'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConsultas(data);
        }
      })
      .catch(err => console.error('Error fetching inquiries:', err))
      .finally(() => setIsLoadingConsultas(false));
  }, [userRole]);

  React.useEffect(() => {
    if (userRole === 'admin') {
      fetchConsultas();
    }
  }, [userRole, fetchConsultas]);

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
    setFormSuccessMessage(null);
    setFormErrorMessage(null);
    
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
    
    // Perform a real POST call to our submission manager!
    fetch('/api/contacto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        cadastralRef: formData.cadastralRef,
        message: formData.message,
        rgpdAccepted: formData.rgpdAccepted,
        attachedFiles: attachedFiles.map(f => ({ name: f.name, size: f.size }))
      })
    })
      .then(res => res.json())
      .then(data => {
        setFormSubmitted(false);
        if (data.success) {
          setFormSuccessMessage("¡Su consulta técnica ha sido enviada con éxito! Nos pondremos en contacto con usted lo antes posible.");
          // Refresh admin panel queries if they are logged in as admin
          if (userRole === 'admin') {
            fetchConsultas();
          }
          // Reset form data and files
          setFormData({
            name: '',
            email: '',
            phone: '',
            service: 'Valoración Agrícola',
            cadastralRef: '',
            message: '',
            rgpdAccepted: false
          });
          setAttachedFiles([]);
        } else {
          setFormErrorMessage('Hubo un error al registrar la consulta: ' + (data.error || 'Inténtelo de nuevo.'));
        }
      })
      .catch(err => {
        console.error('Error submitting inquiry to backend:', err);
        setFormSubmitted(false);
        setFormErrorMessage('Error de envío. Los datos no pudieron transmitirse directamente al servidor. Puede usar las opciones de correo de abajo:');
        // Fallback to manual mailto if server has connectivity issue
        setPreparedEmail({
          to: 'jorge.martinez@geotasalia.es',
          bcc: 'arnydivision@gmail.com',
          subject: subject,
          body: body
        });
      });
  };

  // Toggle read status of a consultation
  const toggleConsultaRead = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    fetch(`/api/consultas/${id}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'admin2026'
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConsultas(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        }
      })
      .catch(err => console.error('Error updating read status:', err));
  };

  // Delete/Archive a consultation
  const deleteConsulta = (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta consulta permanentemente de la base de datos?')) return;
    fetch(`/api/consultas/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-token': 'admin2026'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConsultas(prev => prev.filter(item => item.id !== id));
          if (activeConsultaId === id) setActiveConsultaId(null);
        }
      })
      .catch(err => console.error('Error deleting consultation:', err));
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
    <div className={`min-h-screen bg-theme-bg-root text-theme-text selection:bg-theme-accent/20 selection:text-theme-accent theme-${config.theme || 'navy-gold'} relative overflow-x-hidden transition-colors duration-300`}>
      
      {/* Decorative Top Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-theme-accent/20 via-transparent to-transparent -z-10 blur-3xl pointer-events-none transition-all duration-500"></div>

      {/* Navigation Bar */}
      <nav className="border-b border-theme-border-card/20 bg-theme-bg-nav backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} customLogoUrl={config.customLogoUrl} />
            <div>
              <span className="font-sans font-bold text-theme-text tracking-widest text-sm uppercase">GEOTASALIA</span>
              <span className="hidden sm:inline text-[10px] text-theme-accent tracking-[0.2em] uppercase ml-2 border-l border-theme-border-card/30 pl-2">
                Ingeniería Agrícola y Valoración
              </span>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToSection('herramientas-enlaces')} 
              className="text-xs text-theme-text-muted hover:text-theme-text transition-colors hidden md:block"
            >
              Herramientas Técnicas
            </button>
            <button 
              onClick={() => scrollToSection('especialidades')} 
              className="text-xs text-theme-text-muted hover:text-theme-text transition-colors hidden lg:block"
            >
              Servicios
            </button>
            <button 
              onClick={() => scrollToSection('contacto-tecnico')} 
              className="text-xs bg-theme-accent-bg hover:bg-theme-accent/25 text-theme-accent px-3 py-1.5 rounded-lg border border-theme-border-card/40 transition-all font-semibold"
            >
              Contacto
            </button>

            <span className="h-4 w-px bg-theme-border-card/20 hidden md:block"></span>

            {/* Auth Session Button */}
            {userRole === 'guest' ? (
              <button
                onClick={() => {
                  setAuthPurpose('general');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs text-theme-text/80 hover:text-theme-accent bg-theme-bg-card/60 border border-theme-border-card/40 px-2.5 py-1.5 rounded-lg transition-all"
                title="Acceso Clientes / Admin"
              >
                <LogIn size={13} />
                <span className="hidden sm:inline">Acceso Privado</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-theme-bg-card/80 border border-theme-border-card/40 pl-2.5 pr-1.5 py-1 rounded-lg">
                <span className={`h-1.5 w-1.5 rounded-full ${userRole === 'admin' ? 'bg-theme-accent' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-text/80 font-mono">
                  {userRole === 'admin' ? 'Gabinete (Admin)' : 'Cliente'}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-theme-bg-root text-theme-text-muted hover:text-red-400 rounded-md transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Settings trigger only visible for Admin */}
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollToSection('admin-inbox-section')}
                  className="relative p-2 bg-theme-accent-bg hover:bg-theme-accent/25 text-theme-accent rounded-lg border border-theme-border-card/40 transition-all cursor-pointer"
                  title="Ver bandeja de entrada"
                  id="inbox-trigger-btn"
                >
                  <Mail size={18} />
                  {consultas.filter(c => c.status === 'unread').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white font-sans text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                      {consultas.filter(c => c.status === 'unread').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 bg-theme-accent-bg hover:bg-theme-accent/25 text-theme-accent rounded-lg border border-theme-border-card/40 transition-all cursor-pointer"
                  title="Configuración de Enlaces y RGPD"
                  id="settings-trigger-btn"
                >
                  <Settings size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-6">
        <Logo size="lg" showText={true} customLogoUrl={config.customLogoUrl} />
        
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.3em] text-theme-accent uppercase">Gabinete Técnico Agropecuario</p>
          <h2 className="text-2xl sm:text-3xl font-light text-theme-text font-sans tracking-tight">
            Ingeniería Agrícola & Valoraciones Rústicas
          </h2>
        </div>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-theme-text-muted font-light leading-relaxed">
          Especialistas en tasaciones oficiales de fincas, dictámenes periciales rústicos, proyectos de regadío, topografía de precisión y análisis de viabilidad registral. Rigor técnico and confidencialidad en cada proyecto.
        </p>
        
        {/* Action Directives / Contact buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <a
            href="tel:633067650"
            className="flex items-center gap-2 px-4 py-2.5 bg-theme-bg-card/80 hover:bg-theme-bg-card border border-theme-border-card/30 rounded-xl text-xs font-semibold text-theme-text/90 transition-all hover:border-theme-accent/40"
            id="call-jorge-link"
          >
            <Phone size={14} className="text-theme-accent" /> Llamar: 633 067 650
          </a>
          <a
            href="mailto:jorge.martinez@geotasalia.es"
            className="flex items-center gap-2 px-4 py-2.5 bg-theme-bg-card/80 hover:bg-theme-bg-card border border-theme-border-card/30 rounded-xl text-xs font-semibold text-theme-text/90 transition-all hover:border-theme-accent/40"
            id="mail-jorge-link"
          >
            <Mail size={14} className="text-theme-accent" /> jorge.martinez@geotasalia.es
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
            className="flex items-center gap-2 px-4 py-2.5 bg-theme-accent-bg hover:bg-theme-accent/20 border border-theme-accent/20 rounded-xl text-xs font-semibold text-theme-accent transition-all"
            id="corporate-site-link"
          >
            <Globe size={14} /> Web Principal <ExternalLink size={11} />
          </a>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-16">
        
        {/* SECTION: Admin Inquiries Inbox */}
        {userRole === 'admin' && (
          <section id="admin-inbox-section" className="p-6 bg-theme-bg-card border border-theme-border-card rounded-2xl space-y-6 text-left animate-fade-in relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-theme-accent/5 rounded-full blur-2xl -z-10 pointer-events-none"></div>

            {/* Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme-border-card/30 pb-5">
              <div>
                <h2 className="text-lg font-bold text-theme-text uppercase tracking-wider font-display flex items-center gap-2">
                  <Inbox className="text-theme-accent" size={20} />
                  Bandeja de Entrada de Consultas
                </h2>
                <p className="text-xs text-theme-text-muted mt-1">
                  Gestione y responda las solicitudes rústicas y periciales enviadas por los clientes del portal.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs bg-theme-bg-root/60 border border-theme-border-card/30 px-3 py-1.5 rounded-xl font-mono text-theme-text-muted">
                  <span className="text-theme-accent font-bold">{consultas.filter(c => c.status === 'unread').length}</span> pendientes
                </span>
                
                <button
                  type="button"
                  onClick={fetchConsultas}
                  disabled={isLoadingConsultas}
                  className="p-2 bg-theme-bg-root/60 hover:bg-theme-bg-root border border-theme-border-card/30 rounded-xl text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                  title="Sincronizar consultas"
                >
                  <RefreshCw size={14} className={isLoadingConsultas ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted/60" size={14} />
                <input
                  type="text"
                  placeholder="Buscar por cliente, correo o ref. catastral..."
                  className="w-full pl-9 pr-4 py-2 bg-theme-bg-root/60 border border-theme-border-card/30 rounded-xl text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              {/* Service filter */}
              <select
                className="px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/30 rounded-xl text-xs text-theme-text outline-none focus:border-theme-accent/50 font-sans"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="all">Todos los servicios</option>
                <option value="Valoración Agrícola">Valoraciones</option>
                <option value="Ingeniería Agrícola">Ingeniería</option>
                <option value="Topografía y Catastro">Topografía</option>
                <option value="Informes Periciales">Peritajes</option>
                <option value="Análisis Registral">Registro</option>
              </select>
            </div>

            {/* Message list / detail split or list */}
            {isLoadingConsultas ? (
              <div className="py-12 text-center text-xs text-theme-text-muted space-y-2">
                <div className="w-5 h-5 border-2 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Cargando consultas desde el servidor...</p>
              </div>
            ) : consultas.length === 0 ? (
              <div className="py-12 border border-dashed border-theme-border-card/30 rounded-xl text-center text-xs text-theme-text-muted space-y-2 bg-theme-bg-root/20">
                <Inbox size={28} className="mx-auto text-theme-text-muted/30" />
                <p>No se han recibido consultas técnicas en el servidor todavía.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consultas
                  .filter(c => {
                    const matchesSearch = 
                      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      c.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      c.phone.includes(searchFilter) ||
                      c.cadastralRef.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      c.message.toLowerCase().includes(searchFilter.toLowerCase());
                    const matchesService = serviceFilter === 'all' || c.service === serviceFilter;
                    return matchesSearch && matchesService;
                  })
                  .map((consulta) => {
                    const isExpanded = activeConsultaId === consulta.id;
                    const isUnread = consulta.status === 'unread';

                    return (
                      <div
                        key={consulta.id}
                        className={`border rounded-xl transition-all overflow-hidden ${
                          isUnread
                            ? 'border-theme-accent/40 bg-theme-accent-bg/10 hover:bg-theme-accent-bg/20'
                            : 'border-theme-border-card/30 bg-theme-bg-root/30 hover:bg-theme-bg-root/50'
                        }`}
                      >
                        {/* Summary Header */}
                        <div
                          onClick={() => {
                            setActiveConsultaId(isExpanded ? null : consulta.id);
                            if (isUnread) {
                              toggleConsultaRead(consulta.id, 'unread');
                            }
                          }}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              {isUnread && (
                                <span className="h-2 w-2 rounded-full bg-theme-accent animate-pulse" title="Nueva consulta"></span>
                              )}
                              <span className="font-semibold text-xs text-theme-text truncate">{consulta.name}</span>
                              <span className="text-[10px] text-theme-text-muted/50 font-mono">
                                {new Date(consulta.createdAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[10px]">
                              <span className="bg-theme-accent-bg text-theme-accent px-2 py-0.5 rounded font-medium">
                                {consulta.service}
                              </span>
                              {consulta.cadastralRef && (
                                <span className="bg-theme-bg-root border border-theme-border-card/20 text-theme-text-muted px-2 py-0.5 rounded font-mono">
                                  Ref: {consulta.cadastralRef}
                                </span>
                              )}
                              {consulta.attachedFiles && consulta.attachedFiles.length > 0 && (
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                  <FileText size={10} /> {consulta.attachedFiles.length} adjunto(s)
                                </span>
                              )}
                            </div>
                            
                            <p className={`text-[11px] text-theme-text-muted truncate ${isExpanded ? 'hidden' : 'block'}`}>
                              {consulta.message}
                            </p>
                          </div>

                          {/* Quick action buttons on card */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleConsultaRead(consulta.id, consulta.status);
                              }}
                              className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors ${
                                isUnread 
                                  ? 'bg-theme-accent-bg hover:bg-theme-accent/25 text-theme-accent' 
                                  : 'bg-theme-bg-root/80 hover:bg-theme-bg-root text-theme-text-muted'
                              }`}
                            >
                              {isUnread ? 'Leída' : 'Pendiente'}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConsulta(consulta.id);
                              }}
                              className="p-1.5 hover:bg-red-500/10 text-theme-text-muted hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Eliminar consulta"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-theme-border-card/20 space-y-4 text-xs text-left">
                            <div className="bg-theme-bg-root/80 p-3.5 rounded-xl border border-theme-border-card/30 font-mono space-y-2 text-[11px]">
                              <p className="text-[10px] uppercase text-theme-text-muted/60 font-bold tracking-wider pb-1 border-b border-theme-border-card/10">
                                Información de Contacto
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <p><span className="text-theme-text-muted font-semibold">Email:</span> <a href={`mailto:${consulta.email}`} className="text-theme-accent hover:underline font-bold">{consulta.email}</a></p>
                                <p><span className="text-theme-text-muted font-semibold">Teléfono:</span> <a href={`tel:${consulta.phone}`} className="text-theme-accent hover:underline font-bold">{consulta.phone}</a></p>
                                <p><span className="text-theme-text-muted font-semibold">Ref. Catastral:</span> {consulta.cadastralRef ? (
                                  <a 
                                    href={`https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBusqueda.aspx?rc1=${consulta.cadastralRef.substring(0,7)}&rc2=${consulta.cadastralRef.substring(7,14)}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline inline-flex items-center gap-0.5 font-bold"
                                  >
                                    {consulta.cadastralRef} <ExternalLink size={9} />
                                  </a>
                                ) : 'No aportada'}</p>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <p className="font-semibold text-theme-text">Mensaje de la consulta:</p>
                              <div className="p-3 bg-theme-bg-root/40 border border-theme-border-card/20 rounded-xl text-theme-text/80 whitespace-pre-wrap leading-relaxed">
                                {consulta.message}
                              </div>
                            </div>

                            {/* Attached files section inside details */}
                            {consulta.attachedFiles && consulta.attachedFiles.length > 0 && (
                              <div className="space-y-2">
                                <p className="font-semibold text-theme-text">Archivos adjuntos:</p>
                                <div className="flex flex-wrap gap-2">
                                  {consulta.attachedFiles.map((file: any, fileIdx: number) => (
                                    <div key={fileIdx} className="flex items-center gap-2 bg-theme-bg-root/60 border border-theme-border-card/30 px-3 py-2 rounded-lg font-mono text-[10px]">
                                      <FileText size={12} className="text-theme-accent" />
                                      <span className="text-theme-text/80 font-medium truncate max-w-xs">{file.name}</span>
                                      <span className="text-theme-text-muted">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interactive Quick Reply bar */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-theme-border-card/10">
                              <a
                                href={`mailto:${consulta.email}?subject=RE: Consulta sobre ${encodeURIComponent(consulta.service)} en GeoTasalia&body=Hola ${encodeURIComponent(consulta.name)},\n\nGracias por ponerse en contacto con GeoTasalia.\n\nHe recibido su solicitud sobre ${encodeURIComponent(consulta.service)} y me gustaría ponerle fecha para poder hablarlo en detalle...\n\nUn saludo,\nJorge Martínez\nGeoTasalia`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent text-slate-950 rounded-lg font-bold hover:bg-theme-accent-hover transition-colors"
                              >
                                <Mail size={12} /> Responder por Email
                              </a>
                              
                              <a
                                href={`https://wa.me/34${consulta.phone.replace(/\s+/g, '')}?text=Hola%20${encodeURIComponent(consulta.name)},%20te%20escribo%20desde%20GeoTasalia%20en%20relación%20a%20tu%20consulta%20técnica%20de%20${encodeURIComponent(consulta.service)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg font-bold transition-colors"
                              >
                                <MessageSquare size={12} /> Responder por WhatsApp
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  const textToCopy = `Consulta de ${consulta.name} (${consulta.phone} - ${consulta.email})\nServicio: ${consulta.service}\nCatastro: ${consulta.cadastralRef || 'N/A'}\n\nMensaje:\n${consulta.message}`;
                                  navigator.clipboard.writeText(textToCopy);
                                  alert('¡Resumen de la consulta copiado al portapapeles!');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-bg-root hover:bg-theme-bg-card border border-theme-border-card/20 text-theme-text rounded-lg font-semibold transition-colors"
                              >
                                <FileText size={12} /> Copiar ficha técnica
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        )}

             {/* SECTION: Direct Tool Launchers ("Tus botoncicos") */}
        <section id="herramientas-enlaces" className="space-y-6">
          <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-theme-text uppercase tracking-wider font-display flex items-center justify-center md:justify-start gap-2">
                <span className="h-1.5 w-1.5 bg-theme-accent rounded-full"></span>
                Herramientas Técnicas y Enlaces Exclusivos
              </h2>
              <p className="text-xs text-theme-text-muted mt-1">
                Utilidades de cartografía, planificación de salidas al campo y verificación rústica para clientes del gabinete:
              </p>
            </div>
            
            {userRole === 'guest' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-theme-accent-bg border border-theme-accent/35 rounded-lg text-[10px] text-theme-accent uppercase tracking-widest font-semibold">
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
              className="group p-5 bg-theme-bg-card/60 border border-theme-border-card/30 rounded-2xl hover:border-theme-accent hover:bg-theme-bg-card/90 transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-geovisor"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-theme-accent-bg text-theme-accent rounded-xl w-fit group-hover:bg-theme-accent group-hover:text-slate-950 transition-colors">
                    <Map size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-theme-text-muted/40 group-hover:text-theme-accent/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-theme-text uppercase tracking-wider group-hover:text-theme-accent transition-colors">geovisor</h3>
                <p className="text-xs text-theme-text-muted line-clamp-2">Visualización ágil de parcelación, linderos y cartografía catastral rústica.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-theme-accent font-semibold pt-2">
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
              className="group p-5 bg-theme-bg-card/60 border border-theme-border-card/30 rounded-2xl hover:border-theme-accent hover:bg-theme-bg-card/90 transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-rutas"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-theme-accent-bg text-theme-accent rounded-xl w-fit group-hover:bg-theme-accent group-hover:text-slate-950 transition-colors">
                    <Route size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-theme-text-muted/40 group-hover:text-theme-accent/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-theme-text uppercase tracking-wider group-hover:text-theme-accent transition-colors">gestor de rutas</h3>
                <p className="text-xs text-theme-text-muted line-clamp-2">Planificación de salidas al campo, cálculo de distancias y logística técnica.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-theme-accent font-semibold pt-2">
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
              className="group p-5 bg-theme-bg-card/60 border border-theme-border-card/30 rounded-2xl hover:border-theme-accent hover:bg-theme-bg-card/90 transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-urbanismo"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-theme-accent-bg text-theme-accent rounded-xl w-fit group-hover:bg-theme-accent group-hover:text-slate-950 transition-colors">
                    <Compass size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-theme-text-muted/40 group-hover:text-theme-accent/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-theme-text uppercase tracking-wider group-hover:text-theme-accent transition-colors">visor urbanístico</h3>
                <p className="text-xs text-theme-text-muted line-clamp-2">Calificaciones de suelo rústico, planeamiento urbanístico municipal y ordenación.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-theme-accent font-semibold pt-2">
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
              className="group p-5 bg-theme-bg-card/60 border border-theme-border-card/30 rounded-2xl hover:border-theme-accent hover:bg-theme-bg-card/90 transition-all flex flex-col justify-between h-44 shadow-md text-left relative overflow-hidden cursor-pointer"
              id="external-link-registro"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-theme-accent-bg text-theme-accent rounded-xl w-fit group-hover:bg-theme-accent group-hover:text-slate-950 transition-colors">
                    <BookOpen size={20} />
                  </div>
                  {userRole === 'guest' ? (
                    <Lock size={14} className="text-theme-text-muted/40 group-hover:text-theme-accent/70 transition-colors" />
                  ) : (
                    <Unlock size={14} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-theme-text uppercase tracking-wider group-hover:text-theme-accent transition-colors">análisis registral</h3>
                <p className="text-xs text-theme-text-muted line-clamp-2">Buscador y verificación técnica de cargas, titularidades y fincas registrales.</p>
              </div>
              <div className="flex items-center justify-between text-xs text-theme-accent font-semibold pt-2">
                <span>{userRole === 'guest' ? 'Exclusivo Clientes' : 'Verificar finca'}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

          </div>
          
          <div className="p-3 bg-theme-bg-root/40 rounded-xl border border-theme-border-card/30 text-center">
            {userRole === 'guest' ? (
              <p className="text-[11px] text-theme-text-muted">
                🔒 <span className="font-semibold text-theme-text/80">¿Eres cliente de GeoTasalia?</span> Pulsa el botón de <span className="text-theme-accent font-semibold underline cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>Acceso Privado</span> para desbloquear el acceso instantáneo a todas las plataformas con tus credenciales.
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
            <h2 className="text-xl font-bold text-theme-text uppercase tracking-wider font-display flex items-center justify-center md:justify-start gap-2">
              <span className="h-1.5 w-1.5 bg-theme-accent rounded-full"></span>
              Especialidades en Ingeniería Agrónoma y Consultoría
            </h2>
            <p className="text-xs text-theme-text-muted mt-1">Servicios técnicos integrales adaptados a las normativas vigentes en España</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SERVICE CARD 1 */}
            <div 
              onClick={() => prefillService('Valoración Agrícola', 'Hola Jorge, solicito información y presupuesto detallado para la tasación oficial de una finca rústica o valoración de cultivo.')}
              className="p-6 bg-gradient-to-b from-theme-bg-card to-theme-bg-root/40 border border-theme-border-card/20 rounded-2xl hover:border-theme-accent/30 hover:shadow-lg transition-all cursor-pointer group text-left animate-fade-in"
            >
              <h3 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-theme-accent rounded-full"></span>
                Valoraciones Agrícolas
              </h3>
              <p className="text-xs text-theme-text-muted mt-3 leading-relaxed">
                Tasaciones oficiales de fincas rústicas para herencias, divorcios, expropiaciones forzosas, garantías hipotecarias y valoraciones de cosechas, cultivos leñosos o derechos de agua de riego.
              </p>
              <div className="mt-4 text-[11px] font-semibold text-theme-accent uppercase tracking-wider flex items-center gap-1">
                Solicitar presupuesto <ChevronRight size={12} />
              </div>
            </div>

            {/* SERVICE CARD 2 */}
            <div 
              onClick={() => prefillService('Ingeniería Agrícola', 'Hola Jorge, necesito consultarte sobre un proyecto técnico de ingeniería agrícola (pozos, balsas de riego o naves).')}
              className="p-6 bg-gradient-to-b from-theme-bg-card to-theme-bg-root/40 border border-theme-border-card/20 rounded-2xl hover:border-theme-accent/30 hover:shadow-lg transition-all cursor-pointer group text-left animate-fade-in"
            >
              <h3 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-theme-accent rounded-full"></span>
                Ingeniería Agronómica
              </h3>
              <p className="text-xs text-theme-text-muted mt-3 leading-relaxed">
                Proyectos de legalización de pozos, diseño de balsas e infraestructuras de riego, naves agrícolas, planes de ordenación de explotaciones, estudios de impacto ambiental e informes periciales.
              </p>
              <div className="mt-4 text-[11px] font-semibold text-theme-accent uppercase tracking-wider flex items-center gap-1">
                Solicitar información <ChevronRight size={12} />
              </div>
            </div>

            {/* SERVICE CARD 3 */}
            <div 
              onClick={() => prefillService('Topografía y Catastro', 'Hola Jorge, necesito realizar un levantamiento topográfico, deslinde o subsanación de discrepancias catastrales.')}
              className="p-6 bg-gradient-to-b from-theme-bg-card to-theme-bg-root/40 border border-theme-border-card/20 rounded-2xl hover:border-theme-accent/30 hover:shadow-lg transition-all cursor-pointer group text-left animate-fade-in"
            >
              <h3 className="text-base font-semibold text-theme-text group-hover:text-theme-accent transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-theme-accent rounded-full"></span>
                Topografía y Catastro
              </h3>
              <p className="text-xs text-theme-text-muted mt-3 leading-relaxed">
                Mediciones de fincas rústicas mediante GPS de precisión, deslindes contradictorios, segregaciones, planos GML y tramitación de expedientes catastrales (art. 18.1 LCI) por discrepancias de cabida.
              </p>
              <div className="mt-4 text-[11px] font-semibold text-theme-accent uppercase tracking-wider flex items-center gap-1">
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
              <h3 className="text-lg font-bold text-theme-text uppercase tracking-wider font-display">
                Garantía de Privacidad
              </h3>
              
              <div className="space-y-4 text-xs text-theme-text-muted">
                <div className="flex gap-3">
                  <Award className="text-theme-accent shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-theme-text/80">Ingeniería Certificada</p>
                    <p className="mt-0.5">Todos nuestros dictámenes, tasaciones oficiales e informes de linderos se emiten con validez oficial ante notarías, registros de la propiedad, catastro y juzgados.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck className="text-theme-accent shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-theme-text/80">Tratamiento Seguro RGPD</p>
                    <p className="mt-0.5">Cumplimiento estricto de la normativa española y europea en el tratamiento de su información catastral, planos y escrituras.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="text-theme-accent shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-theme-text/80">Ámbito de Cobertura</p>
                    <p className="mt-0.5">Asistencia técnica agropecuaria y mediciones de campo rústicas en toda Andalucía meridional, Extremadura y zona centro.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link block */}
            <div className="bg-theme-bg-root/40 p-4 rounded-xl border border-theme-border-card/30 space-y-3">
              <p className="text-[11px] text-theme-text-muted uppercase tracking-widest font-mono">Enlaces de Servicios Corporativos</p>
              <div className="grid grid-cols-1 gap-2">
                <a 
                  href={config.externalAplicacionesUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-theme-accent hover:underline flex items-center justify-between"
                >
                  Página Web Geotasalia <ExternalLink size={10} />
                </a>
                <button 
                  onClick={() => scrollToSection('herramientas-enlaces')} 
                  className="text-xs text-theme-accent hover:underline flex items-center justify-between text-left"
                >
                  Acceso Herramientas Técnicas <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Form Area (8 cols) */}
          <div className="lg:col-span-8 border border-theme-border-card/30 rounded-2xl bg-theme-bg-card/50 backdrop-blur-md shadow-lg p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-theme-text uppercase tracking-wider font-display">
                Formulario de Consulta Técnica
              </h3>
              <p className="text-xs text-theme-text-muted mt-1">
                Háganos llegar sus dudas catastrales o necesidades de valoración para recibir respuesta en menos de 24 horas.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-theme-text/80">Nombre / Empresa</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50"
                    placeholder="Ej. Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-theme-text/80">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-theme-text/80">Teléfono de contacto</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50"
                    placeholder="633067650"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-theme-text/80">Área o Tipo de Servicio</label>
                  <select
                    className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text focus:border-theme-accent/50 outline-none animate-none"
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
                  <label className="block text-xs font-semibold text-theme-text/80">Referencia Catastral (Opcional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs font-mono text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50"
                    placeholder="Ej. 4752801VK4745S0001YD"
                    value={formData.cadastralRef}
                    onChange={(e) => setFormData(prev => ({ ...prev, cadastralRef: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-text/80">Descripción de la Consulta Técnica</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50 resize-none"
                  placeholder="Escriba las características de su parcela o describa el trabajo que requiere..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              {/* Interactive File Uploader with Drag and Drop & Progress Bar */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-theme-text/80">
                  Planos, escrituras o notas simples (Opcional - Adjuntar al Formulario)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 cursor-pointer relative ${
                    isDragging
                      ? 'border-theme-accent bg-theme-accent-bg'
                      : 'border-theme-border-card/40 bg-theme-bg-root/30 hover:border-theme-border-card/60 hover:bg-theme-bg-root/50'
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
                  <div className="p-3 bg-theme-accent-bg text-theme-accent rounded-full">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-theme-text">
                      Arrastre sus documentos aquí o haga clic para seleccionarlos
                    </p>
                    <p className="text-[10px] text-theme-text-muted mt-1">
                      Admite PDF, Imágenes (PNG, JPG), Planos GML, XML o archivos ZIP (Máx. 25MB)
                    </p>
                  </div>
                </div>

                {/* Attached Files List with Upload Progress Simulation */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2 bg-theme-bg-root/60 border border-theme-border-card/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider">
                      Documentos Preparados para el Gabinete ({attachedFiles.length})
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex flex-col gap-1 bg-theme-bg-root/40 border border-theme-border-card/30 rounded-lg p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="truncate max-w-[70%] font-medium text-theme-text/90">{file.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-theme-text-muted/60 font-mono">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              {file.status === 'uploading' ? (
                                <span className="text-[10px] text-theme-accent font-medium animate-pulse">
                                  Cargando...
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={11} /> Listo
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.name);
                                }}
                                className="text-theme-text-muted/40 hover:text-red-400 p-0.5 transition-colors font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                          
                          {/* File progress bar */}
                          {file.status === 'uploading' && (
                            <div className="w-full bg-theme-bg-root h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-theme-accent h-full transition-all duration-200"
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
                <div className="flex items-center justify-between p-2.5 bg-theme-bg-root/40 rounded-lg border border-theme-border-card/20 text-[10px] text-theme-text-muted">
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
              <div className="space-y-3 pt-3 border-t border-theme-border-card/25">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 shrink-0 rounded border-theme-border-card/40 bg-theme-bg-root/60 text-theme-accent focus:ring-theme-accent/30 focus:ring-offset-0"
                    checked={formData.rgpdAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, rgpdAccepted: e.target.checked }))}
                  />
                  <span className="text-[11px] text-theme-text-muted leading-relaxed group-hover:text-theme-text/80 transition-colors">
                    He leído y acepto expresamente la <span className="text-theme-accent font-semibold underline" onClick={(e) => { e.preventDefault(); setActiveLegalModal('privacy'); }}>Política de Privacidad de GEOTASALIA</span> de conformidad con el Reglamento General de Protección de Datos (RGPD) europeo y la Ley Orgánica 3/2018 (LOPDGDD).
                  </span>
                </label>

                {/* Detailed Dynamic Spanish GDPR Summary Grid */}
                <div className="bg-theme-bg-root/40 border border-theme-border-card/30 rounded-xl p-3 text-[10px] text-theme-text-muted space-y-2 leading-relaxed">
                  <p className="font-semibold text-theme-text/80 border-b border-theme-border-card/25 pb-1 uppercase tracking-wider text-[8px]">
                    Información Básica sobre Protección de Datos (RGPD)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 font-sans">
                    <p>
                      <strong className="text-theme-text/70">Responsable:</strong> {config.rgpdResponsable || 'Jorge Martínez Martínez - GEOTASALIA'} (NIF: {config.rgpdNif || '44321987-X'})
                    </p>
                    <p>
                      <strong className="text-theme-text/70">Finalidad:</strong> Tramitar su consulta técnica, tasación o estudio agronómico y contacto técnico comercial.
                    </p>
                    <p>
                      <strong className="text-theme-text/70">Legitimación:</strong> Consentimiento expreso del interesado mediante marcado de casilla.
                    </p>
                    <p>
                      <strong className="text-theme-text/70">Dirección:</strong> {config.rgpdDireccion || 'Calle Técnica Agrónoma 14, Alcalá de Guadaíra, 41500 Sevilla'}
                    </p>
                    <p className="sm:col-span-2">
                      <strong className="text-theme-text/70">Derechos:</strong> Acceso, rectificación, supresión y portabilidad enviando un email a <span className="text-theme-accent font-semibold">{config.rgpdEmail || 'jorge.martinez@geotasalia.es'}</span> {config.rgpdDpd && <span>o DPD: <span className="text-theme-accent font-semibold">{config.rgpdDpd}</span></span>}.
                    </p>
                  </div>
                </div>
              </div>

              {formSuccessMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                    <span className="font-bold uppercase tracking-wider text-[11px]">¡Consulta técnica enviada con éxito!</span>
                  </div>
                  <p className="text-theme-text-muted leading-relaxed text-[11px]">
                    Hemos recibido su solicitud correctamente. Jorge Martínez evaluará los detalles de su finca rústica y se pondrá en contacto con usted lo antes posible.
                  </p>
                </div>
              )}

              {formErrorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-500 shrink-0" size={16} />
                    <span className="font-bold uppercase tracking-wider text-[11px]">No se pudo enviar automáticamente</span>
                  </div>
                  <p className="text-theme-text-muted leading-relaxed text-[11px]">
                    {formErrorMessage}
                  </p>
                  
                  {preparedEmail.body && (
                    <div className="pt-2 border-t border-red-500/10 space-y-2">
                      <p className="text-[10px] text-theme-accent font-semibold">Opciones de envío manual alternativo:</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(preparedEmail.to)}&bcc=${encodeURIComponent(preparedEmail.bcc)}&su=${encodeURIComponent(preparedEmail.subject)}&body=${encodeURIComponent(preparedEmail.body)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-red-400 font-bold transition-all text-[10px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail size={12} /> Gmail Web
                        </a>
                        <a
                          href={`mailto:${preparedEmail.to}?bcc=${preparedEmail.bcc}&subject=${encodeURIComponent(preparedEmail.subject)}&body=${encodeURIComponent(preparedEmail.body)}`}
                          className="px-3 py-1.5 bg-theme-accent-bg hover:bg-theme-accent/20 border border-theme-accent/35 rounded-lg text-theme-accent font-bold transition-all text-[10px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={12} /> Email/Outlook
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const fullText = `Para: ${preparedEmail.to}\nAsunto: ${preparedEmail.subject}\n\n${preparedEmail.body}`;
                            navigator.clipboard.writeText(fullText);
                            alert('¡Datos copiados al portapapeles!');
                          }}
                          className="px-3 py-1.5 bg-theme-bg-root hover:bg-theme-bg-card border border-theme-border-card/30 rounded-lg text-theme-text font-bold transition-all text-[10px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText size={12} /> Copiar Datos
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={formSubmitted}
                className="w-full py-3 bg-theme-accent hover:bg-theme-accent-hover text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {formSubmitted ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
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
      <footer className="border-t border-theme-border-card/25 bg-theme-bg-nav/95 mt-24 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-theme-border-card/20 pb-8">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} customLogoUrl={config.customLogoUrl} />
              <div>
                <p className="text-xs font-bold text-theme-text tracking-widest uppercase">GEOTASALIA</p>
                <p className="text-[10px] text-theme-text-muted">Gabinete de Ingeniería Agrónoma &copy; 2026. Todos los derechos reservados.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-theme-text-muted">
              <button onClick={() => setActiveLegalModal('legal')} className="hover:text-theme-accent transition-colors animate-none">Aviso Legal</button>
              <span>&bull;</span>
              <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-theme-accent transition-colors animate-none">Política de Privacidad</button>
              <span>&bull;</span>
              <button onClick={() => setActiveLegalModal('cookies')} className="hover:text-theme-accent transition-colors animate-none">Política de Cookies</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-theme-text-muted/70">
            <p>
              Diseño de identidad visual verificado para Jorge Martínez - Ingeniería Rústica.
            </p>
            
            {/* TECNOLOGIA ALCALA CREDIT SIGNATURE */}
            <p className="font-mono flex items-center gap-1 bg-theme-bg-root/40 px-3 py-1.5 rounded-lg border border-theme-border-card/30 text-theme-text-muted/60">
              Desarrollada por <span className="text-theme-accent font-bold tracking-wider hover:text-theme-accent-hover transition-colors animate-none">Tecnologia Alcalá</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Auth / Login Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-bg-card border border-theme-border-card/40 rounded-2xl shadow-2xl overflow-hidden text-theme-text">
            <div className="p-6 border-b border-theme-border-card/30 bg-theme-bg-root/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogIn className="text-theme-accent" size={18} />
                  <h3 className="text-base font-bold text-theme-text uppercase tracking-wider font-display">
                    {authPurpose === 'tool' ? 'Herramienta Restringida' : 'Acceso Privado'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    resetAuthForm();
                  }}
                  className="p-1 hover:bg-theme-bg-root rounded-lg text-theme-text-muted hover:text-theme-text transition-colors text-xs font-semibold animate-none"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-xs text-theme-text-muted mt-2 leading-relaxed">
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
                <label className="block text-xs font-semibold text-theme-text/80">Usuario de Acceso</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de usuario"
                  className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50 font-mono"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-text/80">Contraseña Secreta</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-theme-bg-root/60 border border-theme-border-card/40 rounded-lg text-xs text-theme-text placeholder-theme-text-muted/40 outline-none focus:border-theme-accent/50 font-mono"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md animate-none"
              >
                Acceder a la Plataforma
              </button>
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
          <div className="w-full max-w-2xl bg-theme-bg-card border border-theme-border-card/40 rounded-2xl shadow-2xl overflow-hidden text-theme-text text-left">
            <div className="p-6 border-b border-theme-border-card/30 bg-theme-bg-root/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-theme-accent" size={18} />
                <h3 className="text-base font-bold text-theme-text uppercase tracking-wider font-display">
                  {activeLegalModal === 'privacy' && 'Política de Privacidad y Tratamiento (RGPD)'}
                  {activeLegalModal === 'legal' && 'Aviso Legal'}
                  {activeLegalModal === 'cookies' && 'Política de Cookies'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="px-3 py-1 bg-theme-bg-root hover:bg-theme-bg-root/80 border border-theme-border-card/30 text-xs text-theme-text rounded-lg transition-colors font-semibold animate-none"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-xs text-theme-text-muted leading-relaxed font-sans">
              {activeLegalModal === 'privacy' && (
                <>
                  <p className="text-theme-text/90 font-bold text-sm">1. Responsabilidad sobre sus datos personales</p>
                  <p>
                    De acuerdo con el Reglamento General de Protección de Datos (RGPD) de la UE 2016/679 y la Ley Orgánica 3/2018 de Protección de Datos Personales (LOPDGDD), el interesado queda informado de que el responsable del tratamiento de los datos aportados en este formulario es <strong className="text-theme-text/90">{config.rgpdResponsable}</strong>, con domicilio legal en <strong className="text-theme-text/90">{config.rgpdDireccion}</strong> y NIF <strong className="text-theme-text/90">{config.rgpdNif}</strong>.
                  </p>

                  <p className="text-theme-text/90 font-bold text-sm">2. Finalidad del Tratamiento</p>
                  <p>
                    Los datos recabados únicamente se destinarán al estudio de su finca o parcela rústica, el cálculo técnico de honorarios correspondientes y la tramitación de la consulta técnica requerida (valoraciones, topografía, proyectos de pozos, etc.). Los datos nunca serán vendidos ni transferidos con fines comerciales ajenos a este gabinete.
                  </p>

                  <p className="text-theme-text/90 font-bold text-sm">3. Legitimación y Conservación</p>
                  <p>
                    La base jurídica que legitima este tratamiento es su consentimiento expreso al marcar la casilla voluntaria de envío. Los datos personales proporcionados se conservarán durante los plazos legalmente previstos para la prescripción de responsabilidades contractuales u obligaciones del encargo técnico.
                  </p>

                  <p className="text-theme-text/90 font-bold text-sm">4. Ejercicio de sus Derechos</p>
                  <p>
                    Puede ejercer gratuitamente sus derechos de acceso, rectificación, limitación, portabilidad y supresión enviando un correo al email de contacto del responsable: <strong className="text-theme-accent">{config.rgpdEmail}</strong> {config.rgpdDpd && <span>o al Delegado de Protección de Datos en <strong className="text-theme-accent">{config.rgpdDpd}</strong></span>}.
                  </p>
                </>
              )}

              {activeLegalModal === 'legal' && (
                <>
                  <p className="text-theme-text/90 font-bold text-sm">Información General e Identificación</p>
                  <p>
                    En cumplimiento del deber de información contemplado en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se hace constar que el portal web <strong className="text-theme-text/90">GeoTasalia Web</strong> es administrado por <strong className="text-theme-text/90">{config.rgpdResponsable}</strong> con NIF {config.rgpdNif} y domicilio a efectos de contacto en {config.rgpdDireccion}.
                  </p>
                  <p className="text-theme-text/90 font-bold text-sm">Propiedad Intelectual y Uso</p>
                  <p>
                    Los contenidos del sitio web (código fuente, textos, imágenes, gráficos de linderos, logotipos e identidad corporativa) son de exclusiva titularidad de GeoTasalia o cuentan con la preceptiva autorización de uso. Queda totalmente prohibida la reproducción parcial o total sin consentimiento previo expreso.
                  </p>
                  <p className="text-theme-text/90 font-bold text-sm">Exclusión de Responsabilidad</p>
                  <p>
                    Este gabinete técnico no asume responsabilidades por las discrepancias que puedan surgir debido al uso indebido o desactualizado de las herramientas cartográficas externas de referencia.
                  </p>
                </>
              )}

              {activeLegalModal === 'cookies' && (
                <>
                  <p className="text-theme-text/90 font-bold text-sm">Uso de Cookies Técnicas y Analíticas</p>
                  <p>
                    Este sitio web utiliza únicamente cookies técnicas de almacenamiento local (localStorage) que son necesarias para recordar su estado de sesión como cliente o administrador y su configuración personalizada de linderos rústicos.
                  </p>
                  <p className="text-theme-text/90 font-bold text-sm">Cookies de Terceros</p>
                  <p>
                    No recopilamos datos personales de comportamiento para publicidad dirigida ni utilizamos trackers comerciales. El acceso a las plataformas externas de mapeo (geovisor catastral, gestor de rutas, visor urbanístico y registro) puede estar regido por sus propias políticas de cookies una vez que abandone nuestro sitio web técnico.
                  </p>
                </>
              )}
            </div>

            <div className="p-4 bg-theme-bg-root/60 border-t border-theme-border-card/30 text-center text-[10px] text-theme-text-muted/60">
              GEOTASALIA &copy; 2026. Adecuado estrictamente a las Leyes de Tratamiento de Datos de España y Europa.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Gauge, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  FileText, 
  Wifi, 
  WifiOff, 
  Plus, 
  RefreshCw,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Vehicle } from '../types';
import { DueReminderInfo } from './MaintenanceAlertToast';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  vehicle: Vehicle;
  theme: 'dark' | 'light';
  dueReminders?: DueReminderInfo[];
  onToggleTheme: () => void;
  onOpenOdometerModal: () => void;
  onOpenAddLogModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  vehicle,
  theme,
  dueReminders = [],
  onToggleTheme,
  onOpenOdometerModal,
  onOpenAddLogModal,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: Gauge },
    { id: 'logs', label: 'Histórico & Peças', icon: Calendar },
    { id: 'costs', label: 'Custos Futuros', icon: DollarSign, badge: dueReminders.length },
    { id: 'passport', label: 'Passaporte Revenda', icon: ShieldCheck },
    { id: 'shared', label: 'Acesso Compartilhado', icon: Users },
    { id: 'prd', label: 'PRD & Arquitetura', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Vehicle Selector */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 text-base tracking-tight">
                  {vehicle.make} {vehicle.model}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-blue-400 rounded-md border border-slate-700">
                  {vehicle.licensePlate}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{vehicle.currentOdometer.toLocaleString('pt-BR')} KM</span>
                <span className="text-slate-600">•</span>
                <span>~{vehicle.averageDailyKm} KM/dia</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center space-x-2">
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setIsAlertMenuOpen(!isAlertMenuOpen)}
                className={`relative p-2 rounded-lg border transition-all ${
                  dueReminders.length > 0
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title={dueReminders.length > 0 ? `${dueReminders.length} Alerta(s) de Manutenção (90%+ KM)` : 'Nenhum alerta crítico'}
              >
                <Bell className="w-4 h-4" />
                {dueReminders.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white animate-pulse">
                    {dueReminders.length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isAlertMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Alertas Preventivos (90%+)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                      {dueReminders.length} ativo(s)
                    </span>
                  </div>

                  {dueReminders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">
                      Nenhum item atingiu 90% da cota do hodômetro.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                      {dueReminders.map(({ reminder, progressPercent, kmRemaining }) => (
                        <div
                          key={reminder.id}
                          onClick={() => {
                            setActiveTab('costs');
                            setIsAlertMenuOpen(false);
                          }}
                          className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                              {reminder.category}
                            </span>
                            <span className="text-[10px] font-extrabold text-rose-400">
                              {progressPercent}% atingido
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-200 line-clamp-1">{reminder.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {kmRemaining <= 0
                              ? `Excedido em ${Math.abs(kmRemaining).toLocaleString('pt-BR')} KM`
                              : `Faltam ${kmRemaining.toLocaleString('pt-BR')} KM`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('costs');
                      setIsAlertMenuOpen(false);
                    }}
                    className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Ir para Custos Futuros</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Theme Selector (Claro/Escuro) */}
            <button
              onClick={onToggleTheme}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
              aria-label="Alternar tema claro/escuro"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Escuro</span>
                </>
              )}
            </button>

            {/* Odometer Quick Update */}
            <button
              onClick={onOpenOdometerModal}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Atualizar KM</span>
            </button>

            {/* Quick Add Log */}
            <button
              onClick={onOpenAddLogModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Registrar Peça/Serviço</span>
            </button>

            {/* Firebase & Offline/Online Badge */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800/50'
              }`}
              title={
                isOnline
                  ? 'Firebase Firestore Sincronizado (Plano Gratuito Spark)'
                  : 'Modo Offline Ativo - Gravando no dispositivo (PWA Local-First)'
              }
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Firebase Nuvem</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Offline PWA</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasBadge = !!item.badge && item.badge > 0;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {hasBadge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/50 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

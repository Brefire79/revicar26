import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  DollarSign, 
  FileCheck2, 
  Share2, 
  Download, 
  Plus, 
  Scan, 
  Sparkles,
  TrendingUp,
  Clock,
  Package
} from 'lucide-react';
import { Vehicle, MaintenanceLog, ReminderRule } from '../types';

interface DashboardViewProps {
  vehicle: Vehicle;
  logs: MaintenanceLog[];
  reminders: ReminderRule[];
  onOpenOdometerModal: () => void;
  onOpenAddLogModal: () => void;
  onGeneratePdf: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicle,
  logs,
  reminders,
  onOpenOdometerModal,
  onOpenAddLogModal,
  onGeneratePdf,
  onNavigateTab,
}) => {
  const hasHistory = logs.length > 0;
  const criticalReminders = reminders.filter((r) => {
    const kmLeft = r.targetKm - vehicle.currentOdometer;
    return kmLeft <= 1000 || r.urgency === 'critical';
  });

  const totalSpent = logs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalParts = logs.reduce((acc, curr) => acc + curr.partsReplaced.length, 0);

  // Calculate 6-month projected cost from reminders
  const projectedCost6m = reminders.reduce((acc, curr) => {
    const kmLeft = curr.targetKm - vehicle.currentOdometer;
    const daysLeft = Math.max(1, Math.round(kmLeft / vehicle.averageDailyKm));
    if (daysLeft <= 180) {
      return acc + curr.estimatedCost;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Health Score */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasHistory ? 'Passaporte de Revenda Ativo' : 'Passaporte em construção'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {hasHistory
                ? <>Histórico em construção com projeção de custos baseada em <strong className="text-slate-200">~{vehicle.averageDailyKm} km/dia</strong>.</>
                : <>Comece registrando as revisões e peças reais deste veículo. Nenhum dado fictício será incluído.</>}
            </p>
            
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenOdometerModal}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Hodômetro: <strong className="text-blue-400 font-bold">{vehicle.currentOdometer.toLocaleString('pt-BR')} KM</strong> (Atualizar)
              </button>
              <span className="text-xs text-slate-500">Chassi: {vehicle.vin}</span>
            </div>
          </div>

          {/* Resale Score Dial */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 flex items-center space-x-5 min-w-[240px]">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - (hasHistory ? vehicle.resaleScore : 0) / 100)}
                  className="text-emerald-400 transition-all duration-1000"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-100">{hasHistory ? vehicle.resaleScore : '--'}</span>
                <span className="text-[9px] font-semibold text-emerald-400 uppercase">Score</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Índice de Revenda
              </span>
              <p className="text-xs text-slate-300 font-medium leading-tight">
                {hasHistory
                  ? 'Índice calculado a partir dos registros adicionados.'
                  : 'Adicione manutenções comprovadas para construir o índice.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner for Urgent Reminders */}
      {criticalReminders.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {criticalReminders.length} Atenção: Manutenção Preventiva Próxima
              </h4>
              <p className="text-xs text-amber-300/80">
                {criticalReminders[0].title} — Meta: {criticalReminders[0].targetKm.toLocaleString('pt-BR')} KM (Faltam ~{criticalReminders[0].targetKm - vehicle.currentOdometer} km).
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('costs')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
          >
            Ver Detalhes do Alerta
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Histórico de Serviços</span>
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{logs.length} <span className="text-xs font-normal text-slate-400">Revisões</span></div>
          <p className="text-[11px] text-slate-400">Registros adicionados ao veículo</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Peças Trocadas</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{totalParts} <span className="text-xs font-normal text-slate-400">Peças</span></div>
          <p className="text-[11px] text-slate-400">Peças e marcas cadastradas por você</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Investimento Total</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">R$ {totalSpent.toLocaleString('pt-BR')}</div>
          <p className="text-[11px] text-slate-400">Manutenção preventiva acumulada</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Previsão 6 Meses</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">R$ {projectedCost6m.toLocaleString('pt-BR')}</div>
          <p className="text-[11px] text-slate-400">Aproximado para os próximos {(vehicle.averageDailyKm * 180).toLocaleString('pt-BR')} km</p>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenAddLogModal}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 transition-colors group"
        >
          <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-200">Registrar Serviço</span>
          <span className="text-[10px] text-slate-400">Adicionar peça/troca</span>
        </button>

        <button
          onClick={onOpenAddLogModal}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 transition-colors group"
        >
          <Scan className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-200">Escanear Nota (IA)</span>
          <span className="text-[10px] text-slate-400">Extrair peças e valor</span>
        </button>

        <button
          onClick={onGeneratePdf}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 transition-colors group"
        >
          <Download className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-200">Gerar Relatório PDF</span>
          <span className="text-[10px] text-slate-400">Download em 1 clique</span>
        </button>

        <button
          onClick={() => onNavigateTab('passport')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-sky-600/10 border border-sky-500/20 hover:bg-sky-600/20 text-sky-400 transition-colors group"
        >
          <Share2 className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-200">Compartilhar Revenda</span>
          <span className="text-[10px] text-slate-400">Link público / QR Code</span>
        </button>
      </div>

      {/* Main Grid: Reminders vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reminders Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">Próximos Lembretes por KM</h3>
            </div>
            <button
              onClick={() => onNavigateTab('costs')}
              className="text-xs font-semibold text-blue-400 hover:underline"
            >
              Ver todos ({reminders.length})
            </button>
          </div>

          <div className="space-y-3">
            {reminders.slice(0, 3).map((rem) => {
              const kmRemaining = rem.targetKm - vehicle.currentOdometer;
              const daysEstimated = Math.max(1, Math.round(kmRemaining / vehicle.averageDailyKm));

              return (
                <div
                  key={rem.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{rem.title}</h4>
                      <p className="text-[11px] text-slate-400">{rem.category}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        kmRemaining <= 1000
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : kmRemaining <= 3000
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {kmRemaining <= 0
                        ? 'VENCIDO'
                        : `Faltam ${kmRemaining.toLocaleString('pt-BR')} KM (~${daysEstimated} dias)`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        kmRemaining <= 1000 ? 'bg-rose-500' : kmRemaining <= 3000 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, ((vehicle.currentOdometer - rem.lastPerformedKm) / rem.intervalKm) * 100)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Meta: {rem.targetKm.toLocaleString('pt-BR')} KM</span>
                    <span>Custo Estimado: R$ {rem.estimatedCost}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Service History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Últimos Serviços Registrados</h3>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs font-semibold text-blue-400 hover:underline"
            >
              Ver histórico ({logs.length})
            </button>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      {log.category} • {new Date(log.date).toLocaleDateString('pt-BR')}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 mt-0.5">{log.title}</h4>
                  </div>
                  <span className="text-xs font-extrabold text-slate-100">
                    R$ {log.totalCost.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Km: {log.odometerKm.toLocaleString('pt-BR')}</span>
                  <span>{log.partsReplaced.length} peça(s) instalada(s)</span>
                </div>

                {log.mechanicShop && (
                  <p className="text-[11px] text-slate-400 italic">
                    Oficina: {log.mechanicShop}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

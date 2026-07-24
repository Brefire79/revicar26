import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Plus, X, Wrench, BellRing } from 'lucide-react';
import { ReminderRule } from '../types';

export interface DueReminderInfo {
  reminder: ReminderRule;
  progressPercent: number;
  kmRemaining: number;
}

export function getDueRemindersAt90Percent(
  reminders: ReminderRule[],
  currentOdometer: number
): DueReminderInfo[] {
  return reminders
    .map((rem) => {
      const interval = rem.intervalKm || 10000;
      const lastKm = rem.lastPerformedKm || 0;
      const driven = Math.max(0, currentOdometer - lastKm);
      
      // Calculate progress against interval
      const intervalProgress = (driven / interval) * 100;
      
      // Also calculate progress against targetKm
      const targetProgress = rem.targetKm > 0 ? (currentOdometer / rem.targetKm) * 100 : 0;
      
      const progressPercent = Math.max(intervalProgress, targetProgress);
      const kmRemaining = rem.targetKm - currentOdometer;

      return {
        reminder: rem,
        progressPercent: Math.round(progressPercent),
        kmRemaining,
      };
    })
    .filter((item) => item.progressPercent >= 90);
}

interface MaintenanceAlertToastProps {
  dueReminders: DueReminderInfo[];
  currentOdometer: number;
  onViewReminders: () => void;
  onOpenAddLogModal: () => void;
}

export const MaintenanceAlertToast: React.FC<MaintenanceAlertToastProps> = ({
  dueReminders,
  currentOdometer,
  onViewReminders,
  onOpenAddLogModal,
}) => {
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (dueReminders.length === 0 || isClosed) {
    return null;
  }

  // Pick the most critical or highest progress reminder
  const criticalItem = dueReminders.reduce((prev, curr) =>
    curr.progressPercent > prev.progressPercent ? curr : prev
  );

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-md w-full px-2 sm:px-0 animate-slideUp">
      <div className="bg-slate-900/95 backdrop-blur-md border border-rose-500/40 rounded-2xl shadow-2xl shadow-rose-950/40 overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-slate-900 px-4 py-3 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                Alerta de Manutenção Preventiva
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {dueReminders.length}
                </span>
              </h4>
              <p className="text-[11px] text-rose-300/80">
                Hodômetro atingiu 90%+ da KM limite ({currentOdometer.toLocaleString('pt-BR')} KM)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-bold"
              title={isMinimized ? 'Expandir Alerta' : 'Minimizar'}
            >
              {isMinimized ? '+' : '−'}
            </button>
            <button
              onClick={() => setIsClosed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Fechar Notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Body */}
        {!isMinimized && (
          <div className="p-4 space-y-3">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {dueReminders.map(({ reminder, progressPercent, kmRemaining }) => {
                const isExceeded = kmRemaining <= 0;

                return (
                  <div
                    key={reminder.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                        {reminder.category}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isExceeded
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {progressPercent}% Limite Atingido
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-100">{reminder.title}</h5>

                    {/* Progress indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <span>Alvo: {reminder.targetKm.toLocaleString('pt-BR')} KM</span>
                        <span className={isExceeded ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                          {isExceeded
                            ? `Excedido em ${Math.abs(kmRemaining).toLocaleString('pt-BR')} KM`
                            : `Restam apenas ${kmRemaining.toLocaleString('pt-BR')} KM`}
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${isExceeded ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, progressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={onViewReminders}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span>Ver Lembretes</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenAddLogModal}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Serviço</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

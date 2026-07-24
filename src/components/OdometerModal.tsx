import React, { useState } from 'react';
import { Gauge, X, Check, Calculator } from 'lucide-react';
import { Vehicle } from '../types';

interface OdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onUpdateOdometer: (newKm: number, dailyKm: number) => void;
}

export const OdometerModal: React.FC<OdometerModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onUpdateOdometer,
}) => {
  const [km, setKm] = useState<number>(vehicle.currentOdometer);
  const [dailyKm, setDailyKm] = useState<number>(vehicle.averageDailyKm);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (km >= vehicle.currentOdometer) {
      onUpdateOdometer(km, dailyKm);
      onClose();
    }
  };

  const deltaKm = km - vehicle.currentOdometer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Atualizar Hodômetro</h3>
              <p className="text-xs text-slate-400">Registre a quilometragem atual do veículo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quilometragem Atual (KM)
            </label>
            <div className="relative">
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(Number(e.target.value))}
                min={vehicle.currentOdometer}
                step={1}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500">KM</span>
            </div>
            {deltaKm > 0 && (
              <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                <span>+ {deltaKm.toLocaleString('pt-BR')} km rodados desde o último registro</span>
              </p>
            )}
            {km < vehicle.currentOdometer && (
              <p className="mt-1.5 text-xs text-rose-400">
                A nova quilometragem deve ser maior ou igual a {vehicle.currentOdometer.toLocaleString('pt-BR')} km.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-slate-400" />
              Média Estipulada Diária (KM/dia)
            </label>
            <input
              type="number"
              value={dailyKm}
              onChange={(e) => setDailyKm(Number(e.target.value))}
              min={1}
              max={500}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Usado para prever as datas exatas das próximas trocas de óleo, pneus e correias.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={km < vehicle.currentOdometer}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-lg shadow-blue-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Hodômetro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

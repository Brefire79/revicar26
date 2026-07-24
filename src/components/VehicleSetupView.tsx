import React, { useState } from 'react';
import { Car, CheckCircle2, Gauge, ShieldCheck } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleSetupViewProps {
  onComplete: (vehicle: Vehicle) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export const VehicleSetupView: React.FC<VehicleSetupViewProps> = ({ onComplete }) => {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    name: '',
    make: '',
    model: '',
    year: currentYear,
    licensePlate: '',
    vin: '',
    fuelType: 'Flex' as Vehicle['fuelType'],
    currentOdometer: 0,
    averageDailyKm: 20,
  });

  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      name: form.name.trim() || `${form.make.trim()} ${form.model.trim()}`,
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      licensePlate: form.licensePlate.trim().toUpperCase(),
      vin: form.vin.trim().toUpperCase() || undefined,
      fuelType: form.fuelType,
      currentOdometer: Math.max(0, Number(form.currentOdometer)),
      averageDailyKm: Math.max(1, Number(form.averageDailyKm)),
      createdDate: new Date().toISOString().slice(0, 10),
      resaleScore: 0,
    };
    onComplete(vehicle);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20">
            <Car className="h-8 w-8" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Primeiro acesso</p>
          <h1 className="text-3xl font-black">Cadastre seu veículo real</h1>
          <p className="mt-3 text-sm text-slate-400">
            O Revicar26 começa vazio. Preencha somente os dados que você conhece; o chassi é opcional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Apelido do veículo
              <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ex.: Meu carro" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Marca *
              <input required className={inputClass} value={form.make} onChange={(e) => update('make', e.target.value)} placeholder="Ex.: Chevrolet" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Modelo e versão *
              <input required className={inputClass} value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Ex.: Onix LT 1.0 Turbo" />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Ano *
              <input required type="number" min="1900" max={currentYear + 1} className={inputClass} value={form.year} onChange={(e) => update('year', Number(e.target.value))} />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Placa *
              <input required className={inputClass} value={form.licensePlate} onChange={(e) => update('licensePlate', e.target.value)} placeholder="ABC1D23" maxLength={8} />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Combustível *
              <select className={inputClass} value={form.fuelType} onChange={(e) => update('fuelType', e.target.value as Vehicle['fuelType'])}>
                {['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico'].map((fuel) => <option key={fuel}>{fuel}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Quilometragem atual *
              <input required type="number" min="0" className={inputClass} value={form.currentOdometer} onChange={(e) => update('currentOdometer', Number(e.target.value))} />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300">
              Média estimada de km/dia *
              <input required type="number" min="1" className={inputClass} value={form.averageDailyKm} onChange={(e) => update('averageDailyKm', Number(e.target.value))} />
            </label>
            <label className="space-y-2 text-xs font-semibold text-slate-300 sm:col-span-2">
              Chassi — opcional
              <input className={inputClass} value={form.vin} onChange={(e) => update('vin', e.target.value)} placeholder="17 caracteres, se quiser informar" maxLength={17} />
            </label>
          </div>

          <div className="grid gap-3 border-y border-slate-800 py-5 text-xs text-slate-400 sm:grid-cols-3">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Dados separados por usuário</span>
            <span className="flex items-center gap-2"><Gauge className="h-4 w-4 text-blue-400" /> Alertas pela quilometragem</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Sem registros fictícios</span>
          </div>

          <button type="submit" className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
            Salvar veículo e começar
          </button>
        </form>
      </div>
    </main>
  );
};

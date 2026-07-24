import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Bot, 
  Clock,
  Plus,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Cell,
} from 'recharts';
import { Vehicle, ReminderRule, ServiceCategory, MaintenanceLog } from '../types';

interface FutureCostsViewProps {
  vehicle: Vehicle;
  logs?: MaintenanceLog[];
  reminders: ReminderRule[];
  onAddReminder: (reminder: ReminderRule) => void;
}

const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export const FutureCostsView: React.FC<FutureCostsViewProps> = ({
  vehicle,
  logs = [],
  reminders,
  onAddReminder,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [aiError, setAiError] = useState('');
  const [chartMode, setChartMode] = useState<'timeline' | 'category'>('timeline');

  // Form for custom reminder rule
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<ServiceCategory>('Óleo e Lubrificantes');
  const [remIntervalKm, setRemIntervalKm] = useState<number>(10000);
  const [remEstimatedCost, setRemEstimatedCost] = useState<number>(350);

  // Recharts Monthly Timeline Processing
  const timelineChartData = useMemo(() => {
    const monthMap: Record<string, { month: string; historical: number; projected: number; dateObj: Date }> = {};
    const today = new Date();

    // Create a 18-month window: 6 months past + current month + 11 months future
    for (let i = -6; i <= 11; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      monthMap[key] = {
        month: label,
        historical: 0,
        projected: 0,
        dateObj: d,
      };
    }

    // Aggregate historical logs
    (logs || []).forEach((log) => {
      if (!log.date) return;
      const dateKey = log.date.slice(0, 7);
      if (monthMap[dateKey]) {
        monthMap[dateKey].historical += log.totalCost || 0;
      } else {
        const d = new Date(log.date);
        const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        monthMap[dateKey] = {
          month: label,
          historical: log.totalCost || 0,
          projected: 0,
          dateObj: d,
        };
      }
    });

    // Aggregate future reminders
    (reminders || []).forEach((rem) => {
      if (!rem.targetDate) return;
      const dateKey = rem.targetDate.slice(0, 7);
      if (monthMap[dateKey]) {
        monthMap[dateKey].projected += rem.estimatedCost || 0;
      } else {
        const d = new Date(rem.targetDate);
        const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        monthMap[dateKey] = {
          month: label,
          historical: 0,
          projected: rem.estimatedCost || 0,
          dateObj: d,
        };
      }
    });

    // Sort chronologically and calculate cumulative sum
    const sorted = Object.values(monthMap).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    let cumulativeSum = 0;
    return sorted.map((item) => {
      const monthlyTotal = item.historical + item.projected;
      cumulativeSum += monthlyTotal;
      return {
        month: item.month,
        'Histórico (R$)': item.historical,
        'Projetado (R$)': item.projected,
        'Custo Mensal (R$)': monthlyTotal,
        'Custo Acumulado (R$)': cumulativeSum,
      };
    });
  }, [logs, reminders]);

  // Category Breakdown Data Processing
  const categoryChartData = useMemo(() => {
    const catMap: Record<string, { historical: number; projected: number }> = {};

    (logs || []).forEach((l) => {
      const cat = l.category || 'Outros';
      if (!catMap[cat]) catMap[cat] = { historical: 0, projected: 0 };
      catMap[cat].historical += l.totalCost || 0;
    });

    (reminders || []).forEach((r) => {
      const cat = r.category || 'Outros';
      if (!catMap[cat]) catMap[cat] = { historical: 0, projected: 0 };
      catMap[cat].projected += r.estimatedCost || 0;
    });

    return Object.entries(catMap)
      .map(([category, val]) => ({
        category,
        'Histórico (R$)': val.historical,
        'Projetado (R$)': val.projected,
        total: val.historical + val.projected,
      }))
      .sort((a, b) => b.total - a.total);
  }, [logs, reminders]);

  // KPIs
  const totalHistoricalCost = useMemo(
    () => (logs || []).reduce((acc, curr) => acc + (curr.totalCost || 0), 0),
    [logs]
  );

  const totalProjectedCost = useMemo(
    () => reminders.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0),
    [reminders]
  );

  const avgMonthlyProjected = Math.round(totalProjectedCost / 12);

  const handleFetchAiSchedule = async () => {
    setAiLoading(true);
    setAiError('');

    try {
      const res = await fetch('/api/ai/maintenance-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          currentKm: vehicle.currentOdometer,
          mileagePerDay: vehicle.averageDailyKm,
        }),
      });

      if (!res.ok) {
        throw new Error('Não foi possível obter a recomendação da IA no momento.');
      }

      const data = await res.json();
      setAiResponse(data);
    } catch (err: any) {
      setAiError(err?.message || 'Erro ao consultar IA Gemini.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle) return;

    const targetKm = vehicle.currentOdometer + remIntervalKm;
    const daysLeft = Math.round(remIntervalKm / vehicle.averageDailyKm);
    const targetDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const newRem: ReminderRule = {
      id: `rem-${Date.now()}`,
      vehicleId: vehicle.id,
      title: remTitle,
      category: remCategory,
      intervalKm: remIntervalKm,
      intervalMonths: 12,
      lastPerformedKm: vehicle.currentOdometer,
      lastPerformedDate: new Date().toISOString().slice(0, 10),
      targetKm,
      targetDate,
      estimatedCost: remEstimatedCost,
      urgency: 'ok',
      description: `Regra de lembrete adicionada manualmente para ${remIntervalKm.toLocaleString('pt-BR')} KM.`,
    };

    onAddReminder(newRem);
    setIsAddingReminder(false);
    setRemTitle('');
  };

  const sortedReminders = [...reminders].sort((a, b) => a.targetKm - b.targetKm);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-100 border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {label}
          </p>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-100">
                R$ {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Projeção de Custos Futuros & Lembretes por KM
          </h2>
          <p className="text-xs text-slate-400">
            Previsão financeira de manutenções preventivas para os próximos 12 meses baseada em ~{vehicle.averageDailyKm} KM/dia.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddingReminder(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
          >
            + Criar Novo Lembrete
          </button>
          <button
            onClick={handleFetchAiSchedule}
            disabled={aiLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Plano Automotivo com Gemini IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Histórico Investido</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-black text-slate-100">
            R$ {totalHistoricalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500">Total registrado em ordens de serviço passadas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Projeção 12 Meses</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400">
            R$ {totalProjectedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500">Estimativa baseada em lembretes preventivos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Média Estimada Mensal</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-black text-indigo-300">
            R$ {avgMonthlyProjected.toLocaleString('pt-BR')}/mês
          </div>
          <p className="text-[10px] text-slate-500">Para orçamento de reserva automotiva</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Combinado</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-slate-100">
            R$ {(totalHistoricalCost + totalProjectedCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500">Investimento total no ciclo de vida do veículo</p>
        </div>
      </div>

      {/* Recharts Chart Section: Total Cost Over Time */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-indigo-400" />
              Evolução dos Custos de Manutenção ao Longo do Tempo (Recharts)
            </h3>
            <p className="text-xs text-slate-400">
              Visualização de gastos históricos combinados com a projeção acumulada dos próximos meses.
            </p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setChartMode('timeline')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartMode === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Cronograma & Acumulado</span>
            </button>
            <button
              onClick={() => setChartMode('category')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartMode === 'category'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Por Categoria</span>
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {chartMode === 'timeline' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }}
                />
                <Bar dataKey="Histórico (R$)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Projetado (R$)" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Area
                  type="monotone"
                  dataKey="Custo Acumulado (R$)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="Histórico (R$)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Projetado (R$)" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gemini AI Recommendation Box */}
      {aiResponse && (
        <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center space-x-3 border-b border-indigo-500/20 pb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Plano de Manutenção Inteligente (Gemini IA)
              </h3>
              <p className="text-xs text-indigo-300/80">
                Calibrado para {vehicle.make} {vehicle.model} ({vehicle.year}) com {vehicle.currentOdometer.toLocaleString('pt-BR')} KM.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-indigo-500/10">
            {aiResponse.summary}
          </p>

          {aiResponse.recommendations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiResponse.recommendations.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{rec.item}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.urgency === 'alta'
                          ? 'bg-rose-500/20 text-rose-400'
                          : rec.urgency === 'media'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      Urgência: {rec.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rec.description}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Intervalo: {rec.intervalKm?.toLocaleString('pt-BR')} KM</span>
                    <span className="font-bold text-emerald-400">Est: R$ {rec.estimatedCostBrl}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {aiResponse.resaleTip && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300">
              <strong>Dica de Revenda:</strong> {aiResponse.resaleTip}
            </div>
          )}
        </div>
      )}

      {aiError && (
        <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs p-4 rounded-xl">
          {aiError}
        </div>
      )}

      {/* Main Reminders Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Cronograma de Manutenção Preventiva por Odômetro
          </h3>
          <span className="text-xs text-slate-400">
            Hodômetro Atual: <strong className="text-blue-400 font-bold">{vehicle.currentOdometer.toLocaleString('pt-BR')} KM</strong>
          </span>
        </div>

        <div className="space-y-4">
          {sortedReminders.map((rem) => {
            const kmLeft = rem.targetKm - vehicle.currentOdometer;
            const daysLeft = Math.max(1, Math.round(kmLeft / vehicle.averageDailyKm));

            return (
              <div
                key={rem.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                        {rem.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Cada {rem.intervalKm.toLocaleString('pt-BR')} KM
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{rem.title}</h4>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="text-xs text-slate-400 block">Orçamento Estimado</span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        R$ {rem.estimatedCost}
                      </span>
                    </div>
                  </div>
                </div>

                {rem.description && (
                  <p className="text-xs text-slate-400">{rem.description}</p>
                )}

                {/* Progress Bar & Forecast */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">
                      Alvo: <strong className="text-slate-200">{rem.targetKm.toLocaleString('pt-BR')} KM</strong>
                    </span>
                    <span
                      className={
                        kmLeft <= 1000
                          ? 'text-rose-400 font-bold'
                          : kmLeft <= 3000
                          ? 'text-amber-400 font-bold'
                          : 'text-emerald-400 font-bold'
                      }
                    >
                      {kmLeft <= 0
                        ? 'SUBSTITUIÇÃO IMEDIATA RECOMENDADA'
                        : `Faltam ${kmLeft.toLocaleString('pt-BR')} KM (~${daysLeft} dias — Previsão: ${new Date(rem.targetDate).toLocaleDateString('pt-BR')})`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${
                        kmLeft <= 1000 ? 'bg-rose-500' : kmLeft <= 3000 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, ((vehicle.currentOdometer - rem.lastPerformedKm) / rem.intervalKm) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {rem.recommendedBrands && rem.recommendedBrands.length > 0 && (
                  <div className="pt-2 border-t border-slate-900 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Marcas e Peças Sugeridas:</span>
                    <div className="flex flex-wrap gap-1">
                      {rem.recommendedBrands.map((b, i) => (
                        <span key={i} className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to Add Custom Reminder */}
      {isAddingReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Criar Novo Lembrete de Manutenção</h3>

            <form onSubmit={handleSaveCustomReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Lembrete</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de Fluido do Radiador"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select
                  value={remCategory}
                  onChange={(e) => setRemCategory(e.target.value as ServiceCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Óleo e Lubrificantes">Óleo e Lubrificantes</option>
                  <option value="Freios">Freios</option>
                  <option value="Pneus e Alinhamento">Pneus e Alinhamento</option>
                  <option value="Motor e Correias">Motor e Correias</option>
                  <option value="Transmissão">Transmissão</option>
                  <option value="Filtros">Filtros</option>
                  <option value="Suspensão e Direção">Suspensão e Direção</option>
                  <option value="Elétrica e Bateria">Elétrica e Bateria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Intervalo em KM</label>
                <input
                  type="number"
                  required
                  value={remIntervalKm}
                  onChange={(e) => setRemIntervalKm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custo Estimado (R$)</label>
                <input
                  type="number"
                  required
                  value={remEstimatedCost}
                  onChange={(e) => setRemEstimatedCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReminder(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600"
                >
                  Salvar Lembrete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

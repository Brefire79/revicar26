import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Wrench, 
  Sparkles,
  Trash2,
  X,
  Check,
  Loader2,
  Droplets,
  Disc,
  CircleDot,
  Settings,
  Cog,
  Wind,
  Sliders,
  BatteryCharging,
  Snowflake,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Vehicle, MaintenanceLog, PartItem, ServiceCategory } from '../types';

interface MaintenanceLogsViewProps {
  vehicle: Vehicle;
  logs: MaintenanceLog[];
  onAddLog: (log: MaintenanceLog) => void;
  onDeleteLog: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const CATEGORIES: ServiceCategory[] = [
  'Óleo e Lubrificantes',
  'Freios',
  'Pneus e Alinhamento',
  'Motor e Correias',
  'Transmissão',
  'Filtros',
  'Suspensão e Direção',
  'Elétrica e Bateria',
  'Ar Condicionado',
  'Outros'
];

export const getCategoryConfig = (category: string) => {
  switch (category) {
    case 'Óleo e Lubrificantes':
      return { 
        icon: Droplets, 
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
        activeBtn: 'bg-amber-600 text-white shadow-amber-600/30',
        color: '#f59e0b' 
      };
    case 'Freios':
      return { 
        icon: Disc, 
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
        activeBtn: 'bg-rose-600 text-white shadow-rose-600/30',
        color: '#f43f5e' 
      };
    case 'Pneus e Alinhamento':
      return { 
        icon: CircleDot, 
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
        activeBtn: 'bg-emerald-600 text-white shadow-emerald-600/30',
        color: '#10b981' 
      };
    case 'Motor e Correias':
      return { 
        icon: Settings, 
        badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20',
        activeBtn: 'bg-indigo-600 text-white shadow-indigo-600/30',
        color: '#6366f1' 
      };
    case 'Transmissão':
      return { 
        icon: Cog, 
        badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
        activeBtn: 'bg-purple-600 text-white shadow-purple-600/30',
        color: '#a855f7' 
      };
    case 'Filtros':
      return { 
        icon: Wind, 
        badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20',
        activeBtn: 'bg-cyan-600 text-white shadow-cyan-600/30',
        color: '#06b6d4' 
      };
    case 'Suspensão e Direção':
      return { 
        icon: Sliders, 
        badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
        activeBtn: 'bg-blue-600 text-white shadow-blue-600/30',
        color: '#3b82f6' 
      };
    case 'Elétrica e Bateria':
      return { 
        icon: BatteryCharging, 
        badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20',
        activeBtn: 'bg-yellow-600 text-white shadow-yellow-600/30',
        color: '#eab308' 
      };
    case 'Ar Condicionado':
      return { 
        icon: Snowflake, 
        badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20',
        activeBtn: 'bg-sky-600 text-white shadow-sky-600/30',
        color: '#0ea5e9' 
      };
    default:
      return { 
        icon: Wrench, 
        badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20',
        activeBtn: 'bg-slate-700 text-white shadow-slate-700/30',
        color: '#94a3b8' 
      };
  }
};

export const MaintenanceLogsView: React.FC<MaintenanceLogsViewProps> = ({
  vehicle,
  logs,
  onAddLog,
  onDeleteLog,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State for new log
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Óleo e Lubrificantes');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometerKm, setOdometerKm] = useState<number>(vehicle.currentOdometer);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [mechanicShop, setMechanicShop] = useState('');
  const [mechanicName, setMechanicName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // Parts List inside Form
  const [parts, setParts] = useState<PartItem[]>([]);
  const [partName, setPartName] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [partCost, setPartCost] = useState<number>(0);
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [partWarrantyMonths, setPartWarrantyMonths] = useState<number>(12);

  // Gemini AI invoice scanner state
  const [aiInvoiceText, setAiInvoiceText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.mechanicShop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.partsReplaced.some((p) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddPart = () => {
    if (!partName) return;
    const newPart: PartItem = {
      id: `part-${Date.now()}`,
      name: partName,
      brand: partBrand || 'Genérica',
      partNumber: partNumber || undefined,
      quantity: partQuantity || 1,
      cost: partCost || 0,
      warrantyMonths: partWarrantyMonths,
    };

    setParts([...parts, newPart]);
    setPartName('');
    setPartBrand('');
    setPartNumber('');
    setPartCost(0);
    setPartQuantity(1);

    // Auto update totalCost if parts sum exceeds
    const newTotal = parts.reduce((sum, p) => sum + p.cost * p.quantity, 0) + newPart.cost * newPart.quantity;
    if (newTotal > totalCost) {
      setTotalCost(newTotal);
    }
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleScanInvoiceWithGemini = async () => {
    if (!aiInvoiceText) return;
    setIsAiAnalyzing(true);
    setAiError('');

    try {
      const res = await fetch('/api/ai/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceText: aiInvoiceText }),
      });

      if (!res.ok) {
        throw new Error('Falha ao processar a nota fiscal com IA.');
      }

      const data = await res.json();
      if (data.serviceTitle) setTitle(data.serviceTitle);
      if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category as ServiceCategory);
      if (data.totalCostBrl) setTotalCost(data.totalCostBrl);
      if (data.mechanicShop) setMechanicShop(data.mechanicShop);
      if (data.date) setDate(data.date);

      if (data.parts && Array.isArray(data.parts)) {
        const parsedParts: PartItem[] = data.parts.map((p: any, idx: number) => ({
          id: `parsed-${Date.now()}-${idx}`,
          name: p.partName || 'Peça extraída por IA',
          brand: p.brand || 'Original/Mercado',
          partNumber: p.partNumber || undefined,
          quantity: p.quantity || 1,
          cost: p.costBrl || 0,
          warrantyMonths: 12,
        }));
        setParts(parsedParts);
      }
    } catch (err: any) {
      setAiError(err?.message || 'Erro no escaneamento com IA.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newLog: MaintenanceLog = {
      id: `log-${Date.now()}`,
      vehicleId: vehicle.id,
      title,
      category,
      date,
      odometerKm: Number(odometerKm),
      totalCost: Number(totalCost),
      mechanicShop: mechanicShop || undefined,
      mechanicName: mechanicName || undefined,
      invoiceNumber: invoiceNumber || undefined,
      notes: notes || undefined,
      partsReplaced: parts,
      isVerified: true,
      createdByRole: 'owner',
    };

    onAddLog(newLog);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Óleo e Lubrificantes');
    setDate(new Date().toISOString().slice(0, 10));
    setOdometerKm(vehicle.currentOdometer);
    setTotalCost(0);
    setMechanicShop('');
    setMechanicName('');
    setInvoiceNumber('');
    setNotes('');
    setParts([]);
    setAiInvoiceText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            Histórico de Manutenções & Peças Trocadas
          </h2>
          <p className="text-xs text-slate-400">
            Registro auditável de peças trocadas, marcas, SKUs, notas fiscais e garantias.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Registro de Peça / Serviço</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Busca rápida: digite serviço, peça, marca ou oficina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills with Icons */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Todas</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300">
                {logs.length}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const count = logs.filter((l) => l.category === cat).length;
              if (count === 0) return null;
              const config = getCategoryConfig(cat);
              const CatIcon = config.icon;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? `${config.activeBtn} border-transparent shadow-md`
                      : `bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700`
                  }`}
                >
                  <CatIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} style={{ color: !isSelected ? config.color : undefined }} />
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-black/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Filter Tags / Shortcuts */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">Filtros Rápidos:</span>
          {['Óleo', 'Freios', 'Pneus', 'Filtro', 'Correia', 'Revisão'].map((keyword) => {
            const isActive = searchTerm.toLowerCase() === keyword.toLowerCase();
            return (
              <button
                key={keyword}
                onClick={() => setSearchTerm(isActive ? '' : keyword)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all border ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                #{keyword}
              </button>
            );
          })}
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="ml-auto text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Resetar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente alterar os termos da busca rápida ou selecione outra categoria.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const config = getCategoryConfig(log.category);
            const CatIcon = config.icon;

            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-start space-x-3">
                    {/* Category Icon Badge Box */}
                    <div className={`p-2.5 rounded-xl border shrink-0 ${config.badgeBg}`}>
                      <CatIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${config.badgeBg}`}>
                          <CatIcon className="w-3 h-3" />
                          {log.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.date).toLocaleDateString('pt-BR')}
                        </span>
                        {log.isVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Auditado & Verificado
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100">{log.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Investimento</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        R$ {log.totalCost.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              {/* Log Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Hodômetro na Manutenção</span>
                  <span className="font-bold text-slate-200">{log.odometerKm.toLocaleString('pt-BR')} KM</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Oficina / Mecânico</span>
                  <span className="font-bold text-slate-200">{log.mechanicShop || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nota Fiscal / Comprovante</span>
                  <span className="font-bold text-slate-200">{log.invoiceNumber || 'Não catalogado'}</span>
                </div>
              </div>

              {/* Replaced Parts Breakdown */}
              {log.partsReplaced && log.partsReplaced.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-400" />
                    Peças Substituídas ({log.partsReplaced.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {log.partsReplaced.map((part) => (
                      <div
                        key={part.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{part.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Marca: <strong className="text-slate-300">{part.brand}</strong></span>
                            {part.partNumber && (
                              <span>• Cód: <strong className="text-blue-400 font-mono">{part.partNumber}</strong></span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-300">R$ {part.cost}</span>
                          <span className="text-[10px] text-slate-500 block">Garantia: {part.warrantyMonths || 12} meses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {log.notes && (
                <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50 italic">
                  <strong>Observações Técnicas:</strong> {log.notes}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>

      {/* Add Log Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  Registrar Nova Manutenção ou Peça
                </h3>
                <p className="text-xs text-slate-400">Insira manualmente ou use o leitor de nota fiscal com Gemini IA</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gemini AI Scan Box */}
            <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Escanear Nota Fiscal ou Comprovante via IA Gemini
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                  OCR Inteligente
                </span>
              </div>
              <textarea
                placeholder="Cole o texto da ordem de serviço, e-mail ou nota fiscal (Ex: Troca de óleo 0W20 4 litros R$ 240, filtro de óleo Fram R$ 45, pastilha de freio Bosch R$ 180 na oficina H-Tech)..."
                value={aiInvoiceText}
                onChange={(e) => setAiInvoiceText(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleScanInvoiceWithGemini}
                  disabled={isAiAnalyzing || !aiInvoiceText}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5"
                >
                  {isAiAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analisando Nota com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Preencher Automaticamente</span>
                    </>
                  )}
                </button>
              </div>
              {aiError && <p className="text-xs text-rose-400">{aiError}</p>}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Serviço</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Troca de Óleo e Filtros de Cabine"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data do Serviço</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quilometragem (KM)</label>
                  <input
                    type="number"
                    required
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Custo Total (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={totalCost}
                    onChange={(e) => setTotalCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Oficina / Estabelecimento</label>
                  <input
                    type="text"
                    placeholder="Ex: H-Tech Especializada Honda"
                    value={mechanicShop}
                    onChange={(e) => setMechanicShop(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Add Parts Sub-section */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Adicionar Peças Individuais / Códigos</span>
                  <span className="text-[10px] text-slate-500">{parts.length} peça(s) adicionada(s)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Nome da peça"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Marca (Ex: Bosch)"
                    value={partBrand}
                    onChange={(e) => setPartBrand(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Cód / SKU (Part Number)"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      placeholder="Valor R$"
                      value={partCost || ''}
                      onChange={(e) => setPartCost(Number(e.target.value))}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="w-1/2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-lg text-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {parts.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {parts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg">
                        <div>
                          <strong className="text-slate-200">{p.name}</strong> — {p.brand} {p.partNumber ? `[${p.partNumber}]` : ''}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-bold">R$ {p.cost}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(p.id)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Instruções adicionais ou detalhes do serviço feito pelo mecânico..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Manutenção</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Award, 
  QrCode, 
  Copy, 
  Check, 
  Sparkles,
  FileCheck2,
  Lock
} from 'lucide-react';
import { Vehicle, MaintenanceLog } from '../types';

interface ResalePassportViewProps {
  vehicle: Vehicle;
  logs: MaintenanceLog[];
  onGeneratePdf: (isBuyerMode: boolean) => void;
}

export const ResalePassportView: React.FC<ResalePassportViewProps> = ({
  vehicle,
  logs,
  onGeneratePdf,
}) => {
  const [isBuyerMode, setIsBuyerMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const totalParts = logs.reduce((acc, curr) => acc + curr.partsReplaced.length, 0);
  const verifiedLogs = logs.filter((l) => l.isVerified);

  const publicLink = `${window.location.origin}?passaporte=${vehicle.licensePlate}&token=verified-8842`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Selo de Procedência & Histórico de Manutenção</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100">
              Passaporte Digital de Revenda — {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Compartilhe o histórico auditado de revisões com futuros compradores. A comprovação de peças originais e trocas preventivas <strong className="text-emerald-400">valoriza a revenda em até R$ 8.000 a R$ 15.000</strong> e traz segurança total na negociação.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col items-center space-y-2 shrink-0 min-w-[200px]">
            <span className="text-[11px] font-semibold text-slate-400">Modo de Visualização</span>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 w-full">
              <button
                onClick={() => setIsBuyerMode(false)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                  !isBuyerMode ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Proprietário</span>
              </button>
              <button
                onClick={() => setIsBuyerMode(true)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                  isBuyerMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Comprador</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-500 text-center">
              {isBuyerMode
                ? '🔒 Oculta custos privados e dados de familiares.'
                : '🔓 Exibe todos os custos e observações internas.'}
            </span>
          </div>
        </div>
      </div>

      {/* Share Link & QR Code Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Link Público do Passaporte para Anúncio / OLX / Webmotors</span>
          </div>
          <p className="text-xs text-slate-400">
            Cole este link no seu anúncio de venda para que interessados naveguem pelo caderno de manutenção virtual sem expor suas informações privadas.
          </p>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={publicLink}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Graphic Simulation */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
            {/* SVG QR Code Simulation */}
            <div className="w-full h-full bg-slate-950 p-1.5 rounded flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-4 border-emerald-400 bg-white" />
                <div className="w-6 h-6 border-4 border-emerald-400 bg-white" />
              </div>
              <div className="flex justify-center items-center py-1">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">AUTO</span>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-4 border-emerald-400 bg-white" />
                <div className="w-2 h-2 bg-emerald-400" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-300">
            QR Code do Passaporte Veicular
          </span>
          <button
            onClick={() => onGeneratePdf(true)}
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF com QR Code</span>
          </button>
        </div>
      </div>

      {/* Verified Badges Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Score de Conservação
            </h4>
          </div>
          <div className="text-3xl font-black text-slate-100">{vehicle.resaleScore} <span className="text-xs font-semibold text-emerald-400">/ 100</span></div>
          <p className="text-[11px] text-slate-400">Manutenções preventivas sem atrasos críticos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Revisões Auditadas
            </h4>
          </div>
          <div className="text-3xl font-black text-slate-100">{verifiedLogs.length} <span className="text-xs font-semibold text-blue-400">Verificadas</span></div>
          <p className="text-[11px] text-slate-400">Comprovadas com código de nota fiscal e oficina</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <FileCheck2 className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Peças de Grife / Originais
            </h4>
          </div>
          <div className="text-3xl font-black text-slate-100">{totalParts} <span className="text-xs font-semibold text-indigo-400">Peças</span></div>
          <p className="text-[11px] text-slate-400">Marcas homologadas (Bosch, Michelin, Honda)</p>
        </div>
      </div>

      {/* Buyer's View Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              {isBuyerMode ? 'Visão do Comprador (Pública)' : 'Visão Completa do Proprietário'}
            </h3>
          </div>

          <button
            onClick={() => onGeneratePdf(isBuyerMode)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Gerar PDF ({isBuyerMode ? 'Versão Comprador' : 'Versão Completa'})</span>
          </button>
        </div>

        {/* Timeline of Public History */}
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {log.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{log.title}</h4>
                  <p className="text-xs text-slate-400">
                    Realizado em {new Date(log.date).toLocaleDateString('pt-BR')} com {log.odometerKm.toLocaleString('pt-BR')} KM
                  </p>
                </div>

                {!isBuyerMode ? (
                  <span className="text-sm font-extrabold text-slate-100">
                    R$ {log.totalCost.toLocaleString('pt-BR')}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Auditado
                  </span>
                )}
              </div>

              {log.partsReplaced && log.partsReplaced.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <span className="text-[11px] font-bold text-slate-400 block">Peças Catalogadas:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {log.partsReplaced.map((p) => (
                      <div
                        key={p.id}
                        className="bg-slate-900 p-2 rounded-lg text-xs flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-200">{p.name}</strong>
                          <span className="text-slate-400 block text-[10px]">
                            Marca: {p.brand} {p.partNumber ? `(${p.partNumber})` : ''}
                          </span>
                        </div>
                        {!isBuyerMode && <span className="font-bold text-slate-300">R$ {p.cost}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

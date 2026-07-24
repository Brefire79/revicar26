import React, { useState } from 'react';
import { 
  FileText, 
  Bot, 
  Boxes, 
  Layers, 
  Download, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Loader2, 
  Code2, 
  Copy, 
  Check, 
  Send
} from 'lucide-react';
import { PrdSpec, SurveyQuestions } from '../types';
import { DEFAULT_PRD, buildPrdFromSurvey } from '../lib/prdGenerator';

interface PrdArchitectureViewProps {
  survey: SurveyQuestions;
  onSaveSurvey: (s: SurveyQuestions) => void;
}

export const PrdArchitectureView: React.FC<PrdArchitectureViewProps> = ({
  survey,
  onSaveSurvey,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'prd' | 'agents' | 'classes' | 'scaling' | 'survey'>('prd');
  const [currentSurvey, setCurrentSurvey] = useState<SurveyQuestions>(survey);
  const [prdSpec, setPrdSpec] = useState<PrdSpec>(buildPrdFromSurvey(survey));
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState(false);

  const handleUpdateSurvey = (field: keyof SurveyQuestions, value: any) => {
    const updated = { ...currentSurvey, [field]: value };
    setCurrentSurvey(updated);
    onSaveSurvey(updated);
  };

  const handleGeneratePrdWithGemini = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyData: currentSurvey }),
      });

      if (!res.ok) {
        throw new Error('Fallback para gerador local.');
      }

      const data = await res.json();
      if (data.executiveSummary) {
        setPrdSpec(data);
      } else {
        setPrdSpec(buildPrdFromSurvey(currentSurvey));
      }
    } catch {
      setPrdSpec(buildPrdFromSurvey(currentSurvey));
    } finally {
      setIsGenerating(false);
      setActiveSubTab('prd');
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportPrdMarkdown = () => {
    const md = `# ${prdSpec.title}
Versão: ${prdSpec.version}

## 1. Resumo Executivo
${prdSpec.executiveSummary}

## 2. Declaração do Problema
${prdSpec.problemStatement}

## 3. Personas de Usuário
${prdSpec.userPersonas.map((p) => `- **${p.role}**: ${p.description}`).join('\n')}

## 4. Requisitos Funcionais (RFs)
${prdSpec.functionalRequirements
  .map((rf) => `- **[${rf.id}] ${rf.title}** (${rf.priority}): ${rf.description}`)
  .join('\n')}

## 5. Estratégia PWA & Offline
${prdSpec.pwaStrategy}

## 6. Roadmap de Escalabilidade
${prdSpec.scalingRoadmap.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;
    downloadFile('PRD.md', md);
  };

  const exportAgentsMarkdown = () => {
    const md = `# Arquitetura de Agentes de IA - Gestão Veicular

${prdSpec.aiAgents
  .map(
    (ag) => `### ${ag.name}
**Papel**: ${ag.role}
- **Entradas**: ${ag.inputs}
- **Saídas**: ${ag.outputs}
`
  )
  .join('\n\n')}
`;
    downloadFile('AGENTES.md', md);
  };

  const exportClassesMarkdown = () => {
    const md = `# Diagrama de Classes e Entidades de Dados

\`\`\`typescript
${prdSpec.classDiagramDescription}
\`\`\`
`;
    downloadFile('CLASSES.md', md);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Documentação de Arquitetura Modular & Agentes</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100">
              Gerador de PRD, Agentes de IA e Diagramas de Classes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Responda ao questionário interativo para adaptar o PRD e a arquitetura modular para o seu veículo e stack preferida. Baixe os arquivos <strong className="text-indigo-400">PRD.md, AGENTES.md e CLASSES.md</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportPrdMarkdown}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>PRD.md</span>
            </button>
            <button
              onClick={exportAgentsMarkdown}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>AGENTES.md</span>
            </button>
            <button
              onClick={exportClassesMarkdown}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CLASSES.md</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar pt-6 border-t border-slate-800/80 mt-6">
          {[
            { id: 'survey', label: '1. Questionário & Orientação', icon: HelpCircle },
            { id: 'prd', label: '2. PRD (Documento de Requisitos)', icon: FileText },
            { id: 'agents', label: '3. Agentes de IA', icon: Bot },
            { id: 'classes', label: '4. Diagrama de Classes', icon: Boxes },
            { id: 'scaling', label: '5. Escalabilidade Modular', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Survey & Orientation */}
      {activeSubTab === 'survey' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Questionário de Orientação & Personalização do Sistema
            </h3>
            <p className="text-xs text-slate-400">
              Responda às perguntas abaixo para refinar as diretrizes dos arquivos PRD, regras dos agentes e arquitetura de dados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                1. Qual é o Modelo, Marca e Ano do seu Veículo Principal?
              </label>
              <input
                type="text"
                value={currentSurvey.vehicleBrandModel}
                onChange={(e) => handleUpdateSurvey('vehicleBrandModel', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                2. Qual o Perfil de Uso do Veículo?
              </label>
              <select
                value={currentSurvey.usageType}
                onChange={(e) => handleUpdateSurvey('usageType', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              >
                <option value="Urbano Misto (~30 KM/dia)">Urbano Misto (~30 KM/dia)</option>
                <option value="Uso Severo / Aplicativo / Táxi (~120 KM/dia)">Uso Severo / Aplicativo / Táxi (~120 KM/dia)</option>
                <option value="Uso Rodoviário / Viagens Frequentes (~80 KM/dia)">Uso Rodoviário / Viagens Frequentes (~80 KM/dia)</option>
                <option value="Uso Final de Semana (~10 KM/dia)">Uso Final de Semana (~10 KM/dia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                3. Qual o Objetivo Principal da Solução?
              </label>
              <input
                type="text"
                value={currentSurvey.primaryGoal}
                onChange={(e) => handleUpdateSurvey('primaryGoal', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                4. Arquitetura de Nuvem / Banco Preferido para Expansão
              </label>
              <select
                value={currentSurvey.preferredStack}
                onChange={(e) => handleUpdateSurvey('preferredStack', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              >
                <option value="PWA Local-First + Serverless Express + Gemini AI + Cloud Sync">
                  PWA Local-First + Express + Gemini AI (Recomendado)
                </option>
                <option value="Firebase Firestore + Firebase Auth">
                  Firebase (Firestore NoSQL + Auth)
                </option>
                <option value="Cloud SQL / PostgreSQL Relacional">
                  Cloud SQL / PostgreSQL Relacional
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              5. Necessidades Específicas ou Dores do seu Veículo
            </label>
            <textarea
              rows={3}
              value={currentSurvey.customNeeds}
              onChange={(e) => handleUpdateSurvey('customNeeds', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Respostas salvas automaticamente localmente.
            </span>
            <button
              onClick={handleGeneratePrdWithGemini}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sintetizando PRD com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regerar PRD e Arquitetura com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: PRD Document */}
      {activeSubTab === 'prd' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{prdSpec.title}</h3>
              <span className="text-xs text-indigo-400 font-mono">Versão: {prdSpec.version}</span>
            </div>
            <button
              onClick={exportPrdMarkdown}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PRD.md</span>
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">1. Resumo Executivo</h4>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {prdSpec.executiveSummary}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">2. Declaração do Problema</h4>
              <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {prdSpec.problemStatement}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-2">3. Personas de Usuários</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prdSpec.userPersonas.map((p, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <strong className="text-indigo-400 block mb-1">{p.role}</strong>
                    <p className="text-slate-400">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-2">4. Requisitos Funcionais</h4>
              <div className="space-y-2">
                {prdSpec.functionalRequirements.map((rf) => (
                  <div key={rf.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px]">
                      {rf.id}
                    </span>
                    <div>
                      <strong className="text-slate-200 block">{rf.title} ({rf.priority})</strong>
                      <p className="text-slate-400">{rf.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Agents Architecture */}
      {activeSubTab === 'agents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                Arquitetura de Agentes Inteligentes de IA
              </h3>
              <p className="text-xs text-slate-400">Agentes autônomos para automação de lembretes, precificação e OCR</p>
            </div>
            <button
              onClick={exportAgentsMarkdown}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar AGENTES.md</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prdSpec.aiAgents.map((ag, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                  <Bot className="w-4 h-4" />
                  <span>{ag.name}</span>
                </div>
                <p className="text-xs text-slate-300">{ag.role}</p>

                <div className="text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                  <div>
                    <span className="text-slate-500 font-semibold block">Entradas:</span>
                    <span className="text-slate-300">{ag.inputs}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Saídas Estruturadas:</span>
                    <span className="text-emerald-400 font-semibold">{ag.outputs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Class Diagrams */}
      {activeSubTab === 'classes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                Diagrama de Classes & Entidades do Sistema
              </h3>
              <p className="text-xs text-slate-400">Modelo de dados TypeScript & Relacionamentos</p>
            </div>
            <button
              onClick={exportClassesMarkdown}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CLASSES.md</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
              {prdSpec.classDiagramDescription}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: Modular Scaling Roadmap */}
      {activeSubTab === 'scaling' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Roadmap de Escalabilidade & Arquitetura Modular
            </h3>
            <p className="text-xs text-slate-400">Estratégia para suportar de 1 a 100.000 usuários com zero downtime</p>
          </div>

          <div className="space-y-3">
            {prdSpec.scalingRoadmap.map((step, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { PrdSpec, SurveyQuestions } from '../types';

export const DEFAULT_PRD: PrdSpec = {
  title: 'Documento de Requisitos de Produto (PRD) & Arquitetura - Gestão Veicular Urbano',
  version: '1.1.0 (Ciclo Urbano & Firebase Spark)',
  executiveSummary: 'O aplicativo Gestão Veicular & Passaporte Digital foi desenhado sob medida para veículos usados em uso urbano severo (trânsito anda-e-para, maior desgaste de freios, óleo e arrefecimento). O sistema opera no modelo Local-First PWA com integração ao Firebase Gratuito (Spark Plan: Firestore + Auth sem custos fixos), mantendo controle rigoroso de manutenções preventivas, previsão financeira de custos e Passaporte de Revenda público para maximizar a avaliação do automóvel no mercado.',
  problemStatement: 'Veículos de uso essencialmente urbano sofrem degradação acelerada de lubrificantes e componentes de fricção. Proprietários perdem o histórico de notas, atrasam trocas por desconhecer a severidade do ciclo urbano e enfrentam desvalorização de até 20% na revenda. A solução resolve isso oferecendo inteligência preditiva, persistência em nuvem sem custos (Firebase Spark) e relatórios executivos em PDF.',
  userPersonas: [
    {
      role: 'Proprietário Cuidadoso (Uso Urbano)',
      description: 'Deseja proteger o motor contra a degradação acelerada do trânsito urbano e evitar manutenções corretivas caras.'
    },
    {
      role: 'Mecânico de Confiança',
      description: 'Acessa o app para registrar peças trocadas (com Part Number e marcas originais) e notas fiscais diretamente no histórico.'
    },
    {
      role: 'Potencial Comprador (Revenda)',
      description: 'Consulta o Passaporte Digital via QR Code público para comprovar que o uso urbano teve revisões rigorosas antecipadas.'
    },
    {
      role: 'Membro da Família (Co-Gestor)',
      description: 'Registra a quilometragem atualizada ao abastecer e recebe alertas automáticos no celular.'
    }
  ],
  functionalRequirements: [
    {
      id: 'RF01',
      title: 'Algoritmo de Ciclo Urbano & Lembretes por KM/Dia',
      description: 'Calcula o impacto da rodagem diária em trânsito denso, aplicando margem de segurança de 15% para lubrificantes e pastilhas de freio.',
      priority: 'P0 - Crítico'
    },
    {
      id: 'RF02',
      title: 'Catálogo de Peças, Marcas e Garantias',
      description: 'Cadastro detalhado com SKU, marca, quantidade, nota fiscal anexada e aviso de expiração de garantia de serviço.',
      priority: 'P0 - Crítico'
    },
    {
      id: 'RF03',
      title: 'Passaporte de Revenda & Selo de Autenticidade PDF',
      description: 'Geração de relatório em PDF e link seguro para validação em 1 clique por potenciais compradores.',
      priority: 'P0 - Crítico'
    },
    {
      id: 'RF04',
      title: 'Sincronização Firebase Gratuito (Spark Plan)',
      description: 'Estrutura de dados otimizada em Firestore para até 50.000 leituras/dia totalmente sem custo no plano Spark da Google.',
      priority: 'P1 - Alto'
    },
    {
      id: 'RF05',
      title: 'Controle de Acesso por Papéis (RBAC)',
      description: 'Permissões granulares para Proprietário (Full), Co-proprietário, Mecânico e Comprador (Leitura filtrada).',
      priority: 'P1 - Alto'
    },
    {
      id: 'RF06',
      title: 'Auditoria de Notas Fiscais com Gemini AI',
      description: 'Reconhecimento inteligente de peças e valores a partir de fotos de comprovantes de oficinas.',
      priority: 'P2 - Médio'
    }
  ],
  aiAgents: [
    {
      name: 'Agente Previsor de Odômetro (Urban Cycle Predictor)',
      role: 'Analisa a média de km/dia e a severidade do trânsito urbano para recalcular datas limite de trocas de óleo e fluidos.',
      inputs: 'Histórico de odômetro, datas e tipo de rodagem',
      outputs: 'Datas exatas para trocas com alerta de antecipação urbana'
    },
    {
      name: 'Agente Recomendador Honda/Multimarca IA (Gemini Engine)',
      role: 'Acessa dados do fabricante e prescreve marcas homologadas (ex: Idemitsu, Shell, Cobreq, TRW) para ciclo severo.',
      inputs: 'Modelo do veículo, ano, km e respostas do questionário',
      outputs: 'Lista de peças prioritárias, custo estimado em R$ e selos de urgência'
    },
    {
      name: 'Agente OCR & Leitura de Notas (Invoice Scanner)',
      role: 'Converte notas fiscais e fotos de ordem de serviço em registros estruturados com peça, marca e garantia.',
      inputs: 'Texto ou imagem de nota fiscal',
      outputs: 'Objeto JSON com itens da manutenção'
    },
    {
      name: 'Agente de Score de Revenda (Resale Valuation Engine)',
      role: 'Pontua a conservação do veículo de 0 a 100 com base no histórico de revisões comprovadas e peças certificadas.',
      inputs: 'Manutenções registradas e pontualidade',
      outputs: 'Score de valorização e relatório para compradores'
    }
  ],
  classDiagramDescription: `
class Vehicle {
  +string id
  +string make
  +string model
  +int year
  +int currentOdometer
  +int averageDailyKm
  +int resaleScore
  +updateOdometer(newKm: int)
  +calculateHealthScore(): int
}

class MaintenanceLog {
  +string id
  +string vehicleId
  +string title
  +ServiceCategory category
  +Date date
  +int odometerKm
  +double totalCost
  +PartItem[] partsReplaced
  +bool isVerified
  +addPart(part: PartItem)
}

class PartItem {
  +string id
  +string name
  +string brand
  +string partNumber
  +int quantity
  +double cost
  +int warrantyMonths
}

class ReminderRule {
  +string id
  +int intervalKm
  +int targetKm
  +Date targetDate
  +checkUrgency(currentKm: int): string
}

class SharedUser {
  +string id
  +string name
  +string email
  +UserRole role
}

Vehicle "1" -- "*" MaintenanceLog
Vehicle "1" -- "*" ReminderRule
Vehicle "1" -- "*" SharedUser
MaintenanceLog "1" -- "*" PartItem
`,
  pwaStrategy: 'PWA Local-First com ServiceWorker (Workbox) e LocalStorage/IndexedDB para operação instantânea offline. Sincronização assíncrona com Firebase Firestore no plano gratuito Spark.',
  scalingRoadmap: [
    'Fase 1 (Atual - Local-First PWA & PDF): Operação completa offline no dispositivo, com inteligência Gemini para diagnóstico e exportação de Passaporte PDF.',
    'Fase 2 (Firebase Spark Gratuito): Ativação de Auth e sincronização Firestore sem estourar a cota gratuita (50k leituras/dia).',
    'Fase 3 (Rede de Oficinas Parceiras): Conexão direta com sistemas de oficinas para envio de OS em tempo real.',
    'Fase 4 (Expansão de Frota & Validação): Suporte a múltiplos veículos da família e verificação de integridade do histórico.'
  ]
};

export function buildPrdFromSurvey(survey: SurveyQuestions): PrdSpec {
  return {
    ...DEFAULT_PRD,
    title: `PRD Personalizado - ${survey.vehicleBrandModel || 'Gestão Veicular'}`,
    executiveSummary: `Especificação para o veículo ${survey.vehicleBrandModel}. Objetivo principal: ${survey.primaryGoal}. Padrão de uso: ${survey.usageType}.`,
    pwaStrategy: `Arquitetura focada em ${survey.preferredStack}. Suporta funcionamento totalmente offline, sincronização em segundo plano e geração de relatórios instantâneos.`,
  };
}

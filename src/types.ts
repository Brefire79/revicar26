export type ServiceCategory = 
  | 'Óleo e Lubrificantes'
  | 'Freios'
  | 'Pneus e Alinhamento'
  | 'Motor e Correias'
  | 'Transmissão'
  | 'Filtros'
  | 'Suspensão e Direção'
  | 'Elétrica e Bateria'
  | 'Ar Condicionado'
  | 'Outros';

export interface PartItem {
  id: string;
  name: string;
  brand: string;
  partNumber?: string;
  quantity: number;
  cost: number;
  warrantyMonths?: number;
  warrantyExpirationDate?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  title: string;
  category: ServiceCategory;
  date: string;
  odometerKm: number;
  totalCost: number;
  mechanicName?: string;
  mechanicShop?: string;
  invoiceNumber?: string;
  notes?: string;
  partsReplaced: PartItem[];
  receiptImage?: string;
  isVerified: boolean;
  createdByRole?: 'owner' | 'co_owner' | 'mechanic';
}

export interface ReminderRule {
  id: string;
  vehicleId: string;
  title: string;
  category: ServiceCategory;
  intervalKm: number;
  intervalMonths: number;
  lastPerformedKm: number;
  lastPerformedDate: string;
  targetKm: number;
  targetDate: string;
  estimatedCost: number;
  urgency: 'critical' | 'warning' | 'ok';
  description?: string;
  recommendedBrands?: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  fuelType: 'Flex' | 'Gasolina' | 'Etanol' | 'Diesel' | 'Híbrido' | 'Elétrico';
  currentOdometer: number;
  averageDailyKm: number;
  photoUrl?: string;
  createdDate: string;
  resaleScore: number;
}

export interface SharedUser {
  id: string;
  vehicleId: string;
  name: string;
  email: string;
  role: 'owner' | 'co_owner' | 'mechanic' | 'buyer';
  invitedAt: string;
  status: 'Ativo' | 'Pendente';
}

export interface SurveyQuestions {
  vehicleBrandModel: string;
  usageType: string; // 'Urbano', 'Estrada', 'Misto', 'Uso Severo / Aplicativo'
  primaryGoal: string; // 'Economia', 'Preservação de Revenda', 'Segurança Familiar'
  preferredStack: string; // 'Firebase', 'Cloud SQL / PostgreSQL', 'PWA Offline First'
  sharedRolesNeeded: string[];
  customNeeds: string;
}

export interface PrdSpec {
  title: string;
  version: string;
  executiveSummary: string;
  problemStatement: string;
  userPersonas: { role: string; description: string }[];
  functionalRequirements: { id: string; title: string; description: string; priority: string }[];
  aiAgents: { name: string; role: string; inputs: string; outputs: string }[];
  classDiagramDescription: string;
  pwaStrategy: string;
  scalingRoadmap: string[];
}

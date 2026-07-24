import { Vehicle, MaintenanceLog, ReminderRule, SharedUser, SurveyQuestions } from '../types';

const VEHICLES_KEY = 'autokept_vehicles_v1';
const LOGS_KEY = 'autokept_logs_v1';
const REMINDERS_KEY = 'autokept_reminders_v1';
const SHARED_KEY = 'autokept_shared_v1';
const SURVEY_KEY = 'autokept_survey_v1';

export const INITIAL_VEHICLE: Vehicle = {
  id: 'veh-001',
  name: 'Meu Civic EXL (Ciclo Urbano)',
  make: 'Honda',
  model: 'Civic EXL 2.0 Flex',
  year: 2021,
  licensePlate: 'ABC-8X88',
  vin: '93HFC1F30MZ123456',
  fuelType: 'Flex',
  currentOdometer: 48500,
  averageDailyKm: 35,
  photoUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80',
  createdDate: '2023-01-15',
  resaleScore: 96,
};

export const INITIAL_LOGS: MaintenanceLog[] = [
  {
    id: 'log-101',
    vehicleId: 'veh-001',
    title: 'Revisão de 40.000 km & Troca de Óleo do Câmbio CVT',
    category: 'Transmissão',
    date: '2025-11-10',
    odometerKm: 40200,
    totalCost: 1150,
    mechanicName: 'Carlos Silva',
    mechanicShop: 'Oficina H-Tech Especializada Honda',
    invoiceNumber: 'NF-88421',
    notes: 'Substituição do fluido de transmissão CVT HCF-2 original e filtro do trocador de calor. Óleo do motor 0W20 100% sintético.',
    isVerified: true,
    createdByRole: 'owner',
    partsReplaced: [
      {
        id: 'part-01',
        name: 'Fluido de Câmbio CVT Honda HCF-2 (4 Litros)',
        brand: 'Honda Genuine Parts',
        partNumber: '08260-99058',
        quantity: 4,
        cost: 480,
        warrantyMonths: 12,
        warrantyExpirationDate: '2026-11-10',
      },
      {
        id: 'part-02',
        name: 'Filtro do Câmbio CVT Trocador de Calor',
        brand: 'Honda Genuine',
        partNumber: '25430-PLR-003',
        quantity: 1,
        cost: 180,
        warrantyMonths: 12,
      },
      {
        id: 'part-03',
        name: 'Óleo Sintético Motor 0W20 Synthetic',
        brand: 'Idemitsu / Honda',
        partNumber: '08234-P99-01NP1',
        quantity: 4,
        cost: 240,
        warrantyMonths: 6,
      }
    ],
  },
  {
    id: 'log-102',
    vehicleId: 'veh-001',
    title: 'Troca do Jogo de Pneus & Alinhamento 3D',
    category: 'Pneus e Alinhamento',
    date: '2025-08-14',
    odometerKm: 35100,
    totalCost: 2680,
    mechanicName: 'Roberto Pneus',
    mechanicShop: 'Centro Automotivo Michelin',
    invoiceNumber: 'NF-72109',
    notes: 'Troca dos 4 pneus aro 17. Balanceamento das 4 rodas, alinhamento 3D de geometria e substituição dos bicos tubeless.',
    isVerified: true,
    createdByRole: 'owner',
    partsReplaced: [
      {
        id: 'part-04',
        name: 'Pneu Michelin Primacy 4 215/50 R17',
        brand: 'Michelin',
        partNumber: 'MIC-2155017',
        quantity: 4,
        cost: 2400,
        warrantyMonths: 60,
        warrantyExpirationDate: '2030-08-14',
      }
    ],
  },
  {
    id: 'log-103',
    vehicleId: 'veh-001',
    title: 'Troca de Pastilhas de Freio Dianteiras e Sangria',
    category: 'Freios',
    date: '2025-03-20',
    odometerKm: 28000,
    totalCost: 490,
    mechanicName: 'Marcos Mecânico',
    mechanicShop: 'Garagem do Mecânico',
    invoiceNumber: 'NF-51002',
    notes: 'Pastilhas de freio cerâmicas originais Bosch. Fluido de freio DOT 4 Varga.',
    isVerified: true,
    createdByRole: 'mechanic',
    partsReplaced: [
      {
        id: 'part-05',
        name: 'Pastilha de Freio Dianteira Cerâmica',
        brand: 'Bosch QuietCast',
        partNumber: 'BP1512',
        quantity: 1,
        cost: 320,
        warrantyMonths: 12,
      },
      {
        id: 'part-06',
        name: 'Fluido de Freio DOT 4 500ml',
        brand: 'TRW Varga',
        quantity: 2,
        cost: 70,
        warrantyMonths: 12,
      }
    ],
  }
];

export const INITIAL_REMINDERS: ReminderRule[] = [
  {
    id: 'rem-01',
    vehicleId: 'veh-001',
    title: 'Próxima Troca de Óleo e Filtro (50.000 km)',
    category: 'Óleo e Lubrificantes',
    intervalKm: 10000,
    intervalMonths: 12,
    lastPerformedKm: 40200,
    lastPerformedDate: '2025-11-10',
    targetKm: 50200,
    targetDate: '2026-08-20',
    estimatedCost: 380,
    urgency: 'warning',
    description: 'Faltam aproximadamente 1.700 km ou ~40 dias para a troca recomendada.',
    recommendedBrands: ['Idemitsu 0W20', 'Shell Helix Ultra', 'Fram Ph5949']
  },
  {
    id: 'rem-02',
    vehicleId: 'veh-001',
    title: 'Substituição de Filtro de Cabine e Ar do Motor',
    category: 'Filtros',
    intervalKm: 15000,
    intervalMonths: 12,
    lastPerformedKm: 40200,
    lastPerformedDate: '2025-11-10',
    targetKm: 55200,
    targetDate: '2026-11-10',
    estimatedCost: 190,
    urgency: 'ok',
    description: 'Manter ar limpo reduz desgaste do compressor do A/C.',
    recommendedBrands: ['Mann Filter', 'Mahle', 'Tecfil']
  },
  {
    id: 'rem-03',
    vehicleId: 'veh-001',
    title: 'Velas de Ignição Iridium & Ajuste de Válvulas',
    category: 'Motor e Correias',
    intervalKm: 60000,
    intervalMonths: 36,
    lastPerformedKm: 0,
    lastPerformedDate: '2021-01-01',
    targetKm: 60000,
    targetDate: '2027-02-15',
    estimatedCost: 750,
    urgency: 'ok',
    description: 'Velas de Iridium garantem queima otimizada e economia de combustível.',
    recommendedBrands: ['NGK Laser Iridium DILZKAR7B11']
  },
  {
    id: 'rem-04',
    vehicleId: 'veh-001',
    title: 'Checagem do Líquido de Arrefecimento e Bateria',
    category: 'Elétrica e Bateria',
    intervalKm: 20000,
    intervalMonths: 18,
    lastPerformedKm: 28000,
    lastPerformedDate: '2025-03-20',
    targetKm: 48000,
    targetDate: '2026-07-20',
    estimatedCost: 450,
    urgency: 'critical',
    description: 'Verificar estado de carga da bateria Moura de 60Ah e aditivo do radiador.',
    recommendedBrands: ['Bateria Moura 60Ah', 'Aditivo Tirreno / Paraflu']
  }
];

export const INITIAL_SHARED_USERS: SharedUser[] = [
  {
    id: 'user-01',
    vehicleId: 'veh-001',
    name: 'Breno Luis (Você)',
    email: 'breno.luis@gmail.com',
    role: 'owner',
    invitedAt: '2023-01-15',
    status: 'Ativo'
  },
  {
    id: 'user-02',
    vehicleId: 'veh-001',
    name: 'Mariana Silva (Esposa)',
    email: 'mariana.silva@gmail.com',
    role: 'co_owner',
    invitedAt: '2024-03-10',
    status: 'Ativo'
  },
  {
    id: 'user-03',
    vehicleId: 'veh-001',
    name: 'Carlos - Oficina H-Tech',
    email: 'carlos@htechmecanica.com.br',
    role: 'mechanic',
    invitedAt: '2025-11-10',
    status: 'Ativo'
  }
];

export const INITIAL_SURVEY: SurveyQuestions = {
  vehicleBrandModel: 'Honda Civic 2.0 EXL 2021 (Usado - Ciclo Urbano)',
  usageType: 'Urbano Severo / Trânsito Urbano Diário (~35 km/dia com anda-e-para)',
  primaryGoal: 'Preservação de Revenda, Prevenção do Desgaste Urbano e Economia Preventiva',
  preferredStack: 'Firebase Gratuito (Spark Plan - Firestore + Auth) + PWA Local-First',
  sharedRolesNeeded: ['Proprietário', 'Co-Proprietário / Família', 'Mecânico de Confiança', 'Comprador / Passaporte Público'],
  customNeeds: 'Veículo em ciclo urbano severo. Manter infraestrutura em Firebase 100% Gratuito (Spark Tier), com sincronização em nuvem e suporte total a PWA offline para expansão futura.'
};

// LocalStorage helpers
export function getStoredVehicle(): Vehicle {
  const data = localStorage.getItem(VEHICLES_KEY);
  return data ? JSON.parse(data) : INITIAL_VEHICLE;
}

export function saveVehicle(vehicle: Vehicle): void {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicle));
}

export function getStoredLogs(): MaintenanceLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : INITIAL_LOGS;
}

export function saveLogs(logs: MaintenanceLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getStoredReminders(): ReminderRule[] {
  const data = localStorage.getItem(REMINDERS_KEY);
  return data ? JSON.parse(data) : INITIAL_REMINDERS;
}

export function saveReminders(reminders: ReminderRule[]): void {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function getStoredSharedUsers(): SharedUser[] {
  const data = localStorage.getItem(SHARED_KEY);
  return data ? JSON.parse(data) : INITIAL_SHARED_USERS;
}

export function saveSharedUsers(users: SharedUser[]): void {
  localStorage.setItem(SHARED_KEY, JSON.stringify(users));
}

export function getStoredSurvey(): SurveyQuestions {
  const data = localStorage.getItem(SURVEY_KEY);
  return data ? JSON.parse(data) : INITIAL_SURVEY;
}

export function saveSurvey(survey: SurveyQuestions): void {
  localStorage.setItem(SURVEY_KEY, JSON.stringify(survey));
}

export function resetToDefaults(): void {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLE));
  localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(INITIAL_REMINDERS));
  localStorage.setItem(SHARED_KEY, JSON.stringify(INITIAL_SHARED_USERS));
  localStorage.setItem(SURVEY_KEY, JSON.stringify(INITIAL_SURVEY));
}

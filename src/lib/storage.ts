import { Vehicle, MaintenanceLog, ReminderRule, SharedUser, SurveyQuestions } from '../types';

const VEHICLES_KEY = 'autokept_vehicles_v1';
const LOGS_KEY = 'autokept_logs_v1';
const REMINDERS_KEY = 'autokept_reminders_v1';
const SHARED_KEY = 'autokept_shared_v1';
const SURVEY_KEY = 'autokept_survey_v1';

const DEMO_VEHICLE_ID = 'veh-001';

export const INITIAL_VEHICLE: Vehicle = {
  id: '',
  name: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  fuelType: 'Flex',
  currentOdometer: 0,
  averageDailyKm: 0,
  createdDate: '',
  resaleScore: 0,
};

export const INITIAL_LOGS: MaintenanceLog[] = [];
export const INITIAL_REMINDERS: ReminderRule[] = [];
export const INITIAL_SHARED_USERS: SharedUser[] = [];

export const INITIAL_SURVEY: SurveyQuestions = {
  vehicleBrandModel: '',
  usageType: '',
  primaryGoal: '',
  preferredStack: 'Firebase Gratuito (Spark Plan - Firestore + Auth) + PWA Local-First',
  sharedRolesNeeded: [],
  customNeeds: ''
};

// LocalStorage helpers
const isDemoVehicle = (vehicle?: Vehicle | null) =>
  vehicle?.id === DEMO_VEHICLE_ID
  || vehicle?.licensePlate === 'ABC-8X88'
  || vehicle?.vin === '93HFC1F30MZ123456';

export function hasConfiguredVehicle(): boolean {
  const data = localStorage.getItem(VEHICLES_KEY);
  if (!data) return false;
  try {
    const vehicle = JSON.parse(data) as Vehicle;
    return Boolean(vehicle.id && vehicle.make && vehicle.model && !isDemoVehicle(vehicle));
  } catch {
    return false;
  }
}

export function getStoredVehicle(): Vehicle {
  const data = localStorage.getItem(VEHICLES_KEY);
  if (!data) return INITIAL_VEHICLE;
  const vehicle = JSON.parse(data) as Vehicle;
  return isDemoVehicle(vehicle) ? INITIAL_VEHICLE : vehicle;
}

export function saveVehicle(vehicle: Vehicle): void {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicle));
}

export function getStoredLogs(): MaintenanceLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  const logs = data ? JSON.parse(data) as MaintenanceLog[] : INITIAL_LOGS;
  return logs.filter((log) => log.vehicleId !== DEMO_VEHICLE_ID);
}

export function saveLogs(logs: MaintenanceLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getStoredReminders(): ReminderRule[] {
  const data = localStorage.getItem(REMINDERS_KEY);
  const reminders = data ? JSON.parse(data) as ReminderRule[] : INITIAL_REMINDERS;
  return reminders.filter((reminder) => reminder.vehicleId !== DEMO_VEHICLE_ID);
}

export function saveReminders(reminders: ReminderRule[]): void {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function getStoredSharedUsers(): SharedUser[] {
  const data = localStorage.getItem(SHARED_KEY);
  const users = data ? JSON.parse(data) as SharedUser[] : INITIAL_SHARED_USERS;
  return users.filter((user) => user.vehicleId !== DEMO_VEHICLE_ID);
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

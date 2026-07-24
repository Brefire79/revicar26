import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, MaintenanceLog, ReminderRule, SharedUser, SurveyQuestions } from './types';
import {
  getStoredVehicle,
  saveVehicle,
  getStoredLogs,
  saveLogs,
  getStoredReminders,
  saveReminders,
  getStoredSharedUsers,
  saveSharedUsers,
  getStoredSurvey,
  saveSurvey,
} from './lib/storage';
import {
  initFirebaseAuth,
  seedInitialDataToFirestore,
  subscribeVehicleFromFirestore,
  subscribeLogsFromFirestore,
  subscribeRemindersFromFirestore,
  subscribeSharedUsersFromFirestore,
  saveVehicleToFirestore,
  saveLogToFirestore,
  deleteLogFromFirestore,
  saveReminderToFirestore,
  saveMultipleRemindersToFirestore,
  deleteReminderFromFirestore,
  saveSharedUserToFirestore,
  deleteSharedUserFromFirestore,
} from './lib/firebase';
import { generateVehiclePdfReport } from './lib/pdfGenerator';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MaintenanceLogsView } from './components/MaintenanceLogsView';
import { FutureCostsView } from './components/FutureCostsView';
import { ResalePassportView } from './components/ResalePassportView';
import { SharedAccessView } from './components/SharedAccessView';
import { PrdArchitectureView } from './components/PrdArchitectureView';
import { OdometerModal } from './components/OdometerModal';
import { MaintenanceAlertToast, getDueRemindersAt90Percent } from './components/MaintenanceAlertToast';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistent Theme State (Claro / Escuro)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('autokept_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Apply theme to html root and sync with localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('autokept_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State initialized from local storage or default mocks
  const [vehicle, setVehicle] = useState<Vehicle>(getStoredVehicle);
  const [logs, setLogs] = useState<MaintenanceLog[]>(getStoredLogs);
  const [reminders, setReminders] = useState<ReminderRule[]>(getStoredReminders);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(getStoredSharedUsers);
  const [survey, setSurvey] = useState<SurveyQuestions>(getStoredSurvey);

  // Modals state
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);

  // Initialize Firebase Auth & Real-Time Listeners (Spark Free Tier)
  useEffect(() => {
    const dataUnsubscribers: Array<() => void> = [];
    const unsubscribeAuth = initFirebaseAuth(() => {
      seedInitialDataToFirestore(vehicle, logs, reminders, sharedUsers);
      dataUnsubscribers.push(
        subscribeVehicleFromFirestore((v) => setVehicle(v)),
        subscribeLogsFromFirestore((l) => setLogs(l)),
        subscribeRemindersFromFirestore((r) => setReminders(r)),
        subscribeSharedUsersFromFirestore((u) => setSharedUsers(u)),
      );
    });

    return () => {
      unsubscribeAuth();
      dataUnsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Local Storage Local-First Persistence
  useEffect(() => {
    saveVehicle(vehicle);
  }, [vehicle]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    saveSharedUsers(sharedUsers);
  }, [sharedUsers]);

  useEffect(() => {
    saveSurvey(survey);
  }, [survey]);

  // Handler to update odometer and recalculate reminders targetDates
  const handleUpdateOdometer = (newKm: number, dailyKm: number) => {
    const updatedVehicle: Vehicle = {
      ...vehicle,
      currentOdometer: newKm,
      averageDailyKm: dailyKm,
    };

    setVehicle(updatedVehicle);
    saveVehicleToFirestore(updatedVehicle);

    // Recalculate target dates for reminders based on new KM and daily rate
    const updatedReminders = reminders.map((rem) => {
      const kmRemaining = Math.max(0, rem.targetKm - newKm);
      const daysLeft = Math.max(1, Math.round(kmRemaining / dailyKm));
      const newTargetDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const urgency = kmRemaining <= 1000 ? 'critical' : kmRemaining <= 3000 ? 'warning' : 'ok';

      return {
        ...rem,
        targetDate: newTargetDate,
        urgency: urgency as any,
      };
    });

    setReminders(updatedReminders);
    saveMultipleRemindersToFirestore(updatedReminders);
  };

  const handleAddLog = (newLog: MaintenanceLog) => {
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveLogToFirestore(newLog);

    // If odometer in log is greater than current vehicle odometer, update vehicle
    if (newLog.odometerKm > vehicle.currentOdometer) {
      handleUpdateOdometer(newLog.odometerKm, vehicle.averageDailyKm);
    }
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter((l) => l.id !== id));
    deleteLogFromFirestore(id);
  };

  const handleAddReminder = (newRem: ReminderRule) => {
    setReminders([...reminders, newRem]);
    saveReminderToFirestore(newRem);
  };

  const handleAddSharedUser = (newUser: SharedUser) => {
    setSharedUsers([...sharedUsers, newUser]);
    saveSharedUserToFirestore(newUser);
  };

  const handleRemoveSharedUser = (id: string) => {
    setSharedUsers(sharedUsers.filter((u) => u.id !== id));
    deleteSharedUserFromFirestore(id);
  };

  const handleGeneratePdfReport = (isBuyerMode: boolean = false) => {
    generateVehiclePdfReport(vehicle, logs, reminders, isBuyerMode);
  };

  // Compute reminders that reached 90%+ limit of KM
  const dueRemindersAt90 = useMemo(
    () => getDueRemindersAt90Percent(reminders, vehicle.currentOdometer),
    [reminders, vehicle.currentOdometer]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vehicle={vehicle}
        theme={theme}
        dueReminders={dueRemindersAt90}
        onToggleTheme={handleToggleTheme}
        onOpenOdometerModal={() => setIsOdometerModalOpen(true)}
        onOpenAddLogModal={() => setIsAddLogModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            vehicle={vehicle}
            logs={logs}
            reminders={reminders}
            onOpenOdometerModal={() => setIsOdometerModalOpen(true)}
            onOpenAddLogModal={() => setIsAddLogModalOpen(true)}
            onGeneratePdf={() => handleGeneratePdfReport(false)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'logs' && (
          <MaintenanceLogsView
            vehicle={vehicle}
            logs={logs}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            isAddModalOpen={isAddLogModalOpen}
            setIsAddModalOpen={setIsAddLogModalOpen}
          />
        )}

        {activeTab === 'costs' && (
          <FutureCostsView
            vehicle={vehicle}
            logs={logs}
            reminders={reminders}
            onAddReminder={handleAddReminder}
          />
        )}

        {activeTab === 'passport' && (
          <ResalePassportView
            vehicle={vehicle}
            logs={logs}
            onGeneratePdf={handleGeneratePdfReport}
          />
        )}

        {activeTab === 'shared' && (
          <SharedAccessView
            vehicle={vehicle}
            sharedUsers={sharedUsers}
            onAddUser={handleAddSharedUser}
            onRemoveUser={handleRemoveSharedUser}
          />
        )}

        {activeTab === 'prd' && (
          <PrdArchitectureView
            survey={survey}
            onSaveSurvey={setSurvey}
          />
        )}
      </main>

      {/* Odometer Quick Update Modal */}
      <OdometerModal
        isOpen={isOdometerModalOpen}
        onClose={() => setIsOdometerModalOpen(false)}
        vehicle={vehicle}
        onUpdateOdometer={handleUpdateOdometer}
      />

      {/* Floating Interactive Toast Alert for 90%+ Maintenance Rules */}
      <MaintenanceAlertToast
        dueReminders={dueRemindersAt90}
        currentOdometer={vehicle.currentOdometer}
        onViewReminders={() => setActiveTab('costs')}
        onOpenAddLogModal={() => setIsAddLogModalOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Gestão Veicular & Passaporte Digital. PWA Offline-First para Valorização e Controle Preventivo.</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('prd')}
              className="text-indigo-400 hover:underline font-semibold"
            >
              Arquivos PRD & Arquitetura
            </button>
            <span>•</span>
            <button
              onClick={() => handleGeneratePdfReport(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Passaporte PDF
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

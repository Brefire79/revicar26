import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  collection,
  writeBatch,
  getFirestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Vehicle, MaintenanceLog, ReminderRule, SharedUser } from '../types';

// Initialize Firebase App
const app = getApps().length === 0
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApp();

// Initialize Firestore with offline persistence
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  }, firebaseConfig.firestoreDatabaseId || '(default)');
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
}

export const db = dbInstance;
export const auth = getAuth(app);

// Keep track of current user
let currentUser: User | null = null;
const LEGACY_DEMO_IDS = {
  logs: ['log-101', 'log-102', 'log-103'],
  reminders: ['rem-01', 'rem-02', 'rem-03', 'rem-04'],
  users: ['user-01', 'user-02', 'user-03'],
};

// Ensure anonymous login for Firebase
export const initFirebaseAuth = (onUserReady?: (user: User) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      if (onUserReady) onUserReady(user);
    } else {
      signInAnonymously(auth)
        .catch((err) => {
          console.warn('Firebase Auth anonymous login error:', err);
        });
    }
  });
};

// Firestore Collection References
const VEHICLE_DOC_ID = 'main-vehicle';

const requireUserId = () => {
  if (!currentUser) throw new Error('Usuário ainda não autenticado.');
  return currentUser.uid;
};

const userDoc = () => doc(db, 'users', requireUserId());
const userCollection = (name: string) => collection(userDoc(), name);
const userItemDoc = (collectionName: string, id: string) =>
  doc(userDoc(), collectionName, id);

const sanitizeForFirestore = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

export const removeLegacyDemoDataFromFirestore = async () => {
  try {
    const batch = writeBatch(db);
    LEGACY_DEMO_IDS.logs.forEach((id) => batch.delete(userItemDoc('maintenance_logs', id)));
    LEGACY_DEMO_IDS.reminders.forEach((id) => batch.delete(userItemDoc('reminders', id)));
    LEGACY_DEMO_IDS.users.forEach((id) => batch.delete(userItemDoc('shared_users', id)));

    const vehicleRef = userItemDoc('vehicles', VEHICLE_DOC_ID);
    const vehicleSnap = await getDoc(vehicleRef);
    if (vehicleSnap.exists() && vehicleSnap.data().id === 'veh-001') {
      batch.delete(vehicleRef);
    }
    await batch.commit();
  } catch (err) {
    console.warn('Legacy demo cleanup skipped:', err);
  }
};

// Vehicle Persistence
export const saveVehicleToFirestore = async (vehicle: Vehicle) => {
  try {
    const vehicleRef = userItemDoc('vehicles', VEHICLE_DOC_ID);
    await setDoc(
      vehicleRef,
      sanitizeForFirestore({ ...vehicle, updatedAt: new Date().toISOString() }),
      { merge: true },
    );
  } catch (err) {
    console.warn('Firestore save vehicle error:', err);
  }
};

export const subscribeVehicleFromFirestore = (onUpdate: (vehicle: Vehicle) => void) => {
  const vehicleRef = userItemDoc('vehicles', VEHICLE_DOC_ID);
  return onSnapshot(vehicleRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as Vehicle;
      onUpdate(data);
    }
  }, (err) => {
    console.warn('Firestore vehicle snapshot error:', err);
  });
};

// Logs Persistence
export const saveLogToFirestore = async (log: MaintenanceLog) => {
  try {
    const logRef = userItemDoc('maintenance_logs', log.id);
    await setDoc(logRef, sanitizeForFirestore({ ...log, updatedAt: new Date().toISOString() }), { merge: true });
  } catch (err) {
    console.warn('Firestore save log error:', err);
  }
};

export const deleteLogFromFirestore = async (id: string) => {
  try {
    const logRef = userItemDoc('maintenance_logs', id);
    await deleteDoc(logRef);
  } catch (err) {
    console.warn('Firestore delete log error:', err);
  }
};

export const subscribeLogsFromFirestore = (onUpdate: (logs: MaintenanceLog[]) => void) => {
  const logsCol = userCollection('maintenance_logs');
  return onSnapshot(logsCol, (querySnap) => {
    const logsList: MaintenanceLog[] = [];
    querySnap.forEach((docSnap) => {
      logsList.push(docSnap.data() as MaintenanceLog);
    });
    if (logsList.length > 0) {
      logsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(logsList);
    }
  }, (err) => {
    console.warn('Firestore logs snapshot error:', err);
  });
};

// Reminders Persistence
export const saveReminderToFirestore = async (rem: ReminderRule) => {
  try {
    const remRef = userItemDoc('reminders', rem.id);
    await setDoc(remRef, sanitizeForFirestore({ ...rem, updatedAt: new Date().toISOString() }), { merge: true });
  } catch (err) {
    console.warn('Firestore save reminder error:', err);
  }
};

export const saveMultipleRemindersToFirestore = async (reminders: ReminderRule[]) => {
  try {
    const batch = writeBatch(db);
    reminders.forEach((rem) => {
      const remRef = userItemDoc('reminders', rem.id);
      batch.set(remRef, sanitizeForFirestore({ ...rem, updatedAt: new Date().toISOString() }), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore batch reminders save error:', err);
  }
};

export const deleteReminderFromFirestore = async (id: string) => {
  try {
    const remRef = userItemDoc('reminders', id);
    await deleteDoc(remRef);
  } catch (err) {
    console.warn('Firestore delete reminder error:', err);
  }
};

export const subscribeRemindersFromFirestore = (onUpdate: (reminders: ReminderRule[]) => void) => {
  const remindersCol = userCollection('reminders');
  return onSnapshot(remindersCol, (querySnap) => {
    const list: ReminderRule[] = [];
    querySnap.forEach((docSnap) => {
      list.push(docSnap.data() as ReminderRule);
    });
    if (list.length > 0) {
      list.sort((a, b) => a.targetKm - b.targetKm);
      onUpdate(list);
    }
  }, (err) => {
    console.warn('Firestore reminders snapshot error:', err);
  });
};

// Shared Users Persistence
export const saveSharedUserToFirestore = async (user: SharedUser) => {
  try {
    const uRef = userItemDoc('shared_users', user.id);
    await setDoc(uRef, sanitizeForFirestore({ ...user, updatedAt: new Date().toISOString() }), { merge: true });
  } catch (err) {
    console.warn('Firestore save shared user error:', err);
  }
};

export const deleteSharedUserFromFirestore = async (id: string) => {
  try {
    const uRef = userItemDoc('shared_users', id);
    await deleteDoc(uRef);
  } catch (err) {
    console.warn('Firestore delete shared user error:', err);
  }
};

export const subscribeSharedUsersFromFirestore = (onUpdate: (users: SharedUser[]) => void) => {
  const col = userCollection('shared_users');
  return onSnapshot(col, (querySnap) => {
    const list: SharedUser[] = [];
    querySnap.forEach((docSnap) => {
      list.push(docSnap.data() as SharedUser);
    });
    if (list.length > 0) {
      onUpdate(list);
    }
  }, (err) => {
    console.warn('Firestore shared users snapshot error:', err);
  });
};

// Initial Seed to Firestore if Empty
export const seedInitialDataToFirestore = async (
  initialVehicle: Vehicle,
  initialLogs: MaintenanceLog[],
  initialReminders: ReminderRule[],
  initialSharedUsers: SharedUser[]
) => {
  try {
    const vehicleRef = userItemDoc('vehicles', VEHICLE_DOC_ID);
    const vehicleSnap = await getDoc(vehicleRef);

    if (!vehicleSnap.exists()) {
      await setDoc(vehicleRef, sanitizeForFirestore({ ...initialVehicle, createdAt: new Date().toISOString() }));
      
      const batch = writeBatch(db);
      initialLogs.forEach((log) => {
        batch.set(userItemDoc('maintenance_logs', log.id), sanitizeForFirestore({ ...log, createdAt: new Date().toISOString() }));
      });
      initialReminders.forEach((rem) => {
        batch.set(userItemDoc('reminders', rem.id), sanitizeForFirestore({ ...rem, createdAt: new Date().toISOString() }));
      });
      initialSharedUsers.forEach((u) => {
        batch.set(userItemDoc('shared_users', u.id), sanitizeForFirestore({ ...u, createdAt: new Date().toISOString() }));
      });

      await batch.commit();
      console.log('Firebase Firestore seeded successfully.');
    }
  } catch (err) {
    console.warn('Firestore seed skipped or offline:', err);
  }
};

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

// Ensure anonymous login for Firebase
export const initFirebaseAuth = (onUserReady?: (user: User) => void) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      if (onUserReady) onUserReady(user);
    } else {
      signInAnonymously(auth)
        .then((cred) => {
          currentUser = cred.user;
          if (onUserReady) onUserReady(cred.user);
        })
        .catch((err) => {
          console.warn('Firebase Auth anonymous login error:', err);
        });
    }
  });
};

// Firestore Collection References
const VEHICLE_DOC_ID = 'main-vehicle';

// Vehicle Persistence
export const saveVehicleToFirestore = async (vehicle: Vehicle) => {
  try {
    const vehicleRef = doc(db, 'vehicles', VEHICLE_DOC_ID);
    await setDoc(vehicleRef, { ...vehicle, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore save vehicle error:', err);
  }
};

export const subscribeVehicleFromFirestore = (onUpdate: (vehicle: Vehicle) => void) => {
  const vehicleRef = doc(db, 'vehicles', VEHICLE_DOC_ID);
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
    const logRef = doc(db, 'maintenance_logs', log.id);
    await setDoc(logRef, { ...log, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore save log error:', err);
  }
};

export const deleteLogFromFirestore = async (id: string) => {
  try {
    const logRef = doc(db, 'maintenance_logs', id);
    await deleteDoc(logRef);
  } catch (err) {
    console.warn('Firestore delete log error:', err);
  }
};

export const subscribeLogsFromFirestore = (onUpdate: (logs: MaintenanceLog[]) => void) => {
  const logsCol = collection(db, 'maintenance_logs');
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
    const remRef = doc(db, 'reminders', rem.id);
    await setDoc(remRef, { ...rem, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore save reminder error:', err);
  }
};

export const saveMultipleRemindersToFirestore = async (reminders: ReminderRule[]) => {
  try {
    const batch = writeBatch(db);
    reminders.forEach((rem) => {
      const remRef = doc(db, 'reminders', rem.id);
      batch.set(remRef, { ...rem, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore batch reminders save error:', err);
  }
};

export const deleteReminderFromFirestore = async (id: string) => {
  try {
    const remRef = doc(db, 'reminders', id);
    await deleteDoc(remRef);
  } catch (err) {
    console.warn('Firestore delete reminder error:', err);
  }
};

export const subscribeRemindersFromFirestore = (onUpdate: (reminders: ReminderRule[]) => void) => {
  const remindersCol = collection(db, 'reminders');
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
    const uRef = doc(db, 'shared_users', user.id);
    await setDoc(uRef, { ...user, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore save shared user error:', err);
  }
};

export const deleteSharedUserFromFirestore = async (id: string) => {
  try {
    const uRef = doc(db, 'shared_users', id);
    await deleteDoc(uRef);
  } catch (err) {
    console.warn('Firestore delete shared user error:', err);
  }
};

export const subscribeSharedUsersFromFirestore = (onUpdate: (users: SharedUser[]) => void) => {
  const col = collection(db, 'shared_users');
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
    const vehicleRef = doc(db, 'vehicles', VEHICLE_DOC_ID);
    const vehicleSnap = await getDoc(vehicleRef);

    if (!vehicleSnap.exists()) {
      await setDoc(vehicleRef, { ...initialVehicle, createdAt: new Date().toISOString() });
      
      const batch = writeBatch(db);
      initialLogs.forEach((log) => {
        batch.set(doc(db, 'maintenance_logs', log.id), { ...log, createdAt: new Date().toISOString() });
      });
      initialReminders.forEach((rem) => {
        batch.set(doc(db, 'reminders', rem.id), { ...rem, createdAt: new Date().toISOString() });
      });
      initialSharedUsers.forEach((u) => {
        batch.set(doc(db, 'shared_users', u.id), { ...u, createdAt: new Date().toISOString() });
      });

      await batch.commit();
      console.log('Firebase Firestore seeded successfully.');
    }
  } catch (err) {
    console.warn('Firestore seed skipped or offline:', err);
  }
};

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Helper for error handling as per integration instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: Record<string, unknown>;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const authUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authUser?.uid || null,
      email: authUser?.email || null,
      emailVerified: authUser?.emailVerified || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Interfaces
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  jlptLevel: string;
  skills: string[];
  photoURL?: string;
  masterResume?: string;
  rirekisho?: string;
  shokumu?: string;
  createdAt: string | number | null;
  updatedAt: string | number | null;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: 'Applied' | 'Interview' | 'Rejected' | 'Offer' | 'Saved';
  appliedAt: string | number | null;
  updatedAt: string | number | null;
  location?: string;
  salary?: string;
  notes?: string;
  matchScore?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'match' | 'system';
  read: boolean;
  createdAt: string | number | null;
}

const convertTimestamps = (data: Record<string, unknown>) => {
  if (!data) return data;
  const result: Record<string, unknown> = { ...data };
  if (result.createdAt instanceof Timestamp) result.createdAt = result.createdAt.toMillis();
  if (result.updatedAt instanceof Timestamp) result.updatedAt = result.updatedAt.toMillis();
  if (result.appliedAt instanceof Timestamp) result.appliedAt = result.appliedAt.toMillis();
  return result;
};

// User Profile Service
export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (convertTimestamps(docSnap.data()) as unknown as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  subscribeToProfile(userId: string, callback: (profile: UserProfile | null) => void) {
    const docRef = doc(db, 'users', userId);
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? (convertTimestamps(doc.data()) as unknown as UserProfile) : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    });
  },

  async createProfile(profile: Partial<UserProfile>): Promise<void> {
    const path = `users/${profile.id}`;
    try {
      const data = {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', profile.id!), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      // Remove fields that should not be updated directly
      const dataToUpdate = { ...updates } as Record<string, unknown>;
      delete dataToUpdate.createdAt;
      delete dataToUpdate.updatedAt;
      
      await updateDoc(docRef, {
        ...dataToUpdate,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

// Applications Service
export const applicationService = {
  async applyToJob(application: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const path = `applications/${id}`;
    try {
      const data = {
        ...application,
        id,
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'applications', id), data);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return '';
    }
  },

  async getUserApplications(userId: string): Promise<Application[]> {
    const path = 'applications';
    try {
      const q = query(collection(db, 'applications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => convertTimestamps(doc.data()) as unknown as Application);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribeToApplications(userId: string, callback: (apps: Application[]) => void) {
    const q = query(collection(db, 'applications'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => convertTimestamps(doc.data()) as unknown as Application);
      callback(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'applications');
    });
  },

  async updateStatus(appId: string, status: Application['status']): Promise<void> {
    const path = `applications/${appId}`;
    try {
      const docRef = doc(db, 'applications', appId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateApplication(appId: string, updates: Partial<Application>): Promise<void> {
    const path = `applications/${appId}`;
    try {
      const docRef = doc(db, 'applications', appId);
      const dataToUpdate = { ...updates } as Record<string, unknown>;
      delete dataToUpdate.id;
      delete dataToUpdate.appliedAt;
      delete dataToUpdate.updatedAt;

      await updateDoc(docRef, {
        ...dataToUpdate,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteApplication(appId: string): Promise<void> {
    const path = `applications/${appId}`;
    try {
      await deleteDoc(doc(db, 'applications', appId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};

// Notification Service
export const notificationService = {
  async createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const id = crypto.randomUUID();
    try {
      await setDoc(doc(db, 'notifications', id), {
        ...notif,
        id,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notifications/${id}`);
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        ...convertTimestamps(doc.data()),
        id: doc.id
      } as Notification));
      callback(notifs.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });
  },

  async markAsRead(notificationId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${notificationId}`);
    }
  }
};

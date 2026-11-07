'use client';

import { firebaseConfig as staticFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase with a dynamic or static configuration.
 * Handles re-initialization if the configuration changes (e.g., keys updated in Admin).
 */
export function initializeFirebase(config?: any) {
  const activeConfig = (config && config.apiKey) ? config : staticFirebaseConfig;

  // Check if config is valid (has apiKey, projectId, authDomain, etc.)
  if (!activeConfig || !activeConfig.apiKey || activeConfig.apiKey === '') {
    console.warn("Firebase config is missing or invalid. Skipping Firebase initialization.");
    return { firebaseApp: null as any, auth: null as any, firestore: null as any };
  }

  const existingApps = getApps();
  if (existingApps.length) {
    const currentApp = existingApps[0];
    
    // Check if we need to re-initialize because the API Key changed
    if (currentApp.options.apiKey !== activeConfig.apiKey) {
        try {
            deleteApp(currentApp).catch(console.error);
        } catch (e) {
            console.error("Failed to delete old Firebase app:", e);
        }
    } else {
        // Config is the same, reuse existing SDKs
        return getSdks(currentApp);
    }
  }

  let firebaseApp: FirebaseApp;
  try {
    firebaseApp = initializeApp(activeConfig);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    // If initialization fails, avoid getApp() which will throw, return nulls instead
    return { firebaseApp: null as any, auth: null as any, firestore: null as any };
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';

export interface AppConfig {
  appName: string;
  apiBaseUrl: string;
  features: {
    darkMode: boolean;
    notifications: boolean;
    chat: boolean;
    analytics: boolean;
  };
  maxResendAttempts: number;
  sessionTimeoutMinutes: number;
}

@Injectable({
  providedIn: 'root'
})

export class ConfigService {
  private configSubject = new AsyncSubject<AppConfig>();

  config$ = this.configSubject.asObservable();
  isLoaded = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    console.log('[ConfigService] Loading config from API...');

    setTimeout(() => {
      console.log('[ConfigService] Step 1: Got API URL...');
      this.configSubject.next({
        appName: 'Loading...',
        apiBaseUrl: 'https://api.example.com',
        features: { darkMode: false, notifications: false, chat: false, analytics: false },
        maxResendAttempts: 0,
        sessionTimeoutMinutes: 0
      });
    }, 500);

    setTimeout(() => {
      console.log('[ConfigService] Step 2: Got feature flags...');
      this.configSubject.next({
        appName: 'Still loading...',
        apiBaseUrl: 'https://api.example.com',
        features: { darkMode: true, notifications: true, chat: false, analytics: true },
        maxResendAttempts: 3,
        sessionTimeoutMinutes: 30
      });
    }, 1000);

    setTimeout(() => {
      console.log('[ConfigService] Step 3: Config fully loaded!');

      this.configSubject.next({
        appName: 'Notification & Theme Hub',
        apiBaseUrl: 'https://api.example.com/v2',
        features: { darkMode: true, notifications: true, chat: true, analytics: true },
        maxResendAttempts: 3,
        sessionTimeoutMinutes: 30
      });

      this.configSubject.complete();
      this.isLoaded = true;

      console.log('[ConfigService] ✅ complete() called — subscribers now receive the config!'), this.configSubject;
    }, 2000);
  }
}

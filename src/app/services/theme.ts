import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  name: Theme;
  backgroundColor: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  shadow: string;
}

@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  theme$ = this.themeSubject.asObservable();

  private themes: Record<Theme, ThemeConfig> = {
    light: {
      name: 'light',
      backgroundColor: '#f8fafc',
      cardBackground: '#ffffff',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      primary: '#4f46e5',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    dark: {
      name: 'dark',
      backgroundColor: '#0f172a',
      cardBackground: '#1e293b',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      primary: '#818cf8',
      shadow: '0 4px 6px -1px rgba(0,0,0,0.4)'
    }
  };

  toggleTheme(): void {
    const current = this.themeSubject.getValue();
    const newTheme: Theme = current === 'light' ? 'dark' : 'light';
    this.themeSubject.next(newTheme);
    console.log(`[ThemeService] Theme changed: ${current} → ${newTheme}`);
  }

  // --- Set a specific theme ---
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    console.log(`[ThemeService] Theme set to: ${theme}`);
  }

  getThemeConfig(theme: Theme): ThemeConfig {
    return this.themes[theme];
  }

  // --- Get current theme value (synchronous) ---
  get currentTheme(): Theme {
    return this.themeSubject.getValue();
  }

  // --- Check if dark mode ---
  get isDarkMode(): boolean {
    return this.themeSubject.getValue() === 'dark';
  }
}

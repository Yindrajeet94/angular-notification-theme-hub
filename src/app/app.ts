import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService, Theme, ThemeConfig } from './services/theme';

import { HeaderComponent } from './components/header/header';
import { ToastContainerComponent } from './components/toast-container/toast-container';
import { SubjectPlaygroundComponent } from './components/subject-playground/subject-playground';
import { NotificationHistoryComponent } from './components/notification-history/notification-history';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ToastContainerComponent,
    SubjectPlaygroundComponent,
    NotificationHistoryComponent
  ],
  templateUrl:'./app.html' ,
  styleUrl: './app.css' 
})
export class App implements OnInit, OnDestroy {

  themeConfig!: ThemeConfig;
  showHistory = false;
  private themeSub!: Subscription;

  constructor(private themeService: ThemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      this.themeConfig = this.themeService.getThemeConfig(theme);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.themeSub.unsubscribe();
  }
}

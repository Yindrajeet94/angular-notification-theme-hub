import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification';
import { ThemeService, Theme, ThemeConfig } from '../../services/theme';

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-history.html',
  styleUrl: './notification-history.css'
})
export class NotificationHistoryComponent implements OnInit, OnDestroy {

  notifications: Notification[] = [];
  themeConfig!: ThemeConfig;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ┌─────────────────────────────────────────────────────────────────┐
    // │ SUBSCRIBING TO A REPLAY SUBJECT                                │
    // │                                                                 │
    // │ history$ is backed by ReplaySubject(50).                       │
    // │ Even if 10 notifications were emitted BEFORE this component   │
    // │ loaded, we'll get all 10 immediately upon subscribing!        │
    // │                                                                 │
    // │ This is different from the Toast component:                    │
    // │ - Toast uses notifications$ (Subject) → only gets new ones   │
    // │ - History uses history$ (ReplaySubject) → gets past + new     │
    // │                                                                 │
    // │ Open console and watch: this component logs past notifications│
    // │ all at once, then logs new ones as they arrive.               │
    // └─────────────────────────────────────────────────────────────────┘
    const historySub = this.notificationService.history$.subscribe(
      (notification) => {
        console.log(`[History] Received (possibly replayed): "${notification.message}"`);
        this.notifications.push(notification);
        this.cdr.markForCheck();
      }
    );
    this.subscriptions.push(historySub);

    // Subscribe to theme
    const themeSub = this.themeService.theme$.subscribe(theme => {
      this.themeConfig = this.themeService.getThemeConfig(theme);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(themeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

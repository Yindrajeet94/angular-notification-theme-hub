// ============================================================
// TOAST CONTAINER COMPONENT
// ============================================================
// Listens to NotificationService's Subject and displays
// toast notifications that auto-dismiss after a few seconds.
//
// This demonstrates subscribing to a Subject — we only see
// notifications that arrive AFTER we subscribe.
// ============================================================

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification';
import { ThemeService, ThemeConfig } from '../../services/theme';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainerComponent implements OnInit, OnDestroy {

  activeToasts: Notification[] = [];
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // ┌─────────────────────────────────────────────────────────────────┐
    // │ SUBSCRIBING TO A SUBJECT                                       │
    // │                                                                 │
    // │ We subscribe to notifications$ (which is the Subject exposed   │
    // │ as an Observable via asObservable()).                           │
    // │                                                                 │
    // │ Because it's a plain Subject (not BehaviorSubject):            │
    // │ - We will NOT receive any past notifications                   │
    // │ - We ONLY get new notifications emitted AFTER this subscribe() │
    // │                                                                 │
    // │ This is PERFECT for toasts — we don't want old toasts from     │
    // │ before the component loaded. We only want live ones.           │
    // └─────────────────────────────────────────────────────────────────┘
    this.subscription = this.notificationService.notifications$.subscribe(
      (notification) => {
        console.log(`[Toast] Received: "${notification.message}"`);

        // Add to active toasts (shown on screen)
        this.activeToasts.push(notification);
        this.cdr.markForCheck();

        // Auto-dismiss after timeout
        if (notification.autoDismiss !== false) {
          setTimeout(() => {
            this.dismissToast(notification.id);
          }, notification.dismissAfterMs || 4000);
        }
      }
    );
  }

  dismissToast(id: string): void {
    this.activeToasts = this.activeToasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('[Toast] Subscription cleaned up');
  }
}

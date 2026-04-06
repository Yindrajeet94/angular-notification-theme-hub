// ============================================================
// NOTIFICATION SERVICE
// ============================================================
// REAL-WORLD SCENARIO:
// In Slack/Jira/Azure DevOps, when an action happens (API call
// succeeds, error occurs, someone mentions you), a toast
// notification pops up. The component that TRIGGERS the notification
// (e.g., an HTTP service) is DIFFERENT from the component that
// DISPLAYS it (the toast container in the header).
//
// They communicate through this service using SUBJECTS.
//
// CONCEPTS COVERED:
//   - Subject: A multicast Observable you can push values into
//   - ReplaySubject: Remembers the last N values for late subscribers
//   - asObservable(): Exposing a read-only stream (encapsulation)
//   - next(): Pushing values into the Subject
// ============================================================

import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';

// --- WHAT IS A NOTIFICATION? ---
// In C#, this would be a model class:
//   public class Notification {
//       public string Id { get; set; }
//       public string Message { get; set; }
//       public NotificationType Type { get; set; }
//       public DateTime Timestamp { get; set; }
//   }
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  autoDismiss?: boolean;      // Should it disappear after a few seconds?
  dismissAfterMs?: number;    // How long to show it (default 4000ms)
}

// @Injectable({ providedIn: 'root' })
// ──────────────────────────────────
// This makes the service a SINGLETON — one instance shared across
// the entire app. Every component that injects this service gets
// the SAME instance.
//
// .NET equivalent:
//   services.AddSingleton<NotificationService>();
//
// This is CRITICAL for our pattern to work — if each component
// got its own instance, they wouldn't share the same Subject,
// and notifications wouldn't flow between components.
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ SUBJECT                                                        │
  // │                                                                 │
  // │ A Subject is BOTH an Observable AND an Observer.                │
  // │ - As an Observable: components can subscribe() to it           │
  // │ - As an Observer: you can push values into it with next()      │
  // │                                                                 │
  // │ Think of it like an event in C#:                               │
  // │   public event EventHandler<Notification> OnNotification;      │
  // │   OnNotification?.Invoke(this, notification); // next()        │
  // │   OnNotification += handler;                  // subscribe()   │
  // │                                                                 │
  // │ KEY BEHAVIOR:                                                   │
  // │ - Late subscribers DON'T get past values                       │
  // │ - Only receives values emitted AFTER subscribing               │
  // │ - If nobody is subscribed, the value is LOST                   │
  // │                                                                 │
  // │ Timeline example:                                               │
  // │   Subject:    --A--B--C--D--E-->                                │
  // │   Sub1 (from start): A, B, C, D, E                             │
  // │   Sub2 (joins at C): C, D, E  ← missed A and B!               │
  // │                                                                 │
  // │ USE CASE: Live toast notifications — you only care about       │
  // │ notifications that happen while the toast component is visible.│
  // │ If the component wasn't mounted yet, those toasts are gone.    │
  // └─────────────────────────────────────────────────────────────────┘
  private notificationSubject = new Subject<Notification>();

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ REPLAY SUBJECT                                                  │
  // │                                                                 │
  // │ Like a Subject, BUT it remembers the last N values.            │
  // │ When a new subscriber joins, it REPLAYS those N values.        │
  // │                                                                 │
  // │ new ReplaySubject<T>(bufferSize)                                │
  // │   bufferSize = how many past values to remember                │
  // │                                                                 │
  // │ Timeline example (buffer = 3):                                  │
  // │   ReplaySubject: --A--B--C--D--E-->                             │
  // │   Sub1 (from start): A, B, C, D, E                             │
  // │   Sub2 (joins at E): C, D, E  ← got last 3 values!            │
  // │                                                                 │
  // │ USE CASE: Notification history panel — when the user opens      │
  // │ the history panel, they should see recent notifications they    │
  // │ might have missed. The ReplaySubject gives them the last 50.   │
  // │                                                                 │
  // │ Real examples:                                                  │
  // │ - Chat apps: Show last N messages when opening a chat          │
  // │ - Activity feed: Show recent activities on page load            │
  // │ - Audit log: New admin panel sees last N events                 │
  // └─────────────────────────────────────────────────────────────────┘
  private historySubject = new ReplaySubject<Notification>(50);
  // Remembers the last 50 notifications

  // --- NOTIFICATION COUNT ---
  // Tracks unread notification count (for badge on bell icon)
  private notificationCount = 0;
  private countSubject = new Subject<number>();

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ asObservable()                                                  │
  // │                                                                 │
  // │ Exposes the Subject as a READ-ONLY Observable.                 │
  // │ Components can subscribe() but CANNOT call next().             │
  // │                                                                 │
  // │ WHY? Encapsulation! Same reason you use:                       │
  // │   private set in C# properties                                 │
  // │   private readonly IList<T> _items;                            │
  // │   public IReadOnlyList<T> Items => _items;                     │
  // │                                                                 │
  // │ Without asObservable():                                        │
  // │   Any component could call notificationSubject.next("spam")    │
  // │   and inject fake notifications. Bad!                          │
  // │                                                                 │
  // │ With asObservable():                                           │
  // │   Components can only LISTEN, not PUSH. Only this service      │
  // │   can push notifications through the next() method.            │
  // │                                                                 │
  // │ 🔴 INTERVIEW TIP: Always expose Subjects as Observables.      │
  // │ This is a best practice interviewers love to hear.             │
  // └─────────────────────────────────────────────────────────────────┘

  // Public read-only streams that components subscribe to
  notifications$ = this.notificationSubject.asObservable();
  history$ = this.historySubject.asObservable();
  count$ = this.countSubject.asObservable();

  // The $ suffix is a naming convention in Angular:
  // variableName$ means "this is an Observable"
  // Like how in C# we prefix interfaces with I (INotificationService)


  // --- METHOD: Show a notification ---
  // This is called by ANY component or service in the app.
  // Example:
  //   this.notificationService.show('Employee saved!', 'success');
  //   this.notificationService.show('Server error', 'error');
  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    autoDismiss: boolean = true,
    dismissAfterMs: number = 4000
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      autoDismiss,
      dismissAfterMs
    };

    // ┌─────────────────────────────────────────────────────────────────┐
    // │ .next(value)                                                    │
    // │                                                                 │
    // │ Pushes a value into the Subject.                               │
    // │ ALL current subscribers immediately receive this value.         │
    // │                                                                 │
    // │ Think of it like:                                               │
    // │   C#: OnNotification?.Invoke(this, notification);              │
    // │   or: EventAggregator.Publish(notification);                   │
    // │                                                                 │
    // │ The notification flows to:                                      │
    // │   1. notificationSubject → toast-container shows it            │
    // │   2. historySubject → notification-history stores it           │
    // │   3. countSubject → header badge updates                       │
    // └─────────────────────────────────────────────────────────────────┘

    // Push to live notifications (Subject — toast pops up)
    this.notificationSubject.next(notification);

    // Push to history (ReplaySubject — remembered for late subscribers)
    this.historySubject.next(notification);

    // Update count
    this.notificationCount++;
    this.countSubject.next(this.notificationCount);

    console.log(`[NotificationService] Pushed: "${message}" (${type})`);
  }

  // --- Convenience methods ---
  // These make the API cleaner to use throughout the app
  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', false); // errors don't auto-dismiss
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  // --- Reset notification count (when user clicks bell icon) ---
  resetCount(): void {
    this.notificationCount = 0;
    this.countSubject.next(0);
  }

  // --- Generate unique ID ---
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

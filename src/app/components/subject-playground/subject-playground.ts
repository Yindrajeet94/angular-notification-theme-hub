import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs';
import { NotificationService } from '../../services/notification';
import { ThemeService, Theme, ThemeConfig } from '../../services/theme';
import { ConfigService, AppConfig } from '../../services/config';

interface SubjectLog {
  subscriberName: string;
  values: string[];
}

@Component({
  selector: 'app-subject-playground',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-playground.html',
  styleUrl: './subject-playground.css'
})

export class SubjectPlaygroundComponent implements OnInit, OnDestroy {

  currentTheme: Theme = 'light';
  themeConfig!: ThemeConfig;
  appConfig: AppConfig | null = null;
  comparisonResults: any[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const themeSub = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
      this.themeConfig = this.themeService.getThemeConfig(theme);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(themeSub);
    console.log(this.subscriptions);

    const configSub = this.configService.config$.subscribe(config => {
      this.appConfig = config;
      console.log('[Playground] Config received from AsyncSubject:', config.appName);
      this.notificationService.success('App configuration loaded!');
      this.cdr.markForCheck();
    });
    this.subscriptions.push(configSub);
    console.log(this.subscriptions);
  }

  // Trigger a notification
  notify(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.notificationService.show(message, type);
  }

  // Fire multiple notifications rapidly
  fireBurst(): void {
    const messages = [
      { msg: 'User logged in', type: 'info' as const },
      { msg: 'Profile updated', type: 'success' as const },
      { msg: 'Disk space low (90%)', type: 'warning' as const },
      { msg: 'Report generated', type: 'success' as const },
      { msg: 'API rate limit approaching', type: 'warning' as const },
    ];

    messages.forEach((m, i) => {
      setTimeout(() => this.notificationService.show(m.msg, m.type), i * 400);
    });
  }

  runComparison(): void {
    this.comparisonResults = [];

    const subject = new Subject<string>();
    const behaviorSubject = new BehaviorSubject<string>('initial');
    const replaySubject = new ReplaySubject<string>(2); // buffer = 2
    const asyncSubject = new AsyncSubject<string>();

    const earlySubject: string[] = [];
    const earlyBehavior: string[] = [];
    const earlyReplay: string[] = [];
    const earlyAsync: string[] = [];

    subject.subscribe(v => {
      console.log('value of v earlySubject ::: ' + v)
      earlySubject.push(v)
    });
    behaviorSubject.subscribe(v => {
      console.log('value of v earlyBehavior ::: ' + v)
      earlyBehavior.push(v)
    });
    replaySubject.subscribe(v => {
      console.log('value of v earlyReplay ::: ' + v)
      earlyReplay.push(v)
      console.log('============================================================')
    });
    asyncSubject.subscribe(v => {
      console.log('value of v earlyAsync ::: ' + v)
      earlyAsync.push(v)
      console.log('============================================================')
    });

    
    // --- Push values A and B ---
    subject.next('A');          behaviorSubject.next('A');
    replaySubject.next('A');    asyncSubject.next('A');

    subject.next('B');          behaviorSubject.next('B');
    replaySubject.next('B');    asyncSubject.next('B');

    // --- Late subscribers (subscribe AFTER A and B) ---
    const lateSubject: string[] = [];
    const lateBehavior: string[] = [];
    const lateReplay: string[] = [];
    const lateAsync: string[] = [];

    subject.subscribe(v => {
      console.log('value of v lateSubject ::: ' + v)
      lateSubject.push(v);
    });
    behaviorSubject.subscribe(v => {console.log('value of v lateBehavior ::: ' + v) 
      lateBehavior.push(v)}
    );
    replaySubject.subscribe(v => {console.log('value of v lateReplay ::: ' + v)
      lateReplay.push(v)
      console.log('============================================================')
    });
    asyncSubject.subscribe(v => {console.log('value of v lateAsync ::: ' + v)
      lateAsync.push(v)
    });

    // --- Push value C ---
    subject.next('C');          behaviorSubject.next('C');
    replaySubject.next('C');    asyncSubject.next('C');

    // --- Complete (triggers AsyncSubject) ---
    subject.complete();         behaviorSubject.complete();
    replaySubject.complete();   asyncSubject.complete();

    // --- Build results ---
    this.comparisonResults = [
      {
        type: 'Subject',
        description: 'No initial value. Late subscribers miss past values.',
        earlyValues: earlySubject,   // A, B, C
        lateValues: lateSubject      // C only
      },
      {
        type: 'BehaviorSubject',
        description: 'Has initial value. Late subscribers get current value.',
        earlyValues: earlyBehavior,  // initial, A, B, C
        lateValues: lateBehavior     // B (current at subscription), C
      },
      {
        type: 'ReplaySubject(2)',
        description: 'Replays last N values to late subscribers.',
        earlyValues: earlyReplay,    // A, B, C
        lateValues: lateReplay       // A, B (replayed), C
      },
      {
        type: 'AsyncSubject',
        description: 'Only emits the LAST value, only on complete().',
        earlyValues: earlyAsync,     // C (only after complete)
        lateValues: lateAsync        // C (only after complete)
      }
    ];

    this.notificationService.info('Comparison demo completed — check the results!');
    this.cdr.markForCheck();
  }

  getFeatures(): { name: string; enabled: boolean }[] {
    if (!this.appConfig) return [];
    return Object.entries(this.appConfig.features).map(([name, enabled]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      enabled
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

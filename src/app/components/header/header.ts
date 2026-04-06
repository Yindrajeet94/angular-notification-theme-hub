import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService, Theme, ThemeConfig } from '../../services/theme';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})

export class HeaderComponent implements OnInit, OnDestroy {

  currentTheme: Theme = 'light';
  themeConfig!: ThemeConfig;
  notificationCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const themeSub = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
      this.themeConfig = this.themeService.getThemeConfig(theme);
      console.log(`[Header] Theme received: ${theme}`);
      this.cdr.markForCheck();
    });
    this.subscriptions.push(themeSub);

    const countSub = this.notificationService.count$.subscribe(count => {
      this.notificationCount = count;
      this.cdr.markForCheck();
    });
    this.subscriptions.push(countSub);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  resetCount(): void {
    this.notificationService.resetCount();
  }

  ngOnDestroy(): void {
    // Clean up ALL subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('[Header] All subscriptions cleaned up');
  }
}

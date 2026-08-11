import { GreetingBannerComponent } from '@/app/components/greeting-banner/greeting-banner.component';
import { AchievementsPanelComponent } from '@/app/components/achievements-panel/achievements-panel.component';
import { StatsCardsComponent } from '@/app/components/stats-cards/stats-cards.component';
import { StreakCalendarComponent } from '@/app/components/streak-calendar/streak-calendar.component';
import { RecentLessonsComponent } from '@/app/components/recent-lessons/recent-lessons.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-home',
  imports: [
    GreetingBannerComponent,
    StatsCardsComponent,
    AchievementsPanelComponent,
    StreakCalendarComponent,
    RecentLessonsComponent,
  ],
  templateUrl: './user-home.html',
  styleUrl: './user-home.scss',
})
export class UserHomeComponent {}

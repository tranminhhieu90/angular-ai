import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { TuiDay, TuiMonth } from '@taiga-ui/cdk';

export interface CalendarDay {
  day: number | null; // null = empty filler cell
  date: TuiDay | null;
  hasStreak: boolean;
  isToday: boolean;
  isFuture: boolean;
}

@Component({
  selector: 'user-streak-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streak-calendar.component.html',
  styleUrl: './streak-calendar.component.scss',
})
export class StreakCalendarComponent implements OnInit {
  /** Mảng các ngày đã có streak, dạng TuiDay */
  @Input() streakDays: TuiDay[] = [];

  /** Tổng streak count để hiển thị trên header */
  @Input() streakCount = 0;

  readonly WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  readonly currentMonth = signal(TuiMonth.currentLocal());
  readonly today = TuiDay.currentLocal();

  readonly calendarDays = computed(() => this.buildCalendarDays(this.currentMonth()));

  readonly totalDaysInMonth = computed(() => this.currentMonth().daysCount);

  readonly streakInMonth = computed(() => {
    const m = this.currentMonth();
    return this.streakDays.filter((d) => d.month === m.month && d.year === m.year).length;
  });

  readonly progressPercent = computed(() => {
    const total = this.totalDaysInMonth();
    const passed = this.passedDays();
    return passed === 0 ? 0 : Math.round((this.streakInMonth() / passed) * 100);
  });

  readonly passedDays = computed(() => {
    const m = this.currentMonth();
    const isCurrentMonth = m.month === this.today.month && m.year === this.today.year;
    return isCurrentMonth ? this.today.day : m.daysCount;
  });

  readonly headerLabel = computed(() => {
    const m = this.currentMonth();
    return `Streak tháng ${m.month + 1}/${m.year}`;
  });

  readonly headerBadge = computed(() => `${this.streakInMonth()}/${this.totalDaysInMonth()} ngày`);

  ngOnInit() {
    // Default mock streak data nếu không có input
    if (this.streakDays.length === 0) {
      this.streakDays = this.buildMockStreakDays();
    }
  }

  prevMonth() {
    this.currentMonth.set(this.currentMonth().append({ month: -1 }));
  }

  nextMonth() {
    this.currentMonth.set(this.currentMonth().append({ month: 1 }));
  }

  isNextDisabled(): boolean {
    const m = this.currentMonth();
    return m.month === this.today.month && m.year === this.today.year;
  }

  private buildCalendarDays(month: TuiMonth): CalendarDay[] {
    const days: CalendarDay[] = [];
    const daysCount = month.daysCount;

    // Taiga TuiDay: day of week 0=Sun,1=Mon,...,6=Sat → convert to Mon-first (0=Mon,...,6=Sun)
    const firstDay = new TuiDay(month.year, month.month, 1);
    const rawDow = firstDay.dayOfWeek(); // 0=Mon in Taiga UI v4
    const offset = rawDow; // Monday-first, no conversion needed

    // Leading empty cells
    for (let i = 0; i < offset; i++) {
      days.push({ day: null, date: null, hasStreak: false, isToday: false, isFuture: false });
    }

    for (let d = 1; d <= daysCount; d++) {
      const tuiDay = new TuiDay(month.year, month.month, d);
      const isToday = tuiDay.daySame(this.today);
      const isFuture = tuiDay.dayAfter(this.today);
      const hasStreak = this.streakDays.some((s) => s.daySame(tuiDay));

      days.push({ day: d, date: tuiDay, hasStreak, isToday, isFuture });
    }

    return days;
  }

  private buildMockStreakDays(): TuiDay[] {
    const m = this.currentMonth();
    const streaked = [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 15, 16, 17, 18, 22, 23, 25];
    return streaked.filter((d) => d <= m.daysCount).map((d) => new TuiDay(m.year, m.month, d));
  }
}

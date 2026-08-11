import { selectCurrentUser } from '@/app/store/auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'user-greeting-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './greeting-banner.component.html',
  styleUrl: './greeting-banner.component.scss',
})
export class GreetingBannerComponent {
  private readonly store = inject(Store);
  readonly currentUser = this.store.selectSignal(selectCurrentUser);

  readonly displayName = computed(() => this.currentUser()?.name || 'Bạn');

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Chào buổi sáng!', emoji: '👋' };
    if (hour < 18) return { text: 'Chào buổi chiều!', emoji: '☀️' };
    return { text: 'Chào buổi tối!', emoji: '🌙' };
  });

  readonly streak = 22;
}

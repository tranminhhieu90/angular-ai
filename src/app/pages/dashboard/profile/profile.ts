import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '@/app/store/auth/auth.selectors';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    const displayName = user?.name.trim() || user?.email.trim() || '';

    return (
      displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || '?'
    );
  });
}

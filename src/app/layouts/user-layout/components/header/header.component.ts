import { selectCurrentUser } from '@/app/store/auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'user-dashboard-header',
  standalone: true,
  imports: [CommonModule, TuiIcon],
  templateUrl: './header.component.html',
})
export class UserHeaderComponent {
  private readonly store = inject(Store);
  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly userInitial = computed(
    () => this.currentUser()?.name.trim().charAt(0).toUpperCase() || '?',
  );
}

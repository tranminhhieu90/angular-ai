import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '@/app/store/auth/auth.selectors';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly store = inject(Store);

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleDesktopSidebar = new EventEmitter<void>();

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly userInitial = computed(
    () => this.currentUser()?.name.trim().charAt(0).toUpperCase() || '?',
  );
}

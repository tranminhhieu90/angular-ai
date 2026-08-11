import { Component, computed, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { SIDEBAR_MENU, SidebarItem } from './sidebar.config';
import { AuthService } from '@/app/core/api/auth.service';
import { Store } from '@ngrx/store';
import { authActions } from '@/app/store/auth/auth.actions';
import { selectCurrentUser } from '@/app/store/auth/auth.selectors';

@Component({
  selector: 'user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './sidebar.component.html',
})
export class UserSideBarComponent {
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  readonly menu: SidebarItem[] = SIDEBAR_MENU;
  readonly isLoggingOut = signal(false);
  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly displayName = computed(() => this.currentUser()?.name.trim() || 'N');
  readonly userInitial = computed(() => this.displayName().charAt(0).toUpperCase() || 'N');

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);
    this.store.dispatch(authActions.logoutSucceeded());
    this.authService.logout().subscribe({
      error: () => {
        this.isLoggingOut.set(false);
      },
    });
  }
}

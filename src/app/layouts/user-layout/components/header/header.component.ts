import { selectCurrentUser } from '@/app/store/auth/auth.selectors';
import { SIDEBAR_MENU } from '../sidebar/sidebar.config';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
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
  private readonly router = inject(Router);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly userInitial = computed(
    () => this.currentUser()?.name.trim().charAt(0).toUpperCase() || '?',
  );

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    // Tìm item khớp dài nhất (tránh '/user-dashboard' match '/user-dashboard/lessons')
    const matched = SIDEBAR_MENU.filter((item) => url.startsWith(item.link)).sort(
      (a, b) => b.link.length - a.link.length,
    )[0];
    return matched?.label ?? '';
  });
}

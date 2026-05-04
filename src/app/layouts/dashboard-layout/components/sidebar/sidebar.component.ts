import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { SIDEBAR_MENU, SidebarGroup } from './sidebar.config';
import { AuthService } from '@/app/core/api/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() close = new EventEmitter<void>();

  readonly menu: SidebarGroup[] = SIDEBAR_MENU;
  readonly isLoggingOut = signal(false);
  openGroups = new Set<string>(['Dashboard']); // mở sẵn Dashboard

  toggleGroup(label: string) {
    this.openGroups.has(label) ? this.openGroups.delete(label) : this.openGroups.add(label);
  }

  isGroupOpen(label: string) {
    return this.openGroups.has(label);
  }

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      error: () => {
        this.isLoggingOut.set(false);
      },
    });
  }
}

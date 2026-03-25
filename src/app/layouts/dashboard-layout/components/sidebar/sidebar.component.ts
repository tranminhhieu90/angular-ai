import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { SIDEBAR_MENU, SidebarGroup } from './sidebar.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TuiIcon],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() close = new EventEmitter<void>();

  readonly menu: SidebarGroup[] = SIDEBAR_MENU;
  openGroups = new Set<string>(['Dashboard']); // mở sẵn Dashboard

  toggleGroup(label: string) {
    this.openGroups.has(label) ? this.openGroups.delete(label) : this.openGroups.add(label);
  }

  isGroupOpen(label: string) {
    return this.openGroups.has(label);
  }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserSideBarComponent } from './components/sidebar/sidebar.component';
import { UserHeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-user-layout',
  // standalone: true,
  imports: [RouterOutlet, UserSideBarComponent, UserHeaderComponent],
  templateUrl: './user-layout.html',
})
export class UserLayoutComponent {
  isSidebarOpen = false;
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  closeSidebar() {
    this.isSidebarOpen = false;
  }
  toggleDesktopSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}

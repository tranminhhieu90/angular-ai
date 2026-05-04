import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { AuthService } from '@/app/core/api/auth.service';

/**
 * Directive để ẩn/hiện element dựa trên role của user
 *
 * Cách sử dụng:
 * <div *appHasRole="'admin'">Chỉ admin mới thấy</div>
 * <div *appHasRole="['admin', 'manager']">Admin hoặc Manager mới thấy</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private allowedRoles: string[] = [];

  @Input()
  set appHasRole(roles: string | string[]) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const currentUser = this.authService.currentUser();

    // Nếu không có user hoặc user không có role property, ẩn element
    if (!currentUser || !('role' in currentUser)) {
      this.viewContainer.clear();
      return;
    }

    const userRole = (currentUser as any).role;

    if (userRole && this.allowedRoles.includes(userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

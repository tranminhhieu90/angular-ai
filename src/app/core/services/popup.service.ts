import { Injectable, inject } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Observable, map } from 'rxjs';

import {
  AlertPopupData,
  ConfirmPopupComponent,
  ConfirmPopupData,
  PopupOpenConfig,
  PopupSize,
} from '@/app/shared/components/popup';

const POPUP_WIDTH_BY_SIZE: Record<PopupSize, string> = {
  sm: '360px',
  md: '480px',
  lg: '640px',
  xl: '860px',
  fullscreen: 'calc(100vw - 32px)',
};

@Injectable({ providedIn: 'root' })
export class PopupService {
  private readonly dialog = inject(Dialog);

  open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    config: PopupOpenConfig<D, R, C> = {},
  ): DialogRef<R, C> {
    const size = config.size ?? 'md';

    return this.dialog.open<R, D, C>(component, {
      ...config,
      width: config.width ?? POPUP_WIDTH_BY_SIZE[size],
      maxWidth: config.maxWidth ?? 'calc(100vw - 32px)',
      maxHeight: config.maxHeight ?? 'calc(100vh - 32px)',
      hasBackdrop: config.hasBackdrop ?? true,
      disableClose: config.disableClose ?? false,
      closeOnNavigation: config.closeOnNavigation ?? true,
      autoFocus: config.autoFocus ?? 'first-tabbable',
      restoreFocus: config.restoreFocus ?? true,
      panelClass: this.mergeClasses('app-popup-panel', `app-popup-panel--${size}`, config.panelClass),
      backdropClass: this.mergeClasses('app-popup-backdrop', config.backdropClass),
      data: config.data,
    });
  }

  confirm(
    data: ConfirmPopupData,
    config: PopupOpenConfig<ConfirmPopupData, boolean, ConfirmPopupComponent> = {},
  ): Observable<boolean> {
    const dialogRef = this.open<ConfirmPopupComponent, ConfirmPopupData, boolean>(ConfirmPopupComponent, {
      ...config,
      size: config.size ?? 'sm',
      role: config.role ?? 'alertdialog',
      data,
    });

    return dialogRef.closed.pipe(map(Boolean));
  }

  alert(
    data: AlertPopupData,
    config: PopupOpenConfig<ConfirmPopupData, boolean, ConfirmPopupComponent> = {},
  ): Observable<void> {
    const dialogRef = this.open<ConfirmPopupComponent, ConfirmPopupData, boolean>(ConfirmPopupComponent, {
      ...config,
      size: config.size ?? 'sm',
      role: config.role ?? 'alertdialog',
      data: {
        ...data,
        confirmText: data.closeText ?? data.confirmText ?? 'Đã hiểu',
        hideCancel: true,
      },
    });

    return dialogRef.closed.pipe(map(() => undefined));
  }

  closeAll(): void {
    this.dialog.closeAll();
  }

  private mergeClasses(...classes: Array<string | string[] | undefined>): string[] {
    return classes.flatMap((className) =>
      Array.isArray(className) ? className : className ? [className] : [],
    );
  }
}

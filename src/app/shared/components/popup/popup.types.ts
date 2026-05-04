import { DialogConfig, DialogRef } from '@angular/cdk/dialog';

export type PopupSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export type PopupVariant = 'default' | 'danger' | 'success' | 'warning' | 'info';

export interface PopupOpenConfig<D = unknown, R = unknown, C = unknown>
  extends Omit<DialogConfig<D, DialogRef<R, C>>, 'data' | 'panelClass' | 'backdropClass'> {
  data?: D;
  size?: PopupSize;
  panelClass?: string | string[];
  backdropClass?: string | string[];
}

export interface ConfirmPopupData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: PopupVariant;
  hideCancel?: boolean;
}

export interface AlertPopupData extends Omit<ConfirmPopupData, 'cancelText' | 'hideCancel'> {
  closeText?: string;
}

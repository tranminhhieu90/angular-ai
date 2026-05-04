import { NgClass, NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { ConfirmPopupData } from './popup.types';
import { PopupShellComponent } from './popup-shell.component';

@Component({
  selector: 'app-confirm-popup',
  imports: [NgClass, NgIf, PopupShellComponent],
  templateUrl: './confirm-popup.component.html',
  styleUrl: './confirm-popup.component.scss',
})
export class ConfirmPopupComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  readonly data = inject<ConfirmPopupData>(DIALOG_DATA);

  readonly variant = computed(() => this.data.variant ?? 'default');
  readonly confirmText = computed(() => this.data.confirmText ?? 'Xác nhận');
  readonly cancelText = computed(() => this.data.cancelText ?? 'Hủy');

  close(result = false): void {
    this.dialogRef.close(result);
  }
}

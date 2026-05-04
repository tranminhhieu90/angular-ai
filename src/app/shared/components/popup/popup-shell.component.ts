import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-popup-shell',
  imports: [NgIf],
  templateUrl: './popup-shell.component.html',
  styleUrl: './popup-shell.component.scss',
})
export class PopupShellComponent {
  private readonly dialogRef = inject(DialogRef, { optional: true });

  @Input() title = '';
  @Input() description?: string;
  @Input() showClose = true;

  @Output() readonly closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
    this.dialogRef?.close();
  }
}

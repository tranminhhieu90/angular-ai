import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TuiIcon } from '@taiga-ui/core';
import { LessonService } from '@/app/core/api/lesson.service';
import { ToastService } from '@/app/core/services/toast.service';
import { PopupShellComponent } from '@/app/shared/components/popup/popup-shell.component';

export interface DeleteLessonData {
  id: number;
  title: string;
}

@Component({
  selector: 'app-delete-lesson-dialog',
  imports: [TuiIcon, PopupShellComponent],
  templateUrl: './delete-lesson-dialog.html',
  styleUrl: './delete-lesson-dialog.scss',
})
export class DeleteLessonDialogComponent {
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly lessonService = inject(LessonService);
  private readonly toast = inject(ToastService);

  readonly data = inject<DeleteLessonData>(DIALOG_DATA);
  readonly isDeleting = signal(false);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.isDeleting()) return;

    this.isDeleting.set(true);
    this.lessonService.deleteLesson(this.data.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.toast.success('Đã xóa bài học thành công!');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isDeleting.set(false);
        const message = error?.error?.message || 'Xóa bài học thất bại. Vui lòng thử lại.';
        this.toast.error(message);
      },
    });
  }
}

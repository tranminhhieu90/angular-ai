import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TuiIcon } from '@taiga-ui/core';
import { PopupService } from '@/app/core/services/popup.service';
import {
  StudyLessonDialogComponent,
  StudyLessonDialogData,
} from '../study-lesson-dialog/study-lesson-dialog';
import {
  DeleteLessonDialogComponent,
  DeleteLessonData,
} from '../delete-lesson-dialog/delete-lesson-dialog';

export type LessonRow = StudyLessonDialogData & { id: number; title: string };

@Component({
  selector: 'app-lesson-actions-cell',
  imports: [TuiIcon],
  template: `
    <div class="lesson-actions-cell">
      <button
        type="button"
        class="action-btn action-btn--study"
        title="Học bài"
        (click)="openStudyPopup()"
      >
        <tui-icon icon="@tui.book-check" />
      </button>
      <button type="button" class="action-btn action-btn--edit" title="Chỉnh sửa">
        <tui-icon icon="@tui.pencil" />
      </button>
      <button
        type="button"
        class="action-btn action-btn--delete"
        title="Xóa"
        (click)="openDeleteDialog()"
      >
        <tui-icon icon="@tui.trash-2" />
      </button>
    </div>
  `,
  styles: [
    `
      .lesson-actions-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition:
          background 0.18s,
          color 0.18s,
          transform 0.15s;
        background: transparent;
        color: #4a9a5a;
        font-size: 16px;

        tui-icon {
          font-size: 16px;
        }

        &:hover {
          transform: scale(1.12);
        }

        &.action-btn--study:hover,
        &.action-btn--edit:hover {
          background: #e6f7ec;
          color: #2fa557;
        }

        &.action-btn--delete:hover {
          background: #fdecea;
          color: #d93025;
        }
      }
    `,
  ],
})
export class LessonActionsCellComponent implements ICellRendererAngularComp {
  private readonly popup = inject(PopupService);
  private lesson?: LessonRow;
  private gridContext?: { onLessonDeleted?: () => void };

  agInit(params: ICellRendererParams<LessonRow>): void {
    this.lesson = params.data;
    this.gridContext = params.context;
  }

  refresh(params: ICellRendererParams<LessonRow>): boolean {
    this.lesson = params.data;
    this.gridContext = params.context;
    return true;
  }

  openStudyPopup(): void {
    if (!this.lesson) return;

    this.popup.open<StudyLessonDialogComponent, StudyLessonDialogData>(StudyLessonDialogComponent, {
      size: 'fullscreen',
      data: this.lesson,
      height: 'calc(100vh - 32px)',
      autoFocus: false,
      panelClass: 'study-lesson-popup-panel',
    });
  }

  openDeleteDialog(): void {
    if (!this.lesson) return;

    const data: DeleteLessonData = { id: this.lesson.id, title: this.lesson.title };

    this.popup
      .open<DeleteLessonDialogComponent, DeleteLessonData, boolean>(DeleteLessonDialogComponent, {
        size: 'sm',
        data,
        disableClose: true,
      })
      .closed.subscribe((confirmed) => {
        if (confirmed) {
          this.gridContext?.onLessonDeleted?.();
        }
      });
  }
}

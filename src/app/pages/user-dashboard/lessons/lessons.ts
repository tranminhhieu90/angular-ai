import { AuthService } from '@/app/core/api/auth.service';
import { LessonDto, LessonService, LessonsResponse } from '@/app/core/api/lesson.service';
import { ToastService } from '@/app/core/services/toast.service';
import { Component, inject, Injector, OnInit, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { LessonActionsCellComponent } from './lesson-actions-cell/lesson-actions-cell';
import { AddLessonDialogComponent } from './add-lesson-dialog/add-lesson-dialog';

interface Lesson {
  id: number;
  topic: string;
  title: string;
  rawText: string;
  date: string;
  writing?: number;
  reading?: number;
}

@Component({
  selector: 'app-lessons',
  imports: [AgGridAngular, TuiIcon],
  templateUrl: './lessons.html',
  styleUrl: './lessons.scss',
})
export class LessonsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly lessonService = inject(LessonService);
  private readonly toast = inject(ToastService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly injector = inject(Injector);

  readonly rowData = signal<Lesson[]>([]);

  readonly columnDefs: ColDef<Lesson>[] = [
    {
      field: 'id',
      headerName: 'STT ',
      width: 74,
      cellRenderer: ({ value }: Cell) => `<span class="lesson-id">${value}</span>`,
    },
    {
      field: 'topic',
      headerName: 'TOPIC ',
      width: 150,
      cellRenderer: ({ value }: Cell) =>
        `<span class="topic topic--${String(value).toLowerCase()}">${value}</span>`,
    },
    {
      field: 'title',
      headerName: 'TIÊU ĐỀ ',
      flex: 1.8,
      minWidth: 320,
      cellRenderer: ({ data }: Cell) =>
        `<strong class="lesson-title">${data?.title}</strong><small class="lesson-date">${data?.date}</small>`,
    },
    {
      field: 'writing',
      headerName: 'ĐIỂM VIẾT',
      width: 150,
      cellRenderer: ({ value }: Cell) => this.score(value as number),
    },
    {
      field: 'reading',
      headerName: 'ĐIỂM ĐỌC',
      width: 150,
      cellRenderer: ({ value }: Cell) => this.score(value as number),
    },
    {
      headerName: 'THAO TÁC',
      width: 150,
      sortable: false,
      cellRenderer: LessonActionsCellComponent,
    },
  ];

  readonly gridOptions: GridOptions<Lesson> = {
    domLayout: 'autoHeight',
    rowHeight: 68,
    headerHeight: 56,
    suppressCellFocus: true,
    defaultColDef: { sortable: true, resizable: false },
    context: {
      onLessonDeleted: () => this.loadLessons(),
    },
  };

  ngOnInit(): void {
    this.loadLessons();
  }

  openAddDialog(): void {
    this.dialogs
      .open(new PolymorpheusComponent(AddLessonDialogComponent, this.injector), {
        size: 'l',
        dismissible: false,
      })
      .subscribe({
        complete: () => this.loadLessons(),
      });
  }

  loadLessons(title?: string, topic?: string): void {
    const userId = Number(this.authService.currentUser()?.id);

    if (!Number.isFinite(userId)) {
      this.toast.error('Không thể xác định người dùng hiện tại.');
      return;
    }

    this.lessonService
      .getLessons({
        userId,
        title: title?.trim() || undefined,
        topic: topic?.trim() || undefined,
      })
      .subscribe({
        next: (response: LessonsResponse) => {
          const lessons = response?.data ?? [];

          this.rowData.set(lessons.map((lesson) => this.mapLesson(lesson)));
        },
        error: (error) => {
          const message = error?.error?.message || 'Không thể tải danh sách bài học.';
          this.toast.error(message);
        },
      });
  }

  private mapLesson(lesson: LessonDto): Lesson {
    return {
      id: lesson.id,
      topic: lesson.topic,
      title: lesson.title,
      rawText: lesson.rawText ?? '',
      date: this.formatDate(lesson.createdAt ?? lesson.date),
      writing: lesson.writingScore ?? lesson.writing,
      reading: lesson.readingScore ?? lesson.reading,
    };
  }

  private formatDate(value?: string): string {
    if (!value) return '';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
  }

  private score(value?: number): string {
    return value
      ? `<span class="score score--${value >= 90 ? 'good' : 'ok'}">${value}</span>`
      : '<span class="score-empty">--</span>';
  }
}

type Cell = ICellRendererParams<Lesson>;

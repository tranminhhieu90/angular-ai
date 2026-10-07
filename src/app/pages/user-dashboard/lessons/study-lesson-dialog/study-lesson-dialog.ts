import { Component, inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

export interface StudyLessonDialogData {
  id: number;
  title: string;
  topic: string;
  rawText: string;
}

@Component({
  selector: 'app-study-lesson-dialog',
  templateUrl: './study-lesson-dialog.html',
  styleUrl: './study-lesson-dialog.scss',
})
export class StudyLessonDialogComponent {
  private readonly context = inject<TuiDialogContext<void, StudyLessonDialogData>>(
    POLYMORPHEUS_CONTEXT,
  );

  readonly lesson = this.context.data;
}

import { Component, computed, signal } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-create-lesson',
  imports: [TuiIcon],
  templateUrl: './create-lesson.html',
  styleUrl: './create-lesson.scss',
})
export class CreateLessonComponent {
  readonly passage = signal('');
  readonly wordCount = computed(() => this.passage().trim().split(/\s+/).filter(Boolean).length);
}

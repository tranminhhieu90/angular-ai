import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface RecentLesson {
  id: number;
  title: string;
  category: string;
  date: Date;
  writeScore: number | null;
  readScore: number | null;
}

@Component({
  selector: 'user-recent-lessons',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './recent-lessons.component.html',
  styleUrl: './recent-lessons.component.scss',
})
export class RecentLessonsComponent {
  @Input() lessons: RecentLesson[] = [
    {
      id: 1,
      title: 'Vietnamese Traditional Festivals',
      category: 'Culture',
      date: new Date('2025-08-11'),
      writeScore: 85,
      readScore: 90,
    },
    {
      id: 2,
      title: 'Remote Work in the Modern Era',
      category: 'Business',
      date: new Date('2025-08-10'),
      writeScore: null,
      readScore: null,
    },
    {
      id: 3,
      title: 'The Benefits of Regular Exercise',
      category: 'Health',
      date: new Date('2025-08-03'),
      writeScore: 93,
      readScore: 89,
    },
  ];

  @Output() viewAll = new EventEmitter<void>();
  @Output() lessonClick = new EventEmitter<RecentLesson>();

  onViewAll() {
    this.viewAll.emit();
  }

  onLessonClick(lesson: RecentLesson) {
    this.lessonClick.emit(lesson);
  }

  scoreColor(score: number): 'blue' | 'green' {
    return score >= 90 ? 'green' : 'blue';
  }
}

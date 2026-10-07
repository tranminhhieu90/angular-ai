import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiIcon } from '@taiga-ui/core';
import { AuthService } from '@/app/core/api/auth.service';
import { LessonService } from '@/app/core/api/lesson.service';
import { UserStatsService } from '@/app/core/api/user-stats.service';
import { ToastService } from '@/app/core/services/toast.service';

interface Topic {
  id: number | string;
  name: string;
}

@Component({
  selector: 'app-create-lesson',
  imports: [TuiIcon, ReactiveFormsModule],
  templateUrl: './create-lesson.html',
  styleUrl: './create-lesson.scss',
})
export class CreateLessonComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly lessonService = inject(LessonService);
  private readonly userStatsService = inject(UserStatsService);
  private readonly toast = inject(ToastService);

  readonly topics = signal<Topic[]>([]);
  readonly isLoadingTopics = signal(false);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    topicId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(5)]],
    passage: ['', [Validators.required, Validators.minLength(20)]],
  });

  readonly wordCount = computed(() => {
    const passage = this.form.controls.passage.value ?? '';
    return passage.trim().split(/\s+/).filter(Boolean).length;
  });

  ngOnInit(): void {
    this.loadTopics();
  }

  private loadTopics(): void {
    this.isLoadingTopics.set(true);
    this.userStatsService.getTopic().subscribe({
      next: (data: any) => {
        // API có thể trả về mảng trực tiếp hoặc { data: [...] }
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        this.topics.set(list);
        this.isLoadingTopics.set(false);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách topic:', err);
        this.isLoadingTopics.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();
    const topic = this.topics().find((item) => String(item.id) === String(formValue.topicId));

    if (!topic) {
      this.isSubmitting.set(false);
      this.toast.error('Không thể xác định chủ đề đã chọn.');
      return;
    }

    this.lessonService
      .createLesson({
        title: formValue.title.trim(),
        topic: topic.name,
        rawText: formValue.passage.trim(),
        language: 'en',
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.form.reset();
          this.toast.success('Tạo bài học thành công!');
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const message = error?.error?.message || 'Tạo bài học thất bại. Vui lòng thử lại.';
          this.toast.error(message);
        },
      });
  }
}

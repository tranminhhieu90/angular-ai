import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { LessonDto, LessonLineDto, LessonService } from '@/app/core/api/lesson.service';
import { ToastService } from '@/app/core/services/toast.service';

export interface StudyLessonDialogData {
  id: number;
}

@Component({
  selector: 'app-study-lesson-dialog',
  imports: [TuiIcon, FormsModule],
  templateUrl: './study-lesson-dialog.html',
  styleUrl: './study-lesson-dialog.scss',
})
export class StudyLessonDialogComponent implements OnInit {
  private readonly lessonService = inject(LessonService);
  private readonly toast = inject(ToastService);
  private readonly context =
    inject<TuiDialogContext<void, StudyLessonDialogData>>(POLYMORPHEUS_CONTEXT);

  readonly lessonId = this.context.data.id;

  // ── Header
  lessonIndex = 1;
  lessonTitle = '';
  topicName = '';
  totalSentences = 1;

  // ── Tabs
  activeTab: 'dictation' | 'transcript' = 'dictation';

  // ── Dictation state
  currentSentence = 1;
  isRepeat = true;
  isPlaying = false;
  isMuted = false;
  progressPercent = 0;
  playbackSpeed = 1;

  // ── Input
  userInput = '';
  answerStatus: 'correct' | 'wrong' | null = null;

  // ── Translation
  vietnameseTranslation = '';
  sentenceWords: string[] = [];

  // ── Comments
  commentCount = 106;

  // ── Transcript
  autoScroll = true;
  lessonLines: LessonLineDto[] = [];

  get currentLessonLine(): LessonLineDto | undefined {
    return this.lessonLines[this.currentSentence - 1];
  }

  ngOnInit(): void {
    this.loadLessonDetail(this.lessonId);
  }

  loadLessonDetail(lessonId: number): void {
    this.lessonService.getLessonDetail(lessonId).subscribe({
      next: (response) => {
        const lesson: LessonDto = 'data' in response ? response.data : response;
        if (lesson) {
          this.lessonTitle = lesson.title ?? this.lessonTitle;
          this.topicName = lesson.topic ?? this.topicName;
          if (lesson.lessonLines?.length) {
            this.lessonLines = [...lesson.lessonLines].sort(
              (first, second) => first.lineIndex - second.lineIndex,
            );
            this.totalSentences = this.lessonLines.length;
            this.currentSentence = 1;
            this.updateSentenceWords();
            this.updateTranslation();
          }
        }
      },
      error: (error) => {
        const message = error?.error?.message || 'Không thể tải bài học.';
        this.toast.error(message);
      },
    });
  }

  // ── Actions
  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  resetInput(): void {
    this.userInput = '';
    this.answerStatus = null;
  }

  checkAnswer(): void {
    if (!this.userInput.trim()) return;
    const current = this.currentLessonLine;
    if (!current) return;

    const normalize = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[.!?,]/g, '');
    this.answerStatus =
      normalize(this.userInput) === normalize(current.content) ? 'correct' : 'wrong';
  }

  retryAnswer(): void {
    this.userInput = '';
    this.answerStatus = null;
  }

  goNext(): void {
    if (this.currentSentence < this.totalSentences) {
      this.currentSentence++;
      this.resetInput();
      this.updateSentenceWords();
      this.updateTranslation();
    }
  }

  goPrevious(): void {
    if (this.currentSentence > 1) {
      this.currentSentence--;
      this.resetInput();
      this.updateSentenceWords();
      this.updateTranslation();
    }
  }

  jumpToSentence(index: number): void {
    this.currentSentence = index;
    this.resetInput();
    this.updateSentenceWords();
    this.updateTranslation();
  }

  lookupWord(word: string): void {
    this.toast.info(`Tra từ: "${word}"`);
  }

  // ── Helpers
  private updateSentenceWords(): void {
    const line = this.currentLessonLine;
    this.sentenceWords = line
      ? line.content
          .replace(/[.!?,]/g, '')
          .split(/\s+/)
          .filter(Boolean)
      : [];
  }

  private updateTranslation(): void {
    this.vietnameseTranslation = '';
  }
}

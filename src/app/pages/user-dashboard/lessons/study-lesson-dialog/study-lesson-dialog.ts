import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
export class StudyLessonDialogComponent implements OnInit, OnDestroy {
  private readonly lessonService = inject(LessonService);
  private readonly toast = inject(ToastService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly context =
    inject<TuiDialogContext<void, StudyLessonDialogData>>(POLYMORPHEUS_CONTEXT);

  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private playbackMode: 'sentence' | 'transcript' | null = null;
  private playbackToken = 0;
  private currentCharacterOffset = 0;
  private progressTimer: number | null = null;
  private repeatTimer: number | null = null;
  private hasShownSpeechError = false;
  private readonly handleVoicesChanged = (): void => {
    this.voices = this.speechSynthesis?.getVoices() ?? [];
  };

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

  get isTranscriptPlaying(): boolean {
    return this.playbackMode === 'transcript' && this.isPlaying;
  }

  ngOnInit(): void {
    this.initializeSpeechSynthesis();
    this.loadLessonDetail(this.lessonId);
  }

  ngOnDestroy(): void {
    this.stopSpeech();
    this.speechSynthesis?.removeEventListener('voiceschanged', this.handleVoicesChanged);
  }

  @HostListener('document:keydown.space', ['$event'])
  handleSpacebar(event: Event): void {
    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName.toLowerCase();

    if (
      target?.isContentEditable ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      tagName === 'button' ||
      tagName === 'a'
    ) {
      return;
    }

    event.preventDefault();
    if (this.activeTab === 'transcript') {
      this.toggleTranscriptPlayback();
    } else {
      this.togglePlay();
    }
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
            this.stopSpeech();
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
  setActiveTab(tab: 'dictation' | 'transcript'): void {
    if (tab === this.activeTab) return;

    this.stopSpeech();
    this.activeTab = tab;
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.pauseSpeech();
      return;
    }

    const content = this.currentLessonLine?.content.trim();
    if (!content) return;

    if (!this.speechSynthesis) {
      this.showSpeechUnavailableError();
      return;
    }

    if (this.currentUtterance && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
      this.isPlaying = true;
      this.startProgressTimer(
        content,
        this.currentCharacterOffset,
        content.slice(this.currentCharacterOffset),
      );
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.playbackMode = 'sentence';
    const resumeOffset = this.progressPercent >= 99 ? 0 : this.currentCharacterOffset;
    this.speak(content, resumeOffset);
  }

  toggleTranscriptPlayback(): void {
    if (this.playbackMode === 'transcript') {
      this.finishTranscriptPlayback();
      return;
    }

    if (!this.speechSynthesis) {
      this.showSpeechUnavailableError();
      return;
    }

    if (!this.lessonLines.length) return;

    this.stopSpeech();
    this.playbackMode = 'transcript';
    this.selectSentence(1);

    const content = this.currentLessonLine?.content.trim();
    if (content) {
      this.speak(content);
    } else {
      this.playNextTranscriptSentence(this.playbackToken);
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;

    const content = this.currentLessonLine?.content.trim();
    if (!content || !this.currentUtterance) return;

    const wasPlaying = this.isPlaying;
    const resumeOffset = this.findWordStart(content, this.currentCharacterOffset);
    this.cancelCurrentUtterance(true);
    this.currentCharacterOffset = resumeOffset;
    this.isPlaying = false;

    if (wasPlaying) {
      this.speak(content, resumeOffset);
    }
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
      this.stopSpeech();
      this.currentSentence++;
      this.resetInput();
      this.updateSentenceWords();
      this.updateTranslation();
    }
  }

  goPrevious(): void {
    if (this.currentSentence > 1) {
      this.stopSpeech();
      this.currentSentence--;
      this.resetInput();
      this.updateSentenceWords();
      this.updateTranslation();
    }
  }

  jumpToSentence(index: number): void {
    this.stopSpeech();
    this.currentSentence = index;
    this.resetInput();
    this.updateSentenceWords();
    this.updateTranslation();
  }

  lookupWord(word: string): void {
    this.toast.info(`Tra từ: "${word}"`);
  }

  // ── Helpers
  private initializeSpeechSynthesis(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.speechSynthesis = window.speechSynthesis;
    this.handleVoicesChanged();
    this.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
  }

  private speak(content: string, startOffset = 0): void {
    const speechSynthesis = this.speechSynthesis;
    if (!speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      this.showSpeechUnavailableError();
      return;
    }

    this.cancelCurrentUtterance(true);

    const safeOffset = Math.min(Math.max(startOffset, 0), content.length - 1);
    const textToSpeak = content.slice(safeOffset);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const token = ++this.playbackToken;

    this.currentCharacterOffset = safeOffset;

    utterance.lang = 'en-US';
    utterance.rate = this.playbackSpeed;
    utterance.pitch = 1;
    utterance.volume = this.isMuted ? 0 : 1;
    utterance.voice = this.selectEnglishVoice();

    utterance.onstart = () => {
      if (token !== this.playbackToken) return;
      this.isPlaying = true;
      this.startProgressTimer(content, safeOffset, textToSpeak);
      this.changeDetectorRef.markForCheck();
    };

    utterance.onboundary = (event) => {
      if (token !== this.playbackToken) return;
      this.currentCharacterOffset = safeOffset + event.charIndex;
      this.progressPercent = Math.min(
        99,
        Math.max(
          this.progressPercent,
          (this.currentCharacterOffset / content.length) * 100,
        ),
      );
      this.changeDetectorRef.markForCheck();
    };

    utterance.onend = () => {
      if (token !== this.playbackToken) return;

      this.clearProgressTimer();
      this.currentUtterance = null;
      this.currentCharacterOffset = content.length;
      this.progressPercent = 100;

      if (this.playbackMode === 'transcript') {
        if (this.currentSentence < this.totalSentences) {
          this.repeatTimer = window.setTimeout(() => {
            this.playNextTranscriptSentence(token);
          }, 250);
        } else {
          this.finishTranscriptPlayback();
        }
      } else if (this.isRepeat && this.isPlaying) {
        this.repeatTimer = window.setTimeout(() => {
          if (token !== this.playbackToken || !this.isPlaying) return;
          this.progressPercent = 0;
          this.speak(content);
        }, 300);
      } else {
        this.isPlaying = false;
      }

      this.changeDetectorRef.markForCheck();
    };

    utterance.onerror = (event) => {
      if (token !== this.playbackToken || event.error === 'canceled') return;
      this.clearProgressTimer();
      this.currentUtterance = null;
      this.isPlaying = false;
      this.playbackMode = null;
      this.toast.error('Không thể phát giọng đọc trên trình duyệt này.');
      this.changeDetectorRef.markForCheck();
    };

    this.currentUtterance = utterance;
    this.isPlaying = true;
    speechSynthesis.speak(utterance);
    this.changeDetectorRef.markForCheck();
  }

  private pauseSpeech(): void {
    this.speechSynthesis?.pause();
    this.clearProgressTimer();
    this.isPlaying = false;
    this.changeDetectorRef.markForCheck();
  }

  private stopSpeech(): void {
    this.cancelCurrentUtterance(false);
    this.playbackMode = null;
    this.isPlaying = false;
    this.currentCharacterOffset = 0;
    this.progressPercent = 0;
    this.changeDetectorRef.markForCheck();
  }

  private cancelCurrentUtterance(preserveProgress: boolean): void {
    this.playbackToken++;
    this.clearProgressTimer();

    if (this.repeatTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.repeatTimer);
      this.repeatTimer = null;
    }

    this.speechSynthesis?.cancel();
    this.speechSynthesis?.resume();
    this.currentUtterance = null;

    if (!preserveProgress) this.progressPercent = 0;
  }

  private playNextTranscriptSentence(previousToken: number): void {
    if (this.playbackMode !== 'transcript' || previousToken !== this.playbackToken) return;

    for (let index = this.currentSentence + 1; index <= this.totalSentences; index++) {
      const content = this.lessonLines[index - 1]?.content.trim();
      if (!content) continue;

      this.selectSentence(index);
      this.progressPercent = 0;
      this.currentCharacterOffset = 0;
      this.speak(content);
      return;
    }

    this.finishTranscriptPlayback();
  }

  private finishTranscriptPlayback(): void {
    this.stopSpeech();
    this.selectSentence(1);
  }

  private selectSentence(index: number): void {
    this.currentSentence = index;
    this.resetInput();
    this.updateSentenceWords();
    this.updateTranslation();

    if (this.autoScroll && this.playbackMode === 'transcript' && typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        this.elementRef.nativeElement
          .querySelector<HTMLElement>(`[data-transcript-index="${index}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  private startProgressTimer(content: string, startOffset: number, textToSpeak: string): void {
    if (typeof window === 'undefined') return;

    this.clearProgressTimer();
    const startedAt = performance.now();
    const wordCount = textToSpeak.split(/\s+/).filter(Boolean).length;
    const estimatedDuration = Math.max(900, (wordCount / (2.7 * this.playbackSpeed)) * 1000);

    this.progressTimer = window.setInterval(() => {
      const elapsedRatio = Math.min((performance.now() - startedAt) / estimatedDuration, 0.98);
      const estimatedCharacter = startOffset + textToSpeak.length * elapsedRatio;
      const estimatedProgress = (estimatedCharacter / content.length) * 100;
      this.progressPercent = Math.max(this.progressPercent, Math.min(98, estimatedProgress));
      this.changeDetectorRef.markForCheck();
    }, 100);
  }

  private clearProgressTimer(): void {
    if (this.progressTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private findWordStart(content: string, characterOffset: number): number {
    const previousSpace = content.lastIndexOf(' ', characterOffset);
    return previousSpace < 0 ? 0 : previousSpace + 1;
  }

  private selectEnglishVoice(): SpeechSynthesisVoice | null {
    const englishVoices = this.voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));

    return (
      englishVoices.find((voice) => /google us english/i.test(voice.name)) ??
      englishVoices.find(
        (voice) => voice.lang.toLowerCase() === 'en-us' && /google|natural/i.test(voice.name),
      ) ??
      englishVoices.find((voice) => voice.lang.toLowerCase() === 'en-us') ??
      englishVoices.find((voice) => /google|natural/i.test(voice.name)) ??
      englishVoices[0] ??
      null
    );
  }

  private showSpeechUnavailableError(): void {
    if (this.hasShownSpeechError) return;
    this.hasShownSpeechError = true;
    this.toast.error('Trình duyệt không hỗ trợ đọc văn bản bằng giọng nói.');
  }

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

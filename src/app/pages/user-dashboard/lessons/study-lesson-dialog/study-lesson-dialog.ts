import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

export interface StudyLessonDialogData {
  id: number;
  title: string;
  topic: string;
  rawText: string;
}

@Component({
  selector: 'app-study-lesson-dialog',
  imports: [TuiIcon],
  templateUrl: './study-lesson-dialog.html',
  styleUrl: './study-lesson-dialog.scss',
})
export class StudyLessonDialogComponent implements AfterViewInit, OnDestroy {
  private readonly dialogRef = inject(DialogRef);
  readonly lesson = inject<StudyLessonDialogData>(DIALOG_DATA);

  @ViewChild('readingViewport') private readingViewport?: ElementRef<HTMLElement>;

  readonly speed = signal(45);
  readonly fontSize = signal(36);
  readonly isPlaying = signal(false);
  readonly isMirrored = signal(false);

  private animationFrameId?: number;
  private previousTimestamp?: number;

  ngAfterViewInit(): void {
    this.resetReadingPosition();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const target = event.target;
    const isFormControl = target instanceof HTMLInputElement || target instanceof HTMLButtonElement;

    if (event.code === 'Space' && !isFormControl) {
      event.preventDefault();
      this.togglePlayback();
    }

    if (event.key === 'Escape') this.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  togglePlayback(): void {
    if (this.isPlaying()) {
      this.pause();
      return;
    }

    this.isPlaying.set(true);
    this.previousTimestamp = undefined;
    this.animationFrameId = requestAnimationFrame((timestamp) => this.scroll(timestamp));
  }

  toggleMirror(): void {
    this.isMirrored.update((value) => !value);
  }

  restart(): void {
    this.pause();
    this.resetReadingPosition();
  }

  updateSpeed(event: Event): void {
    this.speed.set(Number((event.target as HTMLInputElement).value));
  }

  updateFontSize(event: Event): void {
    this.fontSize.set(Number((event.target as HTMLInputElement).value));
  }

  private pause(): void {
    this.isPlaying.set(false);
    this.stopAnimation();
  }

  private scroll(timestamp: number): void {
    const viewport = this.readingViewport?.nativeElement;
    if (!viewport || !this.isPlaying()) return;

    if (this.previousTimestamp !== undefined) {
      const elapsedSeconds = (timestamp - this.previousTimestamp) / 1000;
      viewport.scrollTop += elapsedSeconds * this.speed();

      const reachedEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;
      if (reachedEnd) {
        this.pause();
        return;
      }
    }

    this.previousTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame((nextTimestamp) => this.scroll(nextTimestamp));
  }

  private resetReadingPosition(): void {
    this.readingViewport?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    this.previousTimestamp = undefined;
  }
}

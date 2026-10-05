import { UnitDto, UnitService, UnitsResponse } from '@/app/core/api/unit.service';
import { VideoDto, VideoService, VideosResponse } from '@/app/core/api/video.service';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grape-seed',
  imports: [CommonModule],
  templateUrl: './grape-seed.component.html',
  styleUrl: './grape-seed.component.scss',
})
export class GrapeSeedComponent implements OnInit, OnDestroy {
  private readonly unitService = inject(UnitService);
  private readonly videoService = inject(VideoService);
  private videoRequest?: Subscription;

  readonly units = signal<UnitDto[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedUnit = signal<UnitDto | null>(null);
  readonly videos = signal<VideoDto[]>([]);
  readonly isLoadingVideos = signal(false);
  readonly videoError = signal<string | null>(null);
  readonly activeVideo = signal<VideoDto | null>(null);

  ngOnInit(): void {
    this.unitService.getUnits().subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : ((response as UnitsResponse).data ?? []);
        this.units.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Không thể tải danh sách units.');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.videoRequest?.unsubscribe();
    this.restorePageScroll();
  }

  @HostListener('document:keydown.escape')
  closeVideo(): void {
    if (!this.activeVideo()) return;

    this.activeVideo.set(null);
    this.restorePageScroll();
  }

  selectUnit(unit: UnitDto): void {
    this.videoRequest?.unsubscribe();
    this.selectedUnit.set(unit);
    this.videos.set([]);
    this.videoError.set(null);
    this.isLoadingVideos.set(true);

    this.videoRequest = this.videoService.getVideosByUnit(unit.id).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : ((response as VideosResponse).data ?? []);
        this.videos.set(data);
        this.isLoadingVideos.set(false);
      },
      error: (err) => {
        this.videoError.set(err?.message ?? 'Không thể tải danh sách video.');
        this.isLoadingVideos.set(false);
      },
    });
  }

  openVideo(video: VideoDto): void {
    this.activeVideo.set(video);
    document.body.style.overflow = 'hidden';
  }

  formatDuration(duration?: number | null): string {
    if (!duration) return '';

    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private restorePageScroll(): void {
    document.body.style.removeProperty('overflow');
  }
}

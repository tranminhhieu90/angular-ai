import { UnitDto, UnitService, UnitsResponse } from '@/app/core/api/unit.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-grape-seed',
  imports: [CommonModule],
  templateUrl: './grape-seed.component.html',
  styleUrl: './grape-seed.component.scss',
})
export class GrapeSeedComponent implements OnInit {
  private readonly unitService = inject(UnitService);

  readonly units = signal<UnitDto[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

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
}

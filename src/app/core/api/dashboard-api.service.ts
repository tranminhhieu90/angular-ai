import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { DASHBOARD_API_BASE_URL } from './api.config';

export interface DashboardStatsDto {
  customers: number;
  orders: number;
  revenue: number;
  monthlyGrowthPercent: number;
}

export interface RecentOrderDto {
  id: string;
  productName: string;
  category: string;
  price: number;
  status: 'pending' | 'delivered' | 'cancelled';
}

export interface DashboardOverviewDto {
  stats: DashboardStatsDto;
  recentOrders: RecentOrderDto[];
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService extends BaseApiService {
  protected readonly apiBaseUrl = inject(DASHBOARD_API_BASE_URL);

  getOverview(): Observable<DashboardOverviewDto> {
    return this.get<DashboardOverviewDto>('dashboard/overview');
  }
}

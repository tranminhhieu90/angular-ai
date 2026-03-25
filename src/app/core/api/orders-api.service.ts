import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, QueryParams } from './base-api.service';
import { ORDERS_API_BASE_URL } from './api.config';

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

export interface OrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  id: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemDto[];
}

@Injectable({ providedIn: 'root' })
export class OrdersApiService extends BaseApiService {
  protected readonly apiBaseUrl = inject(ORDERS_API_BASE_URL);

  getOrders(params?: QueryParams): Observable<OrderDto[]> {
    return this.get<OrderDto[]>('orders', { params });
  }

  getOrderById(orderId: string): Observable<OrderDto> {
    return this.get<OrderDto>(`orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<OrderDto> {
    return this.patch<OrderDto, { status: OrderStatus }>(`orders/${orderId}/status`, { status });
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, QueryParams } from './base-api.service';
import { PRODUCTS_API_BASE_URL } from './api.config';

export interface ProductDto {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
}

export interface CreateProductRequest {
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService extends BaseApiService {
  protected readonly apiBaseUrl = inject(PRODUCTS_API_BASE_URL);

  getProducts(params?: QueryParams): Observable<ProductDto[]> {
    return this.get<ProductDto[]>('products', { params });
  }

  getProductById(productId: string): Observable<ProductDto> {
    return this.get<ProductDto>(`products/${productId}`);
  }

  createProduct(payload: CreateProductRequest): Observable<ProductDto> {
    return this.post<ProductDto, CreateProductRequest>('products', payload);
  }

  updateProduct(productId: string, payload: Partial<CreateProductRequest>): Observable<ProductDto> {
    return this.patch<ProductDto, Partial<CreateProductRequest>>(`products/${productId}`, payload);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.delete<void>(`products/${productId}`);
  }
}

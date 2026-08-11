// src/app/layouts/user-layout/components/header/header.service.ts
import { Injectable, signal } from '@angular/core';

export interface HeaderInfo {
  icon: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class HeaderService {
  readonly headerInfo = signal<HeaderInfo>({
    icon: '@tui.house',
    label: 'Dashboard',
  });

  set(info: HeaderInfo): void {
    this.headerInfo.set(info);
  }
}

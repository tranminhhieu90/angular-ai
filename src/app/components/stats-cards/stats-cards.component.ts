import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface StatCard {
  icon: string;
  label: string;
  value: string | number;
  subtext: string;
  iconBg?: string;
}

@Component({
  selector: 'user-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrl: './stats-cards.component.scss',
})
export class StatsCardsComponent {
  @Input() cards: StatCard[] = [
    {
      icon: '🔥',
      label: 'STREAK',
      value: '22 ngày',
      subtext: 'Kỷ lục: 35 ngày',
      iconBg: '#fff3e0',
    },
    {
      icon: '📚',
      label: 'BÀI ĐÃ TẠO',
      value: 5,
      subtext: '4 hoàn thành',
      iconBg: '#e8f5e9',
    },
    {
      icon: '✍️',
      label: 'TB VIẾT',
      value: 86,
      subtext: 'Điểm trung bình',
      iconBg: '#e3f2fd',
    },
    {
      icon: '📖',
      label: 'TB ĐỌC',
      value: 88,
      subtext: 'Điểm trung bình',
      iconBg: '#f3e5f5',
    },
  ];
}

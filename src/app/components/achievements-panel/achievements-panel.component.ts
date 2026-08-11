import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Achievement {
  icon: string;
  label: string;
  value: string;
  bgColor: string;
  borderColor: string;
}

@Component({
  selector: 'user-achievements-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements-panel.component.html',
  styleUrl: './achievements-panel.component.scss',
})
export class AchievementsPanelComponent {
  @Input() achievements: Achievement[] = [
    {
      icon: '🏆',
      label: 'Streak dài nhất',
      value: '35 ngày',
      bgColor: '#fffde7',
      borderColor: '#fff176',
    },
    {
      icon: '📅',
      label: 'Tổng ngày học',
      value: '147 ngày',
      bgColor: '#f1f8e9',
      borderColor: '#c5e1a5',
    },
    {
      icon: '⭐',
      label: 'Điểm cao nhất',
      value: '93 điểm',
      bgColor: '#e3f2fd',
      borderColor: '#90caf9',
    },
    {
      icon: '🎯',
      label: 'Tỷ lệ hoàn thành',
      value: '80%',
      bgColor: '#fce4ec',
      borderColor: '#f48fb1',
    },
  ];
}

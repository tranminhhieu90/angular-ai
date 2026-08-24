import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { TuiIcon } from '@taiga-ui/core';

interface Lesson {
  id: number;
  topic: string;
  title: string;
  date: string;
  writing?: number;
  reading?: number;
}

@Component({
  selector: 'app-lessons',
  imports: [AgGridAngular, TuiIcon],
  templateUrl: './lessons.html',
  styleUrl: './lessons.scss',
})
export class LessonsComponent {
  readonly rowData: Lesson[] = [
    {
      id: 1,
      topic: 'Technology',
      title: 'The Rise of Artificial Intelligence',
      date: '28/07/2025',
      writing: 88,
      reading: 91,
    },
    {
      id: 2,
      topic: 'Environment',
      title: 'Climate Change and Its Effects',
      date: '01/08/2025',
      writing: 76,
      reading: 82,
    },
    {
      id: 3,
      topic: 'Health',
      title: 'The Benefits of Regular Exercise',
      date: '03/08/2025',
      writing: 93,
      reading: 89,
    },
    { id: 4, topic: 'Business', title: 'Remote Work in the Modern Era', date: '10/08/2025' },
    {
      id: 5,
      topic: 'Culture',
      title: 'Vietnamese Traditional Festivals',
      date: '11/08/2025',
      writing: 85,
      reading: 90,
    },
  ];

  readonly columnDefs: ColDef<Lesson>[] = [
    {
      field: 'id',
      headerName: 'STT ',
      width: 74,
      cellRenderer: ({ value }: Cell) => `<span class="lesson-id">${value}</span>`,
    },
    {
      field: 'topic',
      headerName: 'TOPIC ',
      width: 150,
      cellRenderer: ({ value }: Cell) =>
        `<span class="topic topic--${String(value).toLowerCase()}">${value}</span>`,
    },
    {
      field: 'title',
      headerName: 'TIÊU ĐỀ ',
      flex: 1.8,
      minWidth: 320,
      cellRenderer: ({ data }: Cell) =>
        `<strong class="lesson-title">${data?.title}</strong><small class="lesson-date">${data?.date}</small>`,
    },
    {
      field: 'writing',
      headerName: 'ĐIỂM VIẾT',
      width: 150,
      cellRenderer: ({ value }: Cell) => this.score(value as number),
    },
    {
      field: 'reading',
      headerName: 'ĐIỂM ĐỌC',
      width: 150,
      cellRenderer: ({ value }: Cell) => this.score(value as number),
    },
    {
      headerName: 'THAO TÁC',
      width: 120,
      sortable: false,
      cellRenderer: () => '<span class="lesson-actions">✎ 🗑</span>',
    },
  ];

  readonly gridOptions: GridOptions<Lesson> = {
    domLayout: 'autoHeight',
    rowHeight: 68,
    headerHeight: 56,
    suppressCellFocus: true,
    defaultColDef: { sortable: true, resizable: false },
  };

  private score(value?: number): string {
    return value
      ? `<span class="score score--${value >= 90 ? 'good' : 'ok'}">${value}</span>`
      : '<span class="score-empty">--</span>';
  }
}

type Cell = ICellRendererParams<Lesson>;

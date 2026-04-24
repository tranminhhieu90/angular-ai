import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject, take, takeUntil } from 'rxjs';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

// ✅ Define strong type for data model
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-users',
  imports: [AgGridAngular, NgIf, TranslocoModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly translocoService = inject(TranslocoService);
  private readonly destroy$ = new Subject<void>();
  private gridApi!: GridApi<User>;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rowData = signal<User[]>([]);

  // ✅ columnDefs is mutable — rebuilt on language change
  columnDefs: ColDef<User>[] = [];

  // ✅ gridOptions chỉ chứa config tĩnh (không phụ thuộc i18n)
  readonly gridOptions: GridOptions<User> = {
    domLayout: 'autoHeight',
    defaultColDef: { sortable: true, filter: true, resizable: true, flex: 1 },
    pagination: false,
    animateRows: true,
    rowSelection: {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
    },
    // rowHeight: 48,
    onGridReady: (event: GridReadyEvent<User>) => {
      this.gridApi = event.api;
    },
  };

  ngOnInit(): void {
    this.translocoService
      .selectTranslation() // ← emit khi translation sẵn sàng
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        this.columnDefs = this.buildColumnDefs();
        this.loadUsers();
      });

    // 3. Listen for language changes → rebuild columnDefs
    this.translocoService.langChanges$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.columnDefs = this.buildColumnDefs();
      if (this.gridApi) {
        this.gridApi.setGridOption('columnDefs', this.columnDefs);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Build columnDefs using translated headerNames.
   * Called once in ngOnInit + on every language change.
   */
  private buildColumnDefs(): ColDef<User>[] {
    const t = (key: string) => this.translocoService.translate(key);

    return [
      {
        field: 'id',
        headerName: t('users.columns.id'),
        minWidth: 140,
        filter: true,
      },
      {
        field: 'fullName',
        headerName: t('users.columns.fullName'),
        minWidth: 180,
        filter: true,
        wrapText: true,
        autoHeight: true,
        cellStyle: { 'white-space': 'wrap', 'line-height': '1.5' },
      },
      {
        field: 'email',
        headerName: t('users.columns.email'),
        minWidth: 220,
        filter: true,
      },
      {
        field: 'role',
        headerName: t('users.columns.role'),
        minWidth: 120,
        filter: true,
      },
      {
        field: 'avatarUrl',
        headerName: t('users.columns.avatar'),
        minWidth: 180,
        valueFormatter: (params) =>
          params.value ? t('users.avatarAvailable') : t('users.avatarNone'),
      },
    ];
  }

  loadUsers(): void {
    this.isLoading.set(true);
    // Simulate API call — replace with real HTTP call later
    this.rowData.set(this.mockUsers);
    this.isLoading.set(false);
  }

  private readonly mockUsers: User[] = [
    {
      id: 'USR-001',
      fullName:
        'Nguyen Van An 222222222222222222222222222222222222222222222222222 2 22222222233333333333333',
      email: 'an.nguyen@example.com',
      role: 'admin',
      avatarUrl: 'https://i.pravatar.cc/120?img=1',
    },
    {
      id: 'USR-002',
      fullName:
        'Tran Thi Bich Nguyen Van An 222222222222222222222222222222222222222222222222222 2 22222222233333333333333Nguyen Van An 222222222222222222222222222222222222222222222222222 2 22222222233333333333333',
      email: 'bich.tran@example.com',
      role: 'staff',
      avatarUrl: 'https://i.pravatar.cc/120?img=2',
    },
    {
      id: 'USR-003',
      fullName: 'Le Quoc Minh',
      email: 'minh.le@example.com',
      role: 'customer',
    },
    {
      id: 'USR-004',
      fullName: 'Pham Gia Huy',
      email: 'huy.pham@example.com',
      role: 'staff',
      avatarUrl: 'https://i.pravatar.cc/120?img=4',
    },
    {
      id: 'USR-005',
      fullName: 'Do Thu Trang',
      email: 'trang.do@example.com',
      role: 'customer',
    },
    {
      id: 'USR-006',
      fullName: 'Le Quoc Minh',
      email: 'minh.le@example.com',
      role: 'customer',
    },
    {
      id: 'USR-007',
      fullName: 'Pham Gia Huy',
      email: 'huy.pham@example.com',
      role: 'staff',
      avatarUrl: 'https://i.pravatar.cc/120?img=4',
    },
    {
      id: 'USR-008',
      fullName: 'Do Thu Trang',
      email: 'trang.do@example.com',
      role: 'customer',
    },
    {
      id: 'USR-009',
      fullName: 'Le Quoc Minh',
      email: 'minh.le@example.com',
      role: 'customer',
    },
    {
      id: 'USR-010',
      fullName: 'Pham Gia Huy',
      email: 'huy.pham@example.com',
      role: 'staff',
      avatarUrl: 'https://i.pravatar.cc/120?img=4',
    },
    {
      id: 'USR-011',
      fullName: 'Do Thu Trang',
      email: 'trang.do@example.com',
      role: 'customer',
    },
    {
      id: 'USR-012',
      fullName: 'Le Quoc Minh',
      email: 'minh.le@example.com',
      role: 'customer',
    },
    {
      id: 'USR-013',
      fullName: 'Pham Gia Huy',
      email: 'huy.pham@example.com',
      role: 'staff',
      avatarUrl: 'https://i.pravatar.cc/120?img=4',
    },
    {
      id: 'USR-014',
      fullName: 'Do Thu Trang',
      email: 'trang.do@example.com',
      role: 'customer',
    },
  ];
}

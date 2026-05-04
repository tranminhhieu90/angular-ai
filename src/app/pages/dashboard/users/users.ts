import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject, take, takeUntil } from 'rxjs';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { UserService, UserDto } from '@/app/core/api/user.service';

interface User {
  id: number;
  userName: string;
  email: string;
  role: string;
  isEmailConfirmed: boolean;
}

@Component({
  selector: 'app-users',
  imports: [AgGridAngular, NgIf, TranslocoModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly translocoService = inject(TranslocoService);
  private readonly userService = inject(UserService);
  private readonly destroy$ = new Subject<void>();
  private gridApi!: GridApi<User>;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rowData = signal<User[]>([]);

  columnDefs: ColDef<User>[] = [];

  readonly gridOptions: GridOptions<User> = {
    domLayout: 'autoHeight',
    defaultColDef: { sortable: true, resizable: true, flex: 1 },
    pagination: false,
    animateRows: true,
    rowSelection: {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
    },
    onGridReady: (event: GridReadyEvent<User>) => {
      this.gridApi = event.api;
    },
  };

  ngOnInit(): void {
    let isFirstLoad = true;

    this.translocoService
      .selectTranslation()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.columnDefs = this.buildColumnDefs();

        if (this.gridApi) {
          this.gridApi.setGridOption('columnDefs', this.columnDefs);
        }

        if (isFirstLoad) {
          this.loadUsers();
          isFirstLoad = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildColumnDefs(): ColDef<User>[] {
    const t = (key: string) => this.translocoService.translate(key);

    return [
      {
        field: 'id',
        headerName: t('users.columns.id'),
        minWidth: 80,
      },
      {
        field: 'userName',
        headerName: t('users.columns.full_name'),
        minWidth: 160,
      },
      {
        field: 'email',
        headerName: t('users.columns.email'),
        minWidth: 220,
      },
      {
        field: 'role',
        headerName: t('users.columns.role'),
        minWidth: 120,
      },
      {
        field: 'isEmailConfirmed',
        headerName: t('users.columns.is_email_confirmed'),
        minWidth: 160,
        valueFormatter: (params) => (params.value ? t('users.confirmed') : t('users.notConfirmed')),
      },
    ];
  }

  loadUsers(page = 1, limit = 20): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService
      .getUsers({ page, limit })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const mapped: User[] = res.data.map((dto: UserDto) => ({
            id: dto.id,
            userName: dto.userName,
            email: dto.email,
            role: dto.role,
            isEmailConfirmed: dto.isEmailConfirmed,
          }));
          this.rowData.set(mapped);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.message ?? 'Không thể tải danh sách user.');
          this.isLoading.set(false);
        },
      });
  }
}

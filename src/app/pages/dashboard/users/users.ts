import { GridOptions } from 'ag-grid-community';

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { UserDto } from '../../../core/api/users-api.service';

@Component({
  selector: 'app-users',
  imports: [AgGridAngular, NgIf],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid?: AgGridAngular;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly rowData = signal<UserDto[]>([]);

  readonly columnDefs: ColDef<UserDto>[] = [
    { field: 'id', headerName: 'ID', minWidth: 140, filter: true },
    { field: 'fullName', headerName: 'Full Name', minWidth: 180, filter: true },
    { field: 'email', headerName: 'Email', minWidth: 220, filter: true },
    { field: 'role', headerName: 'Role', minWidth: 120, filter: true },
    {
      field: 'avatarUrl',
      headerName: 'Avatar',
      minWidth: 180,
      valueFormatter: (params) => (params.value ? 'Available' : 'No avatar'),
    },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  readonly gridOptions: GridOptions<UserDto> = {
    columnDefs: this.columnDefs,
    defaultColDef: { sortable: true, filter: true, resizable: true, flex: 1 },
    pagination: false,
    animateRows: true,
    rowSelection: {
      mode: 'multiRow',
      checkboxes: true,
      headerCheckbox: true,
    },
    rowHeight: 48,
  };

  loadUsers(): void {
    this.rowData.set(this.mockUsers);
    this.isLoading.set(false);
  }

  get gridHeight(): string {
    const rowCount = this.rowData().length;
    const rowHeight = 48;
    const headerHeight = 48;
    const maxHeight = 500;
    const calculated = rowCount * rowHeight + headerHeight;
    return `${Math.min(calculated, maxHeight)}px`;
  }

  private readonly mockUsers: UserDto[] = [
    {
      id: 'USR-001',
      fullName: 'Nguyen Van An',
      email: 'an.nguyen@example.com',
      role: 'admin',
      avatarUrl: 'https://i.pravatar.cc/120?img=1',
    },
    {
      id: 'USR-002',
      fullName: 'Tran Thi Bich',
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
  ];
}

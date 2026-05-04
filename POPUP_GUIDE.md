# Popup base trong dự án Angular

Base popup hiện dùng `@angular/cdk/dialog` vì dự án đã có sẵn Angular CDK. Cách này nhẹ, không phụ thuộc vào Angular Material, nhưng vẫn có overlay, backdrop, focus trap, ESC close và inject data/result chuẩn.

## Thư viện thường dùng

- `@angular/cdk/dialog`: phù hợp để xây base modal riêng, dễ giữ UI theo design system của dự án.
- `@angular/material/dialog`: phù hợp nếu dự án dùng Angular Material.
- `@taiga-ui/core` dialog/polymorpheus: phù hợp nếu muốn đi sâu theo hệ sinh thái Taiga UI.
- `ng-bootstrap`, `PrimeNG DynamicDialog`: phù hợp nếu toàn bộ app đang dùng các UI kit đó.

Với repo này, `@angular/cdk/dialog` là lựa chọn nền tốt vì đã có sẵn trong `package.json`.

## Confirm popup

```ts
import { Component, inject } from '@angular/core';
import { PopupService } from '@/app/core/services/popup.service';

@Component({})
export class ExampleComponent {
  private readonly popup = inject(PopupService);

  deleteUser(): void {
    this.popup
      .confirm({
        title: 'Xóa user?',
        message: 'Thao tác này không thể hoàn tác.',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        variant: 'danger',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        // Call API delete ở đây
      });
  }
}
```

## Alert popup

```ts
this.popup.alert({
  title: 'Lưu thành công',
  message: 'Dữ liệu đã được cập nhật.',
  variant: 'success',
  closeText: 'Đóng',
});
```

## Custom popup component

```ts
const dialogRef = this.popup.open<UserFormPopupComponent, UserDto, UserDto>(
  UserFormPopupComponent,
  {
    size: 'lg',
    data: user,
    disableClose: true,
  },
);

dialogRef.closed.subscribe((savedUser) => {
  if (savedUser) {
    // Refresh list
  }
});
```

Trong component được mở popup:

```ts
import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { PopupShellComponent } from '@/app/shared/components/popup';

@Component({
  selector: 'app-user-form-popup',
  imports: [PopupShellComponent],
  template: `
    <app-popup-shell title="Cập nhật user">
      <!-- form ở đây -->
      <button type="button" (click)="save()">Lưu</button>
    </app-popup-shell>
  `,
})
export class UserFormPopupComponent {
  private readonly dialogRef = inject<DialogRef<UserDto>>(DialogRef);
  readonly user = inject<UserDto>(DIALOG_DATA);

  save(): void {
    this.dialogRef.close(this.user);
  }
}
```

## File chính

- `src/app/core/services/popup.service.ts`
- `src/app/shared/components/popup/popup-shell.component.*`
- `src/app/shared/components/popup/confirm-popup.component.*`
- `src/app/shared/components/popup/popup.types.ts`
- `src/styles.scss`

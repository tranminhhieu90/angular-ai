import { inject, Injectable } from '@angular/core';
import { GlobalConfig, IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastr = inject(ToastrService);

  private defaultConfig: Partial<IndividualConfig> = {
    positionClass: 'toast-top-right',
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };

  success(message: string, title = 'Thành công', config?: Partial<IndividualConfig>): void {
    this.toastr.success(message, title, { ...this.defaultConfig, ...config });
  }

  error(message: string, title = 'Lỗi', config?: Partial<IndividualConfig>): void {
    this.toastr.error(message, title, { ...this.defaultConfig, ...config });
  }

  warning(message: string, title = 'Cảnh báo', config?: Partial<IndividualConfig>): void {
    this.toastr.warning(message, title, { ...this.defaultConfig, ...config });
  }

  info(message: string, title = 'Thông tin', config?: Partial<IndividualConfig>): void {
    this.toastr.info(message, title, { ...this.defaultConfig, ...config });
  }
}

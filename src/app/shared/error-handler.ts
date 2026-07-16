import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toast = inject(ToastService);

  handleError(error: any): void {
    if (error?.status) return;

    console.error('Unhandled error:', error);

    const message =
      error?.message ||
      error?.rejection?.message ||
      'An unexpected error occurred';

    this.toast.show(message, 'error', 5000);
  }
}

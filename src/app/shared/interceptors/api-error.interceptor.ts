import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService as PublicToastService } from '../services/toast.service';
import { ToastService as AdminToastService } from '../../admin/components/toast/toast.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const publicToast = inject(PublicToastService);
  const adminToast = inject(AdminToastService);
  const isAdmin = req.url.includes('/api/admin');

  const token = localStorage.getItem('admin_token');
  let authReq = req;
  if (token && isAdmin) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const toast = isAdmin ? adminToast : publicToast;

      if (error.status === 0) {
        toast.show('Network error. Please check your connection.', 'error', 5000);
      } else if (error.status === 401 && isAdmin) {
        localStorage.removeItem('admin_token');
        toast.show('Session expired. Please log in again.', 'warning', 4000);
        router.navigate(['/admin/login']);
      } else if (error.status === 403) {
        toast.show('You do not have permission to perform this action.', 'error', 5000);
      } else if (error.status === 404) {
        toast.show('The requested resource was not found.', 'error', 4000);
      } else if (error.status === 429) {
        toast.show('Too many requests. Please slow down.', 'warning', 5000);
      } else if (error.status >= 500) {
        toast.show('Server error. Please try again later.', 'error', 5000);
      } else if (error.error?.message) {
        toast.show(error.error.message, 'error', 4000);
      }

      return throwError(() => error);
    }),
  );
};

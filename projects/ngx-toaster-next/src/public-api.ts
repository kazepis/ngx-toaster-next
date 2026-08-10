/*
 * Public API Surface of ngx-toaster-next
 */

export {
  DEFAULT_TOAST_CONFIG,
  TOAST_CONFIG,
  type ToastCategory,
  type ToastConfigOverrides,
  type ToastInvokeOptions,
  type ToastLibraryConfig
} from './lib/toast-config';
export { ToastService } from './lib/toast.service';
export { provideToasts } from './lib/toasts.providers';

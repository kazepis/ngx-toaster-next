import { InjectionToken } from '@angular/core';

export type ToastCategory = 'success' | 'error' | 'info' | 'warning';

export interface ToastInvokeOptions {
  /** Lifetime in milliseconds. `0` = sticky (no auto-dismiss). */
  timeOut?: number;

  /**
   * When set, overrides the library `enableHtml` config for this toast only.
   * Only enable for trusted content — untrusted HTML is unsafe.
   */
  enableHtml?: boolean;
}

export interface ToastLibraryConfig {
  /** Viewport placement. Fixed to bottom-right in v1. */
  position: 'bottom-right';

  /**
   * Default lifetime per category, in milliseconds.
   * `0` = sticky.
   */
  timeOutByCategory: Record<ToastCategory, number>;

  /** Suppress duplicate visible toasts (category + title + message). */
  preventDuplicates: boolean;

  /**
   * Render message as HTML when true.
   * Only enable for trusted content — untrusted HTML is unsafe.
   */
  enableHtml: boolean;
}

/**
 * Accepts a partial `timeOutByCategory`, so it is strictly more permissive than
 * `Partial<ToastLibraryConfig>` and stays assignable from contract-shaped config.
 */
export type ToastConfigOverrides = Partial<Omit<ToastLibraryConfig, 'timeOutByCategory'>> & {
  timeOutByCategory?: Partial<Record<ToastCategory, number>>;
};

export const DEFAULT_TOAST_CONFIG: ToastLibraryConfig = {
  position: 'bottom-right',
  timeOutByCategory: {
    success: 10_000,
    info: 10_000,
    warning: 20_000,
    error: 0,
  },
  preventDuplicates: false,
  enableHtml: false,
};

export const TOAST_CONFIG = new InjectionToken<ToastLibraryConfig>('TOAST_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    ...DEFAULT_TOAST_CONFIG,
    timeOutByCategory: { ...DEFAULT_TOAST_CONFIG.timeOutByCategory },
  }),
});

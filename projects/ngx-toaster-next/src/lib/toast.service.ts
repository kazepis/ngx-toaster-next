import {
  ApplicationRef,
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
  Service,
  type ComponentRef,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

import { TOAST_CONFIG, type ToastCategory, type ToastInvokeOptions } from './toast-config';
import { ToastHost } from './toast-host.component';
import { ToastStore } from './toast-store';

/**
 * Public fire-and-forget API for showing and clearing toast notifications.
 *
 * Browser-only: show operations no-op under SSR / non-browser platforms.
 */
@Service()
export class ToastService {
  private readonly config = inject(TOAST_CONFIG);
  private readonly store = inject(ToastStore);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private hostRef: ComponentRef<ToastHost> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.destroyHost());
  }

  success(message: string, title?: string, override?: ToastInvokeOptions): void {
    this.open('success', message, title, override);
  }

  error(message: string, title?: string, override?: ToastInvokeOptions): void {
    this.open('error', message, title, override);
  }

  info(message: string, title?: string, override?: ToastInvokeOptions): void {
    this.open('info', message, title, override);
  }

  warning(message: string, title?: string, override?: ToastInvokeOptions): void {
    this.open('warning', message, title, override);
  }

  /** Immediately dismisses every currently open toast, including sticky ones. */
  clearAllToasts(): void {
    this.store.clear();
  }

  private open(
    category: ToastCategory,
    message: string,
    title = '',
    override?: ToastInvokeOptions,
  ): void {
    if (!this.isBrowser || !message?.trim()) {
      return;
    }

    const overrideTimeOut = override?.timeOut;
    const timeOut =
      typeof overrideTimeOut === 'number' &&
      Number.isFinite(overrideTimeOut) &&
      overrideTimeOut >= 0
        ? overrideTimeOut
        : this.config.timeOutByCategory[category];

    const resolvedTitle = title ?? '';

    if (this.config.preventDuplicates) {
      const isDuplicate = this.store
        .toasts()
        .some((t) => t.category === category && t.title === resolvedTitle && t.message === message);
      if (isDuplicate) {
        return;
      }
    }

    this.ensureHost();
    this.store.add({
      category,
      message,
      title: resolvedTitle,
      timeOut,
      enableHtml:
        typeof override?.enableHtml === 'boolean' ? override.enableHtml : this.config.enableHtml,
    });
  }

  private ensureHost(): void {
    if (this.hostRef || !this.isBrowser) {
      return;
    }

    const ref = createComponent(ToastHost, {
      environmentInjector: this.environmentInjector,
    });
    this.appRef.attachView(ref.hostView);
    this.document.body.appendChild(ref.location.nativeElement);
    this.hostRef = ref;
  }

  private destroyHost(): void {
    if (!this.hostRef) {
      return;
    }

    this.appRef.detachView(this.hostRef.hostView);
    this.hostRef.destroy();
    this.hostRef.location.nativeElement.remove();
    this.hostRef = null;
  }
}

import { JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  ToastService,
  TOAST_CONFIG,
  type ToastCategory,
  type ToastInvokeOptions,
} from 'ngx-toaster-next';

@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly toasts = inject(ToastService);
  private readonly libraryConfig = inject(TOAST_CONFIG);

  protected readonly message = signal('The operation completed.');
  protected readonly title = signal('Toast');
  protected readonly overrideTimeOut = signal<string>('');

  /** Per-invocation flag — passed as ToastInvokeOptions.enableHtml. */
  protected readonly enableHtml = signal(false);

  /** Live library config flag — toggled without reload. */
  protected readonly preventDuplicates = signal(this.libraryConfig.preventDuplicates);

  protected readonly activeConfig = computed(() => ({
    ...this.libraryConfig,
    enableHtml: this.enableHtml(),
    preventDuplicates: this.preventDuplicates(),
  }));

  protected show(category: ToastCategory): void {
    this.toasts[category](this.message(), this.title() || undefined, this.buildOverride());
  }

  protected showSticky(): void {
    this.toasts.success(this.message(), this.title() || undefined, {
      ...this.buildOverride(),
      timeOut: 0,
    });
  }

  protected showHtmlSample(): void {
    this.toasts.info('Hello <strong>world</strong><br/>second line', 'HTML', this.buildOverride());
  }

  protected showDuplicatePair(): void {
    const override = this.buildOverride();
    this.toasts.warning('Duplicate candidate', 'Same', override);
    this.toasts.warning('Duplicate candidate', 'Same', override);
  }

  protected clearAll(): void {
    this.toasts.clearAllToasts();
  }

  protected toggleEnableHtml(): void {
    this.enableHtml.update((value) => !value);
  }

  protected togglePreventDuplicates(): void {
    this.preventDuplicates.update((value) => !value);
    this.libraryConfig.preventDuplicates = this.preventDuplicates();
  }

  private buildOverride(): ToastInvokeOptions {
    const override: ToastInvokeOptions = {
      enableHtml: this.enableHtml(),
    };

    const overrideRaw = this.overrideTimeOut().trim();
    if (overrideRaw !== '') {
      override.timeOut = Number(overrideRaw);
    }

    return override;
  }
}

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TOAST_CONFIG } from './toast-config';
import { provideToasts } from './toasts.providers';
import { ToastService } from './toast.service';
import { ToastStore } from './toast-store';

describe('ToastService', () => {
  afterEach(() => {
    // Clear open toasts before resetting timers so ngOnDestroy clears timeouts first.
    try {
      TestBed.inject(ToastService).clearAllToasts();
    } catch {
      // Module may already be torn down.
    }
    vi.useRealTimers();
    document.querySelectorAll('ngx-toaster-host').forEach((el) => el.remove());
    TestBed.resetTestingModule();
  });

  async function setup(config: Parameters<typeof provideToasts>[0] = {}) {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideToasts(config)],
    }).compileComponents();

    return {
      service: TestBed.inject(ToastService),
      store: TestBed.inject(ToastStore),
    };
  }

  /** Flush change detection without advancing toast dismiss timers. */
  async function flushUi(): Promise<void> {
    await TestBed.tick();
  }

  function toastElements(): NodeListOf<Element> {
    return document.querySelectorAll('ngx-toast');
  }

  it('applies category default timeouts', async () => {
    const { service, store } = await setup();
    service.success('ok');
    service.info('note');
    service.warning('careful');
    service.error('fail');
    await flushUi();

    const toasts = store.toasts();
    expect(toasts.find((t) => t.category === 'success')?.timeOut).toBe(10_000);
    expect(toasts.find((t) => t.category === 'info')?.timeOut).toBe(10_000);
    expect(toasts.find((t) => t.category === 'warning')?.timeOut).toBe(20_000);
    expect(toasts.find((t) => t.category === 'error')?.timeOut).toBe(0);
  });

  it('lets override.timeOut win over the category default', async () => {
    const { service, store } = await setup();
    service.success('ok', undefined, { timeOut: 2500 });
    await flushUi();
    expect(store.toasts()[0].timeOut).toBe(2500);
  });

  it('forces sticky when override.timeOut is 0', async () => {
    const { service, store } = await setup();
    service.success('sticky', undefined, { timeOut: 0 });
    await flushUi();
    expect(store.toasts()[0].timeOut).toBe(0);
    expect(toastElements()[0].querySelector('.toaster-progress')).toBeNull();

    await vi.advanceTimersByTimeAsync(60_000);
    expect(store.toasts()).toHaveLength(1);
  });

  it('falls back to the category default for invalid overrides', async () => {
    const { service, store } = await setup();
    service.success('ok', undefined, { timeOut: Number.NaN });
    service.info('note', undefined, { timeOut: -1 });
    await flushUi();

    expect(store.toasts().find((t) => t.category === 'success')?.timeOut).toBe(10_000);
    expect(store.toasts().find((t) => t.category === 'info')?.timeOut).toBe(10_000);
  });

  it('dismisses sticky toasts on click and keyboard', async () => {
    const { service, store } = await setup();
    service.error('sticky error');
    await flushUi();

    (toastElements()[0] as HTMLElement).click();
    await flushUi();
    expect(store.toasts()).toHaveLength(0);

    service.error('again');
    await flushUi();
    (toastElements()[0] as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    await flushUi();
    expect(store.toasts()).toHaveLength(0);

    service.error('space');
    await flushUi();
    (toastElements()[0] as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }),
    );
    await flushUi();
    expect(store.toasts()).toHaveLength(0);

    service.error('escape');
    await flushUi();
    (toastElements()[0] as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await flushUi();
    expect(store.toasts()).toHaveLength(0);
  });

  it('auto-dismisses timed toasts after the effective timeout', async () => {
    const { service, store } = await setup({
      timeOutByCategory: { success: 3000 },
    });
    service.success('timed');
    await flushUi();
    expect(store.toasts()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(2999);
    await flushUi();
    expect(store.toasts()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1);
    await flushUi();
    expect(store.toasts()).toHaveLength(0);
  });

  it('clearAllToasts removes timed and sticky toasts and leaves no DOM or timers', async () => {
    const { service, store } = await setup();
    service.success('timed');
    service.error('sticky');
    await flushUi();
    expect(store.toasts()).toHaveLength(2);
    expect(toastElements().length).toBe(2);

    service.clearAllToasts();
    await flushUi();

    expect(store.toasts()).toHaveLength(0);
    expect(toastElements().length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('suppresses duplicates when preventDuplicates is true', async () => {
    const { service, store } = await setup({ preventDuplicates: true });
    service.success('same', 'Title');
    service.success('same', 'Title');
    await flushUi();
    expect(store.toasts()).toHaveLength(1);

    service.error('same', 'Title');
    service.success('same', 'Other');
    service.success('different', 'Title');
    await flushUi();
    expect(store.toasts()).toHaveLength(4);
  });

  it('allows duplicates when preventDuplicates is false', async () => {
    const { service, store } = await setup({ preventDuplicates: false });
    service.success('same');
    service.success('same');
    await flushUi();
    expect(store.toasts()).toHaveLength(2);
  });

  it('lets override.enableHtml win over the library config', async () => {
    const { service } = await setup({ enableHtml: false });
    service.info('Hello <strong>world</strong>', undefined, { enableHtml: true });
    await flushUi();

    const message = toastElements()[0].querySelector('.toaster-message')!;
    expect(message.querySelector('strong')?.textContent).toBe('world');
  });

  it('renders HTML markup when enableHtml is true', async () => {
    const { service } = await setup({ enableHtml: true });
    service.info('Hello <strong>world</strong><br/>line');
    await flushUi();

    const message = toastElements()[0].querySelector('.toaster-message')!;
    expect(message.querySelector('strong')?.textContent).toBe('world');
    expect(message.querySelector('br')).toBeTruthy();
  });

  it('treats tags as text when enableHtml is false', async () => {
    const { service } = await setup({ enableHtml: false });
    service.info('Hello <strong>world</strong><br/>line');
    await flushUi();

    const message = toastElements()[0].querySelector('.toaster-message')!;
    expect(message.querySelector('strong')).toBeNull();
    expect(message.textContent).toContain('<strong>world</strong>');
  });

  it('requires a non-empty message and supports optional title', async () => {
    const { service, store } = await setup();
    service.success('');
    service.success('   ');
    service.success('body only');
    service.success('body', 'Heading');
    await flushUi();

    expect(store.toasts()).toHaveLength(2);
    expect(store.toasts().find((t) => t.message === 'body only')?.title).toBe('');
    expect(store.toasts().find((t) => t.message === 'body')?.title).toBe('Heading');
  });

  it('merges provideToasts overrides over defaults and pins position', async () => {
    await setup({
      enableHtml: true,
      timeOutByCategory: { error: 5000 },
      position: 'bottom-right',
    });

    const config = TestBed.inject(TOAST_CONFIG);
    expect(config.position).toBe('bottom-right');
    expect(config.enableHtml).toBe(true);
    expect(config.timeOutByCategory.error).toBe(5000);
    expect(config.timeOutByCategory.success).toBe(10_000);
    expect(config.preventDuplicates).toBe(false);
  });
});

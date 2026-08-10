import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastComponent } from './toast.component';
import type { ToastRecord } from './toast-store';

function makeToast(overrides: Partial<ToastRecord> = {}): ToastRecord {
  return {
    id: 1,
    category: 'success',
    message: 'Hello',
    title: '',
    timeOut: 5000,
    enableHtml: false,
    ...overrides,
  };
}

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function init(toast: ToastRecord): void {
    fixture.componentRef.setInput('toast', toast);
    fixture.detectChanges();
  }

  it('renders a progress bar for timed toasts with matching duration', () => {
    init(makeToast({ timeOut: 4000 }));

    const progress = fixture.nativeElement.querySelector('.toaster-progress') as HTMLElement;
    expect(progress).toBeTruthy();
    expect(progress.style.animationDuration).toBe('4000ms');
  });

  it('omits the progress bar for sticky toasts', () => {
    init(makeToast({ timeOut: 0 }));

    expect(fixture.nativeElement.querySelector('.toaster-progress')).toBeNull();
  });

  it('pauses progress on hover and resumes with a 1000ms grace period on leave', async () => {
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    init(makeToast({ timeOut: 5000 }));

    fixture.nativeElement.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    const progress = fixture.nativeElement.querySelector('.toaster-progress') as HTMLElement;
    expect(progress.style.animationPlayState).toBe('paused');

    await vi.advanceTimersByTimeAsync(6000);
    expect(dismissed).not.toHaveBeenCalled();

    fixture.nativeElement.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    const resumed = fixture.nativeElement.querySelector('.toaster-progress') as HTMLElement;
    expect(resumed.style.animationDuration).toBe('1000ms');
    expect(resumed.style.animationPlayState).toBe('running');

    await vi.advanceTimersByTimeAsync(1000);
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it('uses role=status for success and info', () => {
    init(makeToast({ category: 'success' }));
    expect(fixture.nativeElement.getAttribute('role')).toBe('status');

    fixture.destroy();
    fixture = TestBed.createComponent(ToastComponent);
    init(makeToast({ category: 'info' }));
    expect(fixture.nativeElement.getAttribute('role')).toBe('status');
  });

  it('uses role=alert for error and warning', () => {
    init(makeToast({ category: 'error' }));
    expect(fixture.nativeElement.getAttribute('role')).toBe('alert');
    expect(fixture.nativeElement.classList.contains('toaster-error')).toBe(true);

    fixture.destroy();
    fixture = TestBed.createComponent(ToastComponent);
    init(makeToast({ category: 'warning' }));
    expect(fixture.nativeElement.getAttribute('role')).toBe('alert');
    expect(fixture.nativeElement.classList.contains('toaster-warning')).toBe(true);
  });
});

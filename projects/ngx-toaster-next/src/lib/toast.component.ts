import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
} from '@angular/core';

import type { ToastRecord } from './toast-store';

interface ProgressRun {
  readonly id: number;
  readonly duration: number;
}

/** Grace period after hover/focus leave, matching ngx-toastr extendedTimeOut. */
const EXTENDED_TIMEOUT_MS = 1000;

/**
 * Internal single-toast view. Owns its auto-dismiss timer and progress bar.
 * Not part of the public API.
 */
@Component({
  selector: 'ngx-toast',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'ariaRole()',
    '[attr.aria-atomic]': '"true"',
    '[attr.tabindex]': '0',
    'animate.enter': 'toaster-in',
    'animate.leave': 'toaster-out',
    '(click)': 'dismiss()',
    '(keydown.enter)': 'dismiss()',
    '(keydown.space)': 'onSpace($event)',
    '(keydown.escape)': 'dismiss()',
    '(mouseenter)': 'onInteractionStart()',
    '(mouseleave)': 'onInteractionEnd()',
    '(focusin)': 'onInteractionStart()',
    '(focusout)': 'onInteractionEnd()',
  },
  template: `
    @if (toast().title) {
      <div class="toaster-title">{{ toast().title }}</div>
    }
    @if (toast().enableHtml) {
      <div class="toaster-message" [innerHTML]="toast().message"></div>
    } @else {
      <div class="toaster-message">{{ toast().message }}</div>
    }
    @for (run of progressRuns(); track run.id) {
      <div
        class="toaster-progress"
        [style.animation-duration.ms]="run.duration"
        [style.animation-play-state]="paused() ? 'paused' : 'running'"
      ></div>
    }
  `,
})
export class ToastComponent implements OnDestroy {
  readonly toast = input.required<ToastRecord>();
  readonly dismissed = output<void>();

  readonly paused = signal(false);
  readonly progressRuns = signal<readonly ProgressRun[]>([]);

  private interactionCount = 0;
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private nextRunId = 0;
  private dismissedOnce = false;
  private timerStarted = false;

  readonly hostClass = computed(() => `ngx-toaster toaster-${this.toast().category}`);

  readonly ariaRole = computed(() => {
    const category = this.toast().category;
    return category === 'error' || category === 'warning' ? 'alert' : 'status';
  });

  constructor() {
    effect(() => {
      // Establish dependency on the toast input so the effect runs once it is set.
      const timeOut = this.toast().timeOut;
      untracked(() => {
        if (this.timerStarted || this.dismissedOnce) {
          return;
        }
        this.timerStarted = true;
        if (timeOut > 0) {
          this.startRun(timeOut);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  dismiss(): void {
    if (this.dismissedOnce) {
      return;
    }
    this.dismissedOnce = true;
    this.clearTimer();
    this.dismissed.emit();
  }

  protected onSpace(event: Event): void {
    event.preventDefault();
    this.dismiss();
  }

  protected onInteractionStart(): void {
    if (this.toast().timeOut <= 0 || this.dismissedOnce) {
      return;
    }
    this.interactionCount += 1;
    if (this.interactionCount === 1) {
      this.clearTimer();
      this.paused.set(true);
    }
  }

  protected onInteractionEnd(): void {
    if (this.toast().timeOut <= 0 || this.dismissedOnce) {
      return;
    }
    this.interactionCount = Math.max(0, this.interactionCount - 1);
    if (this.interactionCount === 0) {
      this.paused.set(false);
      this.startRun(EXTENDED_TIMEOUT_MS);
    }
  }

  private startRun(duration: number): void {
    this.clearTimer();
    this.nextRunId += 1;
    this.progressRuns.set([{ id: this.nextRunId, duration }]);
    this.timerId = setTimeout(() => this.dismiss(), duration);
  }

  private clearTimer(): void {
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
  }
}

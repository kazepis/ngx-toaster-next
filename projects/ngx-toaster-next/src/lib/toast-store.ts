import { Service, signal } from '@angular/core';

import type { ToastCategory } from './toast-config';

/** Internal representation of an open toast. Not part of the public API. */
export interface ToastRecord {
  readonly id: number;
  readonly category: ToastCategory;
  readonly message: string;
  readonly title: string;
  readonly timeOut: number;
  readonly enableHtml: boolean;
}

@Service()
export class ToastStore {
  private nextId = 0;
  private readonly _toasts = signal<readonly ToastRecord[]>([]);

  /** Newest-first list of currently open toasts. */
  readonly toasts = this._toasts.asReadonly();

  add(input: Omit<ToastRecord, 'id'>): ToastRecord {
    this.nextId += 1;
    const record: ToastRecord = { id: this.nextId, ...input };
    this._toasts.update((list) => [record, ...list]);
    return record;
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}

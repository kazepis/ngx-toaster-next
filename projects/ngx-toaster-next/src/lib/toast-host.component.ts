import { Component, inject } from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastStore } from './toast-store';

/**
 * Internal bottom-right overlay host. Created once by ToastService and
 * appended to document.body. Not part of the public API.
 */
@Component({
  selector: 'ngx-toaster-host',
  imports: [ToastComponent],
  host: {
    class: 'toaster-container',
  },
  template: `
    @for (toast of store.toasts(); track toast.id) {
      <ngx-toast [toast]="toast" (dismissed)="store.dismiss(toast.id)" />
    }
  `,
})
export class ToastHost {
  protected readonly store = inject(ToastStore);
}

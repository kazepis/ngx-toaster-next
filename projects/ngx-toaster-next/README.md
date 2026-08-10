# ngx-toaster-next

Angular 22 toast notification library inspired by ngx-toastr. Visual presentation is derived from [ngx-toastr](https://github.com/scttcper/ngx-toastr); the public API contains four severity methods, clear-all, and a small config surface).

## Install

```bash
npm install ngx-toaster-next
```

## Setup

1. Import the global stylesheet (required — styles are not bundled into components):

```css
/* styles.css / styles.scss */
@import 'ngx-toaster-next/toaster.css';
```

Or in `angular.json`:

```json
"styles": ["node_modules/ngx-toaster-next/toaster.css", "src/styles.scss"]
```

2. Provide the library in your application config:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideToasts } from 'ngx-toaster-next';

export const appConfig: ApplicationConfig = {
  providers: [
    provideToasts({
      // optional overrides — see Config below
    })
  ]
};
```

`ToastService` is usable without `provideToasts()` (library defaults apply). Call
`provideToasts()` whenever you need to change timeouts, duplicates, or HTML mode.

## Usage

```ts
import { inject } from '@angular/core';
import { ToastService } from 'ngx-toaster-next';

export class Demo {
  private readonly toasts = inject(ToastService);

  save(): void {
    this.toasts.success('Saved successfully', 'Success');
  }

  fail(): void {
    // Errors are sticky by default (timeOut: 0)
    this.toasts.error('Could not save', 'Error');
  }

  note(): void {
    this.toasts.info('Heads up');
  }

  caution(): void {
    this.toasts.warning('Check your input', 'Warning');
  }

  stickySuccess(): void {
    this.toasts.success('Pinned', undefined, { timeOut: 0 });
  }

  clear(): void {
    this.toasts.clearAllToasts();
  }
}
```

Argument order is always `(message, title?, override?)`. Message is required;
title-only toasts are not supported.

### Timeout precedence

1. `override.timeOut` when it is a finite number `>= 0`
2. Otherwise `timeOutByCategory[category]`

`0` means sticky: no auto-dismiss and no progress bar. Sticky toasts dismiss on
click / Enter / Space / Escape, or via `clearAllToasts()`.

### HTML precedence

1. `override.enableHtml` when it is a boolean
2. Otherwise the library `enableHtml` config

## Config

| Key                         | Default          | Notes                                           |
| --------------------------- | ---------------- | ----------------------------------------------- |
| `position`                  | `'bottom-right'` | Fixed in v1 — other values are ignored / pinned |
| `timeOutByCategory.success` | `10000`          | ms                                              |
| `timeOutByCategory.info`    | `10000`          | ms                                              |
| `timeOutByCategory.warning` | `20000`          | ms                                              |
| `timeOutByCategory.error`   | `0`              | sticky                                          |
| `preventDuplicates`         | `false`          | Duplicate key = category + title + message      |
| `enableHtml`                | `false`          | See security note                               |

Partial `timeOutByCategory` merges over the defaults.

## Security: `enableHtml`

When `enableHtml` is `true`, the message is rendered as HTML (Angular's built-in
HTML sanitizer still strips scripts). **Only enable this for trusted content.**
Untrusted user input in HTML mode is unsafe. Titles are always plain text.

## Accessibility

- `role="status"` for success / info; `role="alert"` for error / warning
- Each toast is focusable (`tabindex="0"`) and dismissible with Enter, Space, or Escape
- Hover or focus pauses a timed countdown; leaving starts a 1000 ms grace period
  (ngx-toastr `extendedTimeOut` parity)
- Contrast (WCAG AA):
  - success `#3E823E` on white ≈ 4.70:1
  - info `#2A7E96` on white ≈ 4.64:1
  - error `#BD362F` on white ≈ 5.63:1
  - warning `#F89406` on near-black `#241A00` ≈ 7.55:1

Palette tokens are CSS custom properties on `.toaster-container` if you need to
override them.

## Browser-only / SSR

Show operations no-op when `isPlatformBrowser` is false. The library is intended
for browser apps; SSR bootstraps that inject `ToastService` are safe as long as
you do not expect toasts during server render.

## Migrating from ngx-toastr

Intentional differences:

1. **Palette** — success / info darkened for AA; warning keeps `#F89406` with dark text/icon
2. **Class names** — `ngx-toaster-next`, `toaster-success`, `toaster-title`, … (not `toast-*`)
3. **Icons** — hand-authored SVG masks (no Font Awesome assets)
4. **Progress** — CSS `scaleX` animation instead of a 10 ms `setInterval`
5. **Hover progress** — freezes in place instead of collapsing to zero width (timing still pauses + 1000 ms grace)
6. **Width** — fixed 300 px with `max-width: calc(100dvw - 24px)` (ngx-toastr's responsive rules were dead code)
7. **Keyboard** — focusable with a `currentColor` focus ring; Enter / Space / Escape dismiss
8. **Live region** — `role` on the toast root; container is not an `aria-live` region
9. **API** — only `success` / `error` / `info` / `warning` / `clearAllToasts` + `provideToasts`; no toast IDs, Observables, custom components, or alternate positions

## Building this workspace

```bash
ng build ngx-toaster-next
ng test ngx-toaster-next
ng serve ngx-toaster-next-sample-app
```

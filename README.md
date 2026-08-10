# ngx-toaster-next

**Accessible toast notifications for Angular 22 — familiar ngx-toastr visuals with a smaller, focused API.**

[![npm version](https://img.shields.io/npm/v/ngx-toaster-next)](https://www.npmjs.com/package/ngx-toaster-next)
[![npm downloads](https://img.shields.io/npm/dw/ngx-toaster-next)](https://www.npmjs.com/package/ngx-toaster-next)
![Angular](https://img.shields.io/badge/Angular-22-red)
![License](https://img.shields.io/badge/License-MIT-blue)
[![Live demo](https://img.shields.io/badge/demo-live-brightgreen)](https://kazepis.github.io/ngx-toaster-next/)

```bash
npm install ngx-toaster-next
```

> **Inject `ToastService`, call `success`, `error`, `info`, or `warning`.** No toast IDs, no custom component system, no extra ceremony.

[**Try the live demo**](https://kazepis.github.io/ngx-toaster-next/) — see every toast type, timeout behavior, sticky notifications, and configuration options in the browser.

## Table of contents

- [ngx-toaster-next](#ngx-toaster-next)
  - [Table of contents](#table-of-contents)
  - [What is this?](#what-is-this)
  - [Why use it?](#why-use-it)
  - [Setup](#setup)
    - [1. Install](#1-install)
    - [2. Add the global stylesheet](#2-add-the-global-stylesheet)
    - [3. Register app-wide defaults](#3-register-app-wide-defaults)
  - [Quick start (60 seconds)](#quick-start-60-seconds)
  - [Core concepts](#core-concepts)
    - [Toast API](#toast-api)
    - [Timeout precedence](#timeout-precedence)
    - [HTML precedence](#html-precedence)
  - [Configuration](#configuration)
  - [Security: `enableHtml`](#security-enablehtml)
  - [Accessibility](#accessibility)
  - [Browser-only / SSR](#browser-only--ssr)
  - [Migrating from ngx-toastr](#migrating-from-ngx-toastr)
  - [API reference](#api-reference)
    - [`ToastService`](#toastservice)
    - [Per-toast overrides](#per-toast-overrides)
    - [`provideToasts`](#providetoasts)
  - [Building this workspace](#building-this-workspace)

## What is this?

`ngx-toaster-next` is a lightweight toast notification library for **Angular 22**, inspired by [`ngx-toastr`](https://github.com/scttcper/ngx-toastr).

The visual presentation follows ngx-toastr's familiar toast style, while the API intentionally stays small:

- `success()`
- `error()`
- `info()`
- `warning()`
- `clearAllToasts()`
- `provideToasts()`

It keeps the common toast-notification workflow without bringing along toast IDs, Observables, custom toast components, alternate positions, or a large configuration surface.

## Why use it?

| ngx-toaster-next       |                                                     |
| ---------------------- | --------------------------------------------------- |
| Toast types            | Success, error, info, warning                       |
| Angular                | Angular 22                                          |
| Setup                  | Global stylesheet + optional `provideToasts()`      |
| Default position       | Bottom-right                                        |
| Sticky notifications   | `timeOut: 0`                                        |
| Duplicate prevention   | Supported (`preventDuplicates`, default: `false`)   |
| Progress indicator     | CSS animation                                       |
| Keyboard dismissal     | Enter, Space, Escape                                |
| Hover / focus behavior | Pauses countdown                                    |
| SSR-safe injection     | Yes — show operations no-op during server rendering |
| API surface            | Intentionally small                                 |

**Familiar without the baggage.** If you already know ngx-toastr, the four severity methods should feel immediately recognizable.

**Accessible by default.** Toasts use appropriate status / alert roles, are keyboard-focusable, and pause their countdown while hovered or focused.

**Sticky errors by default.** Error notifications stay visible until the user dismisses them or the application clears them.

**No timer polling.** Progress uses a CSS `scaleX` animation instead of a rapidly firing `setInterval`.

## Setup

### 1. Install

```bash
npm install ngx-toaster-next
```

### 2. Add the global stylesheet

The stylesheet is required — toast styles are not bundled into the Angular components.

In `styles.css` or `styles.scss`:

```css
@import 'ngx-toaster-next/toaster.css';
```

Or add it through `angular.json`:

```json
"styles": [
  "node_modules/ngx-toaster-next/toaster.css",
  "src/styles.scss"
]
```

### 3. Register app-wide defaults

This step is optional.

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideToasts } from 'ngx-toaster-next';

export const appConfig: ApplicationConfig = {
  providers: [
    provideToasts({
      // Override only what you need.
    })
  ]
};
```

`ToastService` works without `provideToasts()` — the built-in defaults are used automatically.

Call `provideToasts()` when you want to customize timeouts, duplicate handling, or HTML rendering.

## Quick start (60 seconds)

Inject `ToastService` and show a toast:

```ts
import { inject } from '@angular/core';
import { ToastService } from 'ngx-toaster-next';

export class Demo {
  private readonly toasts = inject(ToastService);

  save(): void {
    this.toasts.success('Saved successfully', 'Success');
  }

  fail(): void {
    this.toasts.error('Could not save', 'Error');
  }

  note(): void {
    this.toasts.info('Heads up');
  }

  caution(): void {
    this.toasts.warning('Check your input', 'Warning');
  }
}
```

Errors are **sticky by default** (`timeOut: 0`), while success, info, and warning notifications dismiss automatically.

Need a one-off sticky toast?

```ts
this.toasts.success('Pinned', undefined, { timeOut: 0 });
```

Clear everything:

```ts
this.toasts.clearAllToasts();
```

## Core concepts

### Toast API

All four severity methods use the same argument order:

```ts
(message, title?, override?)
```

For example:

```ts
this.toasts.success('Changes saved');

this.toasts.warning('Double-check these values.', 'Validation');

this.toasts.info('Deployment started.', 'Deploying', { timeOut: 5000 });
```

`message` is required. Title-only toasts are not supported.

### Timeout precedence

The timeout is resolved in this order:

1. `override.timeOut` when it is a finite number `>= 0`
2. Otherwise `timeOutByCategory[category]`

For example:

```ts
this.toasts.success('This one stays open.', 'Pinned', { timeOut: 0 });
```

`0` means **sticky**:

- no automatic dismissal
- no progress bar
- still dismissible by click
- dismissible with Enter, Space, or Escape
- removable through `clearAllToasts()`

### HTML precedence

HTML rendering is resolved in this order:

1. `override.enableHtml` when it is a boolean
2. Otherwise the app-wide `enableHtml` configuration

Example:

```ts
this.toasts.info('Saved <strong>successfully</strong>', 'Done', { enableHtml: true });
```

Only enable HTML rendering for trusted content.

## Configuration

Pass app-wide defaults through `provideToasts()`:

```ts
provideToasts({
  timeOutByCategory: {
    success: 5000,
    warning: 15000
  },
  preventDuplicates: true
});
```

Available options:

| Option                      | Default          | Description                                              |
| --------------------------- | ---------------- | -------------------------------------------------------- |
| `position`                  | `'bottom-right'` | Fixed in v1; other values are currently ignored / pinned |
| `timeOutByCategory.success` | `10000`          | Auto-dismiss timeout in ms                               |
| `timeOutByCategory.info`    | `10000`          | Auto-dismiss timeout in ms                               |
| `timeOutByCategory.warning` | `20000`          | Auto-dismiss timeout in ms                               |
| `timeOutByCategory.error`   | `0`              | Sticky                                                   |
| `preventDuplicates`         | `false`          | Prevent identical active notifications                   |
| `enableHtml`                | `false`          | Render the message as HTML                               |

Partial `timeOutByCategory` values are merged over the built-in defaults:

```ts
provideToasts({
  timeOutByCategory: {
    success: 3000
  }
});
```

The info, warning, and error defaults remain unchanged.

Duplicate identity is based on:

```text
category + title + message
```

## Security: `enableHtml`

When `enableHtml` is `true`, the toast message is rendered as HTML.

Angular's built-in HTML sanitizer still removes unsafe constructs such as scripts, but HTML mode should nevertheless be used **only with trusted content**.

Do not pass untrusted user-controlled input into an HTML-enabled toast.

Titles are always rendered as plain text.

## Accessibility

Accessibility behavior is built into the toast itself:

- success and info use `role="status"`
- error and warning use `role="alert"`
- every toast is keyboard-focusable with `tabindex="0"`
- Enter, Space, or Escape dismiss the focused toast
- hover pauses a timed countdown
- keyboard focus pauses a timed countdown
- leaving hover / focus starts a `1000 ms` grace period before dismissal
- focus indication uses `currentColor`
- the `role` is applied to each toast root; the container is **not** an `aria-live` region

The default palette targets WCAG AA contrast:

| Toast   | Colors                            | Contrast |
| ------- | --------------------------------- | -------- |
| Success | `#3E823E` on white                | ≈ 4.70:1 |
| Info    | `#2A7E96` on white                | ≈ 4.64:1 |
| Error   | `#BD362F` on white                | ≈ 5.63:1 |
| Warning | `#F89406` on near-black `#241A00` | ≈ 7.55:1 |

Palette values are exposed as CSS custom properties on `.toaster-container`, so applications can override them when needed.

## Browser-only / SSR

`ToastService` is safe to inject in applications that use server-side rendering.

Toast display operations no-op when `isPlatformBrowser` is `false`, so SSR bootstrapping does not attempt to manipulate browser UI.

The library is still intended for **browser notifications** — do not expect a toast to render during server-side rendering.

## Migrating from ngx-toastr

`ngx-toaster-next` deliberately keeps the familiar toast presentation while changing several implementation and API details.

| ngx-toaster-next        |                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| Palette                 | Success / info darkened for AA contrast                                                                         |
| Warning                 | Keeps `#F89406`, paired with dark text / icon                                                                   |
| CSS classes             | `ngx-toaster-next`, `toaster-success`, `toaster-title`, …                                                       |
| Icons                   | Hand-authored SVG masks — no Font Awesome assets                                                                |
| Progress                | CSS `scaleX` animation instead of a 10 ms `setInterval`                                                         |
| Hover progress          | Freezes in place instead of collapsing to zero width; timing still pauses and receives a `1000 ms` grace period |
| Width                   | Fixed `300px`, capped at `calc(100dvw - 24px)`; ngx-toastr's responsive rules were dead code                    |
| Keyboard                | Enter / Space / Escape dismissal                                                                                |
| Focus                   | Focusable toast with `currentColor` focus ring                                                                  |
| Live region             | `role` lives on each toast root; the container is not an `aria-live` region                                     |
| API                     | Four severity methods + `clearAllToasts()` + `provideToasts()`                                                  |
| Toast IDs               | Not supported                                                                                                   |
| Observables             | Not exposed                                                                                                     |
| Custom toast components | Not supported                                                                                                   |
| Alternate positions     | Not supported in v1                                                                                             |

The goal is not API compatibility with ngx-toastr. It is a smaller toast library with familiar presentation and modernized behavior.

## API reference

### `ToastService`

```ts
success(message, title?, override?)
error(message, title?, override?)
info(message, title?, override?)
warning(message, title?, override?)
clearAllToasts()
```

All severity methods require a message and accept an optional title and per-toast override.

### Per-toast overrides

```ts
{
  timeOut?: number;
  enableHtml?: boolean;
}
```

Example:

```ts
this.toasts.warning('This notification stays until dismissed.', 'Attention', {
  timeOut: 0,
  enableHtml: false
});
```

### `provideToasts`

Use `provideToasts()` to override application-wide defaults:

```ts
provideToasts({
  preventDuplicates: true,
  enableHtml: false,
  timeOutByCategory: {
    success: 5000,
    info: 5000,
    warning: 10000,
    error: 0
  }
});
```

Omitting the provider entirely is valid — `ToastService` falls back to the library defaults.

## Building this workspace

```bash
ng build ngx-toaster-next
ng test ngx-toaster-next
ng serve ngx-toaster-next-sample-app
```

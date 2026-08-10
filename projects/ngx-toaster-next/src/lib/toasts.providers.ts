import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import {
  DEFAULT_TOAST_CONFIG,
  TOAST_CONFIG,
  type ToastConfigOverrides,
  type ToastLibraryConfig,
} from './toast-config';

/**
 * Provides library-wide toast configuration, merged over {@link DEFAULT_TOAST_CONFIG}.
 * `position` is always pinned to `'bottom-right'` in v1.
 */
export function provideToasts(config: ToastConfigOverrides = {}): EnvironmentProviders {
  const merged: ToastLibraryConfig = {
    ...DEFAULT_TOAST_CONFIG,
    ...config,
    position: 'bottom-right',
    timeOutByCategory: {
      ...DEFAULT_TOAST_CONFIG.timeOutByCategory,
      ...config.timeOutByCategory,
    },
  };

  return makeEnvironmentProviders([{ provide: TOAST_CONFIG, useValue: merged }]);
}

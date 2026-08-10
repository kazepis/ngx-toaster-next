import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideToasts } from 'ngx-toaster-next';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideToasts()],
};

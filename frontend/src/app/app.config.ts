import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router
    provideRouter(appRoutes),

    // HttpClient + functional interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
};

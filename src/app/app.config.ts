import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideCharts,
  withDefaultRegisterables,
  } from 'ng2-charts';

import { routes } from './app.routes';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { SALES_CHART_FEATURE_KEY, salesChartReducer } from './state/sales-chart/sales-chart.reducers';
import { SalesChartEffects } from './state/sales-chart/sales-chart.effects';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideCharts(withDefaultRegisterables()),
    provideHttpClient(),
    provideEffects(),
    provideStore(),
    provideState(SALES_CHART_FEATURE_KEY, salesChartReducer),
    provideEffects(SalesChartEffects),
  ]
};

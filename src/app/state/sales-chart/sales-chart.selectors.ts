import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SalesChartState } from './sales-chart.state';
import { SALES_CHART_FEATURE_KEY } from './sales-chart.reducers';

export const selectSalesChartState = createFeatureSelector<SalesChartState>(SALES_CHART_FEATURE_KEY);

export const selectIsLoading = createSelector(
  selectSalesChartState,
  (state: SalesChartState) => state.isLoading
);

export const selectChartData = createSelector(
  selectSalesChartState,
  (state: SalesChartState) => state.chartData
);

export const selectDateSettings = createSelector(
  selectSalesChartState,
  (state: SalesChartState) => state.dateSettings
);

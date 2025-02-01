import { createAction, props } from '@ngrx/store';
import { GetDailySalesView } from '../../features/sales-chart/interfaces/get-daily-sales.view';
import { ChartDateSettings } from '../../features/sales-chart/interfaces/chart-date-settings';

export const loadChartData = createAction(
  '[Sales Chart] Load Chart Data',
  props<{ startDate: string, endDate: string }>(),
);

export const loadChartDataSuccess = createAction(
  '[Sales Chart] Load Chart Data [SUCCESS]',
  props<{ chartData: GetDailySalesView }>(),
);

export const loadChartDataError = createAction(
  '[Sales Chart] Load Chart Data [ERROR]',
  props<{ error: any }>(),
);

export const setDateSettings = createAction(
  '[Sales Chart] Set Chart State',
  props<{dateSettings: ChartDateSettings }>()
);

import { Action, createReducer, on } from '@ngrx/store';
import { SalesChartState } from './sales-chart.state';
import { loadChartData, loadChartDataError, loadChartDataSuccess, setDateSettings } from './sales-chart.actions';
import { TimeInterval } from '../../shared/enums/time-interval.enum';

export const SALES_CHART_FEATURE_KEY = 'sales-chart';

const getOneMonthAgo = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
};

const currentDate = new Date().toISOString();

export const initialState: SalesChartState = {
  dateSettings: {
    startDate: getOneMonthAgo(),
    endDate: currentDate,
    timeInterval: TimeInterval.Month,
  },
  isLoading: false,
  chartData: {
    salesData: [],
    sumData: [],
  },
};

const reducer = createReducer(
  initialState,
  on(loadChartData, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(loadChartDataSuccess, (state, { chartData }) => ({
    ...state,
    isLoading: false,
    chartData,
  })),
  on(loadChartDataError, (state, { error }) => ({
    ...state,
    isLoading: false,
  })),
  on(setDateSettings, (state, { dateSettings }) => ({
    ...state,
    dateSettings,
  }))
);

export function salesChartReducer(
  state: SalesChartState | undefined,
  action: Action
): SalesChartState {
  return reducer(state, action);
}

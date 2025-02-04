import { Action, createReducer, on } from '@ngrx/store';
import { SalesChartState } from './sales-chart.state';
import { loadChartData, loadChartDataError, loadChartDataSuccess, setDateSettings } from './sales-chart.actions';
import { TimeInterval } from '../../shared/enums/time-interval.enum';


export const SALES_CHART_FEATURE_KEY = 'sales-chart';

const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
const currentDate = new Date().toISOString();

export const initialState: SalesChartState = {
  dateSettings: {
    startDate: oneMonthAgo,
    endDate: currentDate,
    timeInterval: TimeInterval.Month,
  },
  isLoading: false,
  chartData: {
    //labels: [],
    salesData:[],
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


export function salesChartReducer(state: SalesChartState | undefined, action: Action): any {
  return reducer(state, action);
}

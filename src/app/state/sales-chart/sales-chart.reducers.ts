import { Action, createReducer, on } from '@ngrx/store';
import { SalesChartState } from './sales-chart.state';
import { TimeInterval } from '../enums';
import { loadChartData, loadChartDataError, loadChartDataSuccess, setDateSettings } from './sales-chart.actions';


const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();
const currentDate = Date.now();

export const initialState: SalesChartState = {
  dateSettings: {
    startDate: oneMonthAgo.toString(),
    endDate: currentDate.toString(),
    timeInterval: TimeInterval.Month,
  },
  isLoading: false,
  chartData: {
    labels: [],
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

import { ChartDateSettings } from "../../features/sales-chart/interfaces/chart-date-settings";
import { DailySalesView } from "../../features/sales-chart/interfaces/get-daily-sales.view";

export interface SalesChartState {
  dateSettings:ChartDateSettings
  isLoading: boolean;
  chartData: DailySalesView;
}

import { ChartDateSettings } from "../../features/sales-chart/interfaces/chart-date-settings";
import { GetDailySalesView } from "../../features/sales-chart/interfaces/get-daily-sales.view";

export interface SalesChartState {
  dateSettings:ChartDateSettings
  isLoading: boolean;
  chartData: GetDailySalesView;
}

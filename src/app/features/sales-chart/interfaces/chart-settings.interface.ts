import { ChartData } from "./chart-data.interface";
import { ChartOptions } from "./chart-options.interface";
import { ChartTypeString } from "./dataset.interface";

export interface ChartSettings {
  chartType: ChartTypeString;
  chartData: ChartData;
  chartOptions: ChartOptions;
}

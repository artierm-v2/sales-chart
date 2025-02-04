import { ChartType } from "chart.js";

export type ChartTypeString = ChartType;

export interface Dataset {
  type: ChartTypeString;
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  barPercentage?: number;
  categoryPercentage?: number;
  yAxisID?: string;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointBorderWidth?: number;
  pointRadius?: number;
  spanGaps?: boolean;
  fill?: boolean;
  pointStyle?: string;
  pointHitRadius?: number;
  tension?: number;
  pointHoverRadius?: number;
}

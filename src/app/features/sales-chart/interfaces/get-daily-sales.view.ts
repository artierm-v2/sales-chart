export interface GetDailySalesView {
  isSuccess: boolean;
  error: string;
  value: DailySalesView;
}

export interface DailySalesView {
  // labels: string[];
  salesData: Record<number, number>;
  sumData: Record<number, number>;
}

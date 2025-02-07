export interface GetDailySalesView {
  isSuccess: boolean;
  error: string;
  value: DailySalesView;
}

export interface DailySalesView {
  salesData: Record<number, number>;
  sumData: Record<number, number>;
}

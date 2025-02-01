import { TimeInterval } from "../../../shared/enums/time-interval.enum";


export interface ChartDateSettings {
  startDate: string;
  endDate: string;
  timeInterval: TimeInterval;
}

import { TooltipItem } from "./tooltip-item.interface";


export interface TooltipCallbacks {
  label: (tooltipItem: TooltipItem) => string;
}

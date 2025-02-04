import { TooltipCallbacks } from "./tooltip-callbacks.interface";

export interface TooltipConfig {
  enabled: boolean;
  callbacks: TooltipCallbacks;
}

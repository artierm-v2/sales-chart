import { TooltipItem } from "./tooltip-item.interface";

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position: 'left' | 'right' | 'top' | 'bottom';
      align: 'end';
      labels: {
        boxWidth: number;
        padding: number;
      };
    };
    tooltip: {
      enabled: boolean;
      callbacks: {
        label: (tooltipItem: TooltipItem) => string;
      };
    };
    zoom: {
      zoom: {
        drag: {
          enabled: boolean;
        },
        mode: 'x' | 'y',
      },
      pan: {
        enabled: boolean,
        mode: 'x' | 'y',
      }
    }
  };
  scales: {
    x: {
      title: {
        display: boolean;
        text: string;
      };
      grid: {
        drawOnChartArea: boolean;
        drawTicks: boolean;
      };
    };
    y: {
      type: 'linear';
      position: 'left' | 'right' | 'top' | 'bottom';
      title: {
        display: boolean;
        text: string;
      };
      grid: {
        drawOnChartArea: boolean;
        drawTicks: boolean;
      };
    };
    y1: {
      type: 'linear';
      position: 'left' | 'right' | 'top' | 'bottom';
      title: {
        display: boolean;
        text: string;
      };
      grid: {
        drawOnChartArea: boolean;
        drawTicks: boolean;
      };
    };
  };
}

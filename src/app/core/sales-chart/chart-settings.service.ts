import { Injectable } from '@angular/core';
import { ChartSettings } from '../../features/sales-chart/interfaces/chart-settings.interface';

@Injectable({
  providedIn: 'root'
})
export class ChartSettingsService {
  private _settings: ChartSettings;

  constructor() {
    this._settings = {
      chartType: 'bar',
      chartData: {
        labels: [],
        datasets: [
          {
            type: 'bar',
            label: 'Sales',
            data: [],
            backgroundColor: 'rgba(173, 216, 230, 0.7)',
            borderColor: 'rgba(173, 216, 230, 1)',
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Sum $/K',
            data: [],
            borderColor: 'gold',
            backgroundColor: 'gold',
            pointBackgroundColor: 'white',
            pointBorderColor: 'gold',
            pointBorderWidth: 2,
            pointRadius: 3,
            spanGaps: true,
            fill: false,
            pointStyle: 'circle',
            pointHitRadius: 0,
            tension: 0,
            borderWidth: 1,
            pointHoverRadius: 7,
            yAxisID: 'y1',
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 15,
              padding: 15,
            },
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (tooltipItem) =>
                tooltipItem.datasetIndex === 0
                  ? `Sales: ${tooltipItem.raw}`
                  : `Sum (In Thousands): ${tooltipItem.raw}`,
            },
          },
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: { drag: { enabled: true }, mode: 'x' },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Time' },
            grid: { drawOnChartArea: true, drawTicks: false },
          },
          y: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Sales' },
            grid: { drawOnChartArea: true, drawTicks: false },
          },
          y1: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Sum (In Thousands)' },
            grid: { drawOnChartArea: true, drawTicks: false },
          },
        },
      },
    };
  }

  public updateSettings(newSettings: Partial<ChartSettings>): void {
    this._settings = { ...this._settings, ...newSettings };
  }

  public getSettings(): ChartSettings {
    return { ...this._settings };
  }
}

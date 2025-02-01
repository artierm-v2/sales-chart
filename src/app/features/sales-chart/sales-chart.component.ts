import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Observable, Subscription } from 'rxjs';
import { TimeInterval } from '../../shared/enums/time-interval.enum';

import { GetDailySalesView } from './interfaces/get-daily-sales.view';
import * as salesChartSelectors from '../../state/sales-chart/sales-chart.selectors';
import * as salesChartActions from '../../state/sales-chart/sales-chart.actions';
import { SalesChartState } from '../../state/sales-chart/sales-chart.state';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [FormsModule, BaseChartDirective],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss',
})
export class SalesChartComponent implements  OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  public chartType: ChartType = 'bar';
 // Store ISO format internally
 private _startDate: string = '';
 private _endDate: string = '';

 // Expose formatted dates for the input
 get startDate(): string {
   return this._startDate ? this.formatDateForInput(this._startDate) : '';
 }

 set startDate(value: string) {
   this._startDate = value ? this.formatDateToISO(value) : '';
   this.updateTimeInterval();
 }

 get endDate(): string {
   return this._endDate ? this.formatDateForInput(this._endDate) : '';
 }

 set endDate(value: string) {
   this._endDate = value ? this.formatDateToISO(value) : '';
   this.updateTimeInterval();
 }

 private formatDateToISO(dateString: string): string {
  return new Date(dateString).toISOString();
}

 private formatDateForInput(dateString: string): string {
   return new Date(dateString).toISOString().split('T')[0];
 }

  public timeInterval: TimeInterval = TimeInterval.Month;

  public chartData: ChartConfiguration['data'] = {
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
  };

  public chartOptions: ChartConfiguration['options'] = {
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
  };

  // Подключаем Store
  public isLoading$: Observable<boolean> = this.store.select(salesChartSelectors.selectIsLoading);
  public chartData$: Observable<GetDailySalesView | null> = this.store.select(salesChartSelectors.selectChartData);

  sub$ = new Subscription();

  constructor(
    private store: Store<SalesChartState>,
  ) {
  }

  ngOnInit(): void {
    this.sub$.add(
      this.store.select(salesChartSelectors.selectDateSettings)
        .pipe(
          distinctUntilChanged(),
        ).subscribe((dateSettings) => {
        this.startDate = new Date(dateSettings.startDate).toISOString();
        this.endDate = new Date(dateSettings.endDate).toISOString();
        this.timeInterval= dateSettings.timeInterval;
      }),
    );
    // Загружаем данные по умолчанию для отображения графика
    this.store.dispatch(salesChartActions.loadChartData({ startDate: this.startDate, endDate: this.endDate }));
  }

  onStateChange(): void {
    const state = { startDate: this.startDate, endDate: this.endDate, timeInterval: this.timeInterval };
    this.store.dispatch(salesChartActions.setDateSettings({dateSettings: state}));

    this.store.dispatch(salesChartActions.loadChartData({ startDate: this.startDate, endDate: this.endDate }));
    this.updateTimeInterval();
  }

  private addDataToChart(
    labels: string[],
    salesData: number[],
    sumData: number[],
    label: string,
    salesValue: number,
    sumValue: number
  ): void {
    labels.push(label);
    salesData.push(salesValue);
    sumData.push(sumValue);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateQuarterData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[]
  ): void {
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let q = 1; q <= 4; q++) {
        this.addDataToChart(labels, salesData, sumData, `${year}/Q${q}`, Math.floor(Math.random() * 10000) + 2000, Math.floor(Math.random() * 200) + 50);
      }
    }
  }

  private updateMonthData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[]
  ): void {
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let month = startDate.getMonth(); month <= 11; month++) {
        if (year === startDate.getFullYear() && month < startDate.getMonth()) continue;
        if (year === endDate.getFullYear() && month > endDate.getMonth()) break;
        const formattedMonth = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        this.addDataToChart(labels, salesData, sumData, formattedMonth, Math.floor(Math.random() * 10000) + 2000, Math.floor(Math.random() * 200) + 50);
      }
    }
  }

  private updateWeekData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[]
  ): void {
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);

    while (currentDate <= endDate) {
      const formattedWeekStart = this.formatDate(currentDate);
      this.addDataToChart(labels, salesData, sumData, formattedWeekStart, Math.floor(Math.random() * 10000) + 2000, Math.floor(Math.random() * 200) + 50);
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }

  private updateDayData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[]
  ): void {
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const formattedDay = this.formatDate(currentDate);
      this.addDataToChart(labels, salesData, sumData, formattedDay, Math.floor(Math.random() * 10000) + 2000, Math.floor(Math.random() * 200) + 50);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  public updateTimeInterval(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const labels: string[] = [];
    const salesData: number[] = [];
    const sumData: number[] = [];

    switch (this.timeInterval) {
      case TimeInterval.Quarter:
        this.updateQuarterData(start, end, labels, salesData, sumData);
        break;
      case TimeInterval.Month:
        this.updateMonthData(start, end, labels, salesData, sumData);
        break;
      case TimeInterval.Week:
        this.updateWeekData(start, end, labels, salesData, sumData);
        break;
      case TimeInterval.Day:
        this.updateDayData(start, end, labels, salesData, sumData);
        break;
    }

    this.chartData.labels = labels;
    this.chartData.datasets[0].data = salesData;
    this.chartData.datasets[1].data = sumData;
    this.chart?.update();
  }

  public resetZoom(): void {
    Chart.getChart('canvasId')?.resetZoom();
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }
}

Chart.register({
  id: 'borderPlugin',
  beforeDraw: function (chart) {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
    ctx.restore();
  },
});

Chart.register(zoomPlugin);

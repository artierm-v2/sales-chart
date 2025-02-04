import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { TimeInterval } from '../../shared/enums/time-interval.enum';
import * as salesChartSelectors from '../../state/sales-chart/sales-chart.selectors';
import * as salesChartActions from '../../state/sales-chart/sales-chart.actions';
import { SalesChartState } from '../../state/sales-chart/sales-chart.state';
import { ChartSettingsService } from '../../core/sales-chart/chart-settings.service';
import { ChartData } from './interfaces/chart-data.interface';
import { ChartTypeString } from './interfaces/dataset.interface';
import { DateUtils } from '../../core/sales-chart/utils/date.utils';
import { SalesItem } from './interfaces/key-value.interface';


@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [FormsModule, BaseChartDirective],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss',
})
export class SalesChartComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  labels: string[] = [];
  salesData: number[] = [];
  sumData: number[] = [];

  salesDataRecord: Record<number, number> = [];
  sumDataRecord: Record<number, number> = [];

  private sub$ = new Subscription();
  private _startDate: string = '';
  private _endDate: string = '';
  public timeInterval: TimeInterval = TimeInterval.Month;

  get startDate(): string {
    return this._startDate ? DateUtils.formatDateForInput(this._startDate) : '';
  }

  set startDate(value: string) {
    this._startDate = value ? DateUtils.formatDateToISO(value) : '';
    this.updateTimeInterval();
  }

  get endDate(): string {
    return this._endDate ? DateUtils.formatDateForInput(this._endDate) : '';
  }

  set endDate(value: string) {
    this._endDate = value ? DateUtils.formatDateToISO(value) : '';
    this.updateTimeInterval();
  }

  get chartData(): ChartData {
    return this.chartSettingsService.getSettings().chartData;
  }

  get chartOptions(): any {
    return this.chartSettingsService.getSettings().chartOptions;
  }

  get chartType(): ChartTypeString {
    return this.chartSettingsService.getSettings().chartType;
  }
  constructor(
    private store: Store<SalesChartState>,
    private chartSettingsService: ChartSettingsService,
  ) { }

  ngOnInit(): void {
    this.sub$.add(
      this.store.select(salesChartSelectors.selectDateSettings)
        .pipe(distinctUntilChanged())
        .subscribe((dateSettings) => {
          this.startDate = DateUtils.formatDateToISO(dateSettings.startDate);
          this.endDate = DateUtils.formatDateToISO(dateSettings.endDate);
          this.timeInterval = dateSettings.timeInterval;
        })
    );

    this.sub$.add(
      this.store.select(salesChartSelectors.selectChartData)
        .pipe(distinctUntilChanged())
        .subscribe((chartData) => {
          this.labels = [];
          this.salesDataRecord = chartData.salesData;
          this.sumDataRecord = chartData.sumData;
          this.salesData = [...Object.values(chartData.salesData)];
          this.sumData = [...Object.values(chartData.sumData)];
        })
    );

    this.store.dispatch(salesChartActions.loadChartData({
      startDate: this.startDate,
      endDate: this.endDate
    }));
  }

  onStateChange(): void {
    const state = {
      startDate: this.startDate,
      endDate: this.endDate,
      timeInterval: this.timeInterval
    };
    this.store.dispatch(salesChartActions.setDateSettings({ dateSettings: state }));
    this.store.dispatch(salesChartActions.loadChartData({
      startDate: this.startDate,
      endDate: this.endDate
    }));
    this.updateTimeInterval();
  }

  private updateQuarterData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[],
  ): void {
    const quarterlyData = this.groupDataByQuarter(this.salesDataRecord, this.sumDataRecord, startDate, endDate);
    quarterlyData.forEach((data) => {
      labels.push(data.quarterLabel);
      salesData.push(data.salesData.reduce((sum: number, value: number) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum: number, value: number) => sum + value, 0));
    });
  }

  private updateMonthData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[],
  ): void {
    const monthlyData = this.groupDataByMonth(this.salesDataRecord, this.sumDataRecord, startDate, endDate);
    monthlyData.forEach((data) => {
      labels.push(data.monthLabel);
      salesData.push(data.salesData.reduce((sum: number, value: number) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum: number, value: number) => sum + value, 0));
    });
  }

  private updateDayData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[],
  ): void {
    const dailyData = this.groupDataByDay(this.salesDataRecord, this.sumDataRecord, startDate, endDate);
    dailyData.forEach((data) => {
      labels.push(data.dayLabel);
      salesData.push(data.salesData.reduce((sum: number, value: number) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum: number, value: number) => sum + value, 0));
    });
  }

  private groupDataByQuarter(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date
  ): any[] {
    const groupedData: any[] = [];

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let q = 1; q <= 4; q++) {
        const quarterDate = new Date(year, (q - 1) * 3);
        const quarterLabel = DateUtils.getQuarter(quarterDate);

        const salesForQuarter = Object.entries(salesData)
          .filter(([key, value]) => {
            const item = { key, value };
            return this.isItemInQuarter(item, year, q);
          }).map(([_, value]) => value);

        const sumForQuarter = Object.entries(sumData)
          .filter(([key, value]) => {
            const item = { key, value };
            return this.isItemInQuarter(item, year, q);
          }).map(([_, value]) => value);

        groupedData.push({
          quarterLabel,
          salesData: salesForQuarter,
          sumData: sumForQuarter,
        });
      }
    }
    return groupedData;
  }

  private isItemInQuarter(data: SalesItem, year: number, quarter: number): boolean {
    const itemDate = new Date(data.key);
    const itemYear = itemDate.getFullYear();
    const itemQuarter = Math.floor(itemDate.getMonth() / 3) + 1;

    return itemYear === year && itemQuarter === quarter;
  }

  private isItemInMonth(data: SalesItem, year: number, month: number): boolean {
    const itemDate = new Date(data.key);
    return itemDate.getFullYear() === year &&
      itemDate.getMonth() === month;
  }

  private groupDataByMonth(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date
  ): any[] {
    const groupedData: any[] = [];

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let month = 0; month <= 11; month++) {
        const monthDate = new Date(year, month);
        const monthLabel = DateUtils.getMonth(monthDate);

        const salesForMonth = Object.entries(salesData)
          .filter(([key, value]) => {
            const item = { key, value };
            return this.isItemInMonth(item, year, month);
          }).map(([_, value]) => value);

        const sumForMonth = Object.entries(sumData)
          .filter(([key, value]) => {
            const item = { key, value };
            return this.isItemInMonth(item, year, month);
          }).map(([_, value]) => value);

        groupedData.push({
          monthLabel,
          salesData: salesForMonth,
          sumData: sumForMonth,
        });
      }
    }
    return groupedData;
  }


  private groupDataByWeek(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date
  ): any[] {
    const groupedData: any[] = [];

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let week = 1; week <= 52; week++) {
        const weekDate = new Date(year, 0);
        weekDate.setDate(weekDate.getDate() + (week - 1) * 7);
        const weekLabel = DateUtils.getWeek(weekDate);

        const salesForWeek = Object.entries(salesData)
          .filter(([key, value]) => {
            const item = { key, value };
            return this.isItemInWeek(item, year, week);
          }).map(([_, value]) => value);

        const sumForWeek = Object.entries(sumData)
          .filter(([key, value]) => {
            const item = { key, value };
            return this.isItemInWeek(item, year, week);
          }).map(([_, value]) => value);

        groupedData.push({
          weekLabel,
          salesData: salesForWeek,
          sumData: sumForWeek,
        });
      }
    }
    return groupedData;
  }

  private updateWeekData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[],
  ): void {
    const weeklyData = this.groupDataByWeek(this.salesDataRecord, this.sumDataRecord, startDate, endDate);
    weeklyData.forEach((data) => {
      labels.push(data.weekLabel);
      salesData.push(data.salesData.reduce((sum: number, value: number) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum: number, value: number) => sum + value, 0));
    });
  }

  private groupDataByDay(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date
): any[] {
    const groupedData: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayLabel = `${currentDate.getDate()} ${DateUtils.getMonth(currentDate)} ${currentDate.getFullYear()}`;
        const salesForDay = Object.entries(salesData)
            .filter(([key, value]) => {
                const item = { key, value };
                return this.isItemInDay(item, currentDate);
            }).map(([_, value]) => value);

        const sumForDay = Object.entries(sumData)
            .filter(([key, value]) => {
                const item = { key, value };
                return this.isItemInDay(item, currentDate);
            }).map(([_, value]) => value);

        groupedData.push({
            dayLabel,
            salesData: salesForDay,
            sumData: sumForDay,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return groupedData;
}

// Дополнительный метод для проверки принадлежности элемента к дню
private isItemInDay(item: {key: string, value: number}, date: Date): boolean {
    const itemDate = new Date(item.key);
    return itemDate.getDate() === date.getDate() &&
           itemDate.getMonth() === date.getMonth() &&
           itemDate.getFullYear() === date.getFullYear();
}


  public updateTimeInterval(): void {
    const start = DateUtils.parseDate(this._startDate);
    const end = DateUtils.parseDate(this._endDate);
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


    this.chartSettingsService.updateSettings({
      chartData: {
        ...this.chartData,
        labels,
        datasets: [
          { ...this.chartData.datasets[0], data: salesData },
          { ...this.chartData.datasets[1], data: sumData }
        ]
      }
    });

    this.chart?.update();
  }

  private isItemInWeek(item: SalesItem, year: number, week: number): boolean {
    const itemDate = new Date(item.key);
    const itemYear = itemDate.getFullYear();
    const itemWeek = this.getWeekNumber(itemDate);

    return itemYear === year && itemWeek === week;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;

    // Находим понедельник первой недели
    const firstMonday = new Date(firstDayOfYear);
    if (firstDayOfYear.getDay() !== 1) {
        const daysToAdd = (1 - firstDayOfYear.getDay() + 7) % 7;
        firstMonday.setDate(firstMonday.getDate() + daysToAdd);
    }

    // Вычисляем номер недели
    const daysSinceFirstMonday = (date.getTime() - firstMonday.getTime()) / 86400000;
    return Math.floor(daysSinceFirstMonday / 7) + 1;
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

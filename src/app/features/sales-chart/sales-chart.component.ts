import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, merge, Subscription, tap } from 'rxjs';
import { TimeInterval } from '../../shared/enums/time-interval.enum';
import * as salesChartSelectors from '../../state/sales-chart/sales-chart.selectors';
import * as salesChartActions from '../../state/sales-chart/sales-chart.actions';
import { SalesChartState } from '../../state/sales-chart/sales-chart.state';
import { ChartSettingsService } from '../../core/sales-chart/chart-settings.service';
import { ChartData } from './interfaces/chart-data.interface';
import { ChartTypeString } from './interfaces/dataset.interface';
import { DateUtils } from '../../core/sales-chart/utils/date.utils';
import { GlobalConstants } from '../../core/sales-chart/consts/consts';
import { DayFilterOptions, MonthFilterOptions, QuarterFilterOptions, WeekFilterOptions } from './interfaces/filter-options.interface';
import { GroupedData } from './interfaces/chart-data-values.interface';


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
    // this.updateTimeInterval();
  }

  get endDate(): string {
    return this._endDate ? DateUtils.formatDateForInput(this._endDate) : '';
  }

  set endDate(value: string) {
    this._endDate = value ? DateUtils.formatDateToISO(value) : '';
    // this.updateTimeInterval();
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
  ) {
    Chart.register(zoomPlugin);
    this.registerBorderPlugin();
  }

  ngOnInit(): void {

    this.sub$.add(
      merge(
        this.store.select(salesChartSelectors.selectDateSettings)
          .pipe(
            distinctUntilChanged(),
            tap((dateSettings) => {
              this.startDate = DateUtils.formatDateToISO(dateSettings.startDate);
              this.endDate = DateUtils.formatDateToISO(dateSettings.endDate);
              this.timeInterval = dateSettings.timeInterval;
            })
          ),
        this.store.select(salesChartSelectors.selectChartData)
          .pipe(
            distinctUntilChanged(),
            tap((chartData) => {
              this.labels = [];
              this.salesDataRecord = chartData.salesData;
              this.sumDataRecord = chartData.sumData;
              this.salesData = [...Object.values(chartData.salesData)];
              this.sumData = [...Object.values(chartData.sumData)];
            })
          )
      ).subscribe()
    );

    this.store.dispatch(salesChartActions.loadChartData({
      startDate: this.startDate,
      endDate: this.endDate
    }));
  }

  public onStateChange(): void {
    const state = {
      startDate: this.startDate,
      endDate: this.endDate,
      timeInterval: this.timeInterval
    };

    this.store.dispatch(salesChartActions.setDateSettings({ dateSettings: state }));
    this.store.dispatch(salesChartActions.loadChartData({
      startDate: state.startDate,
      endDate: state.endDate
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
      labels.push(data.label);
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
    const monthlyData = this.groupDataByMonth(
      this.salesDataRecord,
      this.sumDataRecord,
      startDate,
      endDate
    );

    for (const data of monthlyData) {
      labels.push(data.label);
      salesData.push(data.salesData.reduce((sum, value) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum, value) => sum + value, 0));
    }
  }

  private updateDayData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[],
  ): void {
    const dailyData = this.groupDataByDay(
      this.salesDataRecord,
      this.sumDataRecord,
      startDate,
      endDate
    );

    for (const data of dailyData) {
      labels.push(data.label);
      salesData.push(data.salesData.reduce((sum, value) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum, value) => sum + value, 0));
    }
  }

  private groupDataByQuarter(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date,
  ): GroupedData[] {
    const totalQuarters = (endDate.getFullYear() - startDate.getFullYear()) * GlobalConstants.QUARTERS_IN_YEAR
      + Math.ceil((endDate.getMonth() - startDate.getMonth() + 1) / GlobalConstants.MONTHS_PER_QUARTER);

    const groupedData: GroupedData[] = new Array(totalQuarters);
    let currentIndex = 0;

    const filterItems = (data: Record<number, number>, options: QuarterFilterOptions): number[] => {
      return Object.entries(data)
        .filter(([key, value]) => {
          const item = { key, value };
          return DateUtils.isItemInQuarter(item, options.year, options.quarter);
        })
        .map(([_, value]) => value);
    };

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let quarter = 1; quarter <= GlobalConstants.QUARTERS_IN_YEAR; quarter++) {
        const filterOptions: QuarterFilterOptions = { year, quarter };

        const quarterDate = new Date(year, (quarter - 1) * GlobalConstants.MONTHS_PER_QUARTER);

        const [salesForQuarter, sumForQuarter] = [
          filterItems(salesData, filterOptions),
          filterItems(sumData, filterOptions)
        ];

        groupedData[currentIndex++] = {
          label: DateUtils.getQuarter(quarterDate),
          salesData: salesForQuarter,
          sumData: sumForQuarter,
        };
      }
    }

    return groupedData.slice(0, currentIndex);
  }

  private groupDataByMonth(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date,
  ): GroupedData[] {
    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * GlobalConstants.MONTHS_IN_YEAR
      + (endDate.getMonth() - startDate.getMonth() + 1);


    const groupedData: GroupedData[] = new Array(totalMonths);
    let currentIndex = 0;

    const filterItems = (data: Record<number, number>, options: MonthFilterOptions): number[] => {
      return Object.entries(data)
        .filter(([key, value]) => {
          const item = { key, value };
          return DateUtils.isItemInMonth(item, options.year, options.month);
        })
        .map(([_, value]) => value);
    };

    let year = startDate.getFullYear();
    let month = startDate.getMonth();

    while (year <= endDate.getFullYear()) {
      const filterOptions: MonthFilterOptions = { year, month };

      const monthDate = new Date(year, month);

      const [salesForMonth, sumForMonth] = [
        filterItems(salesData, filterOptions),
        filterItems(sumData, filterOptions)
      ];

      groupedData[currentIndex++] = {
        label: DateUtils.getMonth(monthDate),
        salesData: salesForMonth,
        sumData: sumForMonth,
      };

      month++;
      if (month >= GlobalConstants.MONTHS_IN_YEAR) {
        month = 0;
        year++;
      }
    }

    return groupedData.slice(0, currentIndex);
  }

  private groupDataByWeek(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date,
  ): GroupedData[] {

    const totalYears = endDate.getFullYear() - startDate.getFullYear() + 1;
    const groupedData: GroupedData[] = new Array(totalYears * GlobalConstants.WEEKS_IN_YEAR);

    let currentIndex = 0;

    const filterItems = (data: Record<number, number>, options: WeekFilterOptions): number[] => {
      return Object.entries(data)
        .filter(([key, value]) => {
          const item = { key, value };
          return DateUtils.isItemInWeek(item, options.year, options.week);
        })
        .map(([_, value]) => value);
    };

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let week = 1; week <= GlobalConstants.WEEKS_IN_YEAR; week++) {
        const filterOptions: WeekFilterOptions = { year, week };

        const weekDate = new Date(year, 0);
        weekDate.setDate(weekDate.getDate() + (week - 1) * GlobalConstants.DAYS_IN_WEEK);

        const [salesForWeek, sumForWeek] = [
          filterItems(salesData, filterOptions),
          filterItems(sumData, filterOptions)
        ];

        groupedData[currentIndex++] = {
          label: DateUtils.getWeek(weekDate),
          salesData: salesForWeek,
          sumData: sumForWeek,
        };
      }
    }

    return groupedData.slice(0, currentIndex);
  }

  private updateWeekData(
    startDate: Date,
    endDate: Date,
    labels: string[],
    salesData: number[],
    sumData: number[],
  ): void {
    const weeklyData = this.groupDataByWeek(
      this.salesDataRecord,
      this.sumDataRecord,
      startDate,
      endDate
    );

    for (const data of weeklyData) {
      labels.push(data.label);
      salesData.push(data.salesData.reduce((sum, value) => sum + value, 0));
      sumData.push(data.sumData.reduce((sum, value) => sum + value, 0));
    }
  }

  private groupDataByDay(
    salesData: Record<number, number>,
    sumData: Record<number, number>,
    startDate: Date,
    endDate: Date,
  ): GroupedData[] {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime())
      / (GlobalConstants.HOURS_IN_DAY * GlobalConstants.MINUTES_IN_HOUR * GlobalConstants.SECONDS_IN_MINUTE * GlobalConstants.MILLISECONDS_IN_SECOND));

    const groupedData: GroupedData[] = new Array(totalDays);
    let currentIndex = 0;

    const filterItems = (data: Record<number, number>, options: DayFilterOptions): number[] => {
      return Object.entries(data)
        .filter(([key, value]) => {
          const item = { key, value };
          return DateUtils.isItemInDay(item, options.date);
        })
        .map(([_, value]) => value);
    };

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const filterOptions: DayFilterOptions = { date: new Date(currentDate) };

      const [salesForDay, sumForDay] = [
        filterItems(salesData, filterOptions),
        filterItems(sumData, filterOptions)
      ];

      groupedData[currentIndex++] = {
        label: DateUtils.getDay(currentDate),
        salesData: salesForDay,
        sumData: sumForDay,
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return groupedData.slice(0, currentIndex);
  }

  public updateTimeInterval(): void {
    const start = DateUtils.parseDate(this._startDate);
    const end = DateUtils.parseDate(this._endDate);

    const labels: string[] = [];
    const salesData: number[] = [];
    const sumData: number[] = [];

    const updateDataMethods = {
      [TimeInterval.Quarter]: () => this.updateQuarterData(start, end, labels, salesData, sumData),
      [TimeInterval.Month]: () => this.updateMonthData(start, end, labels, salesData, sumData),
      [TimeInterval.Week]: () => this.updateWeekData(start, end, labels, salesData, sumData),
      [TimeInterval.Day]: () => this.updateDayData(start, end, labels, salesData, sumData)
    };

    updateDataMethods[this.timeInterval]?.();

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

  private registerBorderPlugin(): void {
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
  }

  public resetZoom(): void {
    Chart.getChart('canvasId')?.resetZoom();
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }
}

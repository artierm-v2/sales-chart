import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as salesChartActions from './sales-chart.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SalesChartService } from '../../core/sales-chart/sales-chart.service';
import { GetDailySalesView } from '../../features/sales-chart/interfaces/get-daily-sales.view';


@Injectable()
export class SalesChartEffects {
  constructor(
    private actions$: Actions,
    private salesChartService: SalesChartService,
  ) {}

  loadChartData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(salesChartActions.loadChartData),
      switchMap(({ startDate, endDate }) =>
        this.salesChartService.getSalesData(startDate, endDate).pipe(
          map((chartData: GetDailySalesView) => salesChartActions.loadChartDataSuccess({ chartData })),
          catchError((error) => of(salesChartActions.loadChartDataError({ error })))
        )
      )
    )
  );
}

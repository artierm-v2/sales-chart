import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetDailySalesView } from '../../features/sales-chart/interfaces/get-daily-sales.view';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesChartService {
  private readonly baseUrl = `${environment.apiUrl}/api/Sale`;

  constructor(private readonly http: HttpClient) {}

  getSalesData(startDate: string, endDate: string): Observable<GetDailySalesView> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<GetDailySalesView>(this.baseUrl, { params });
  }
}

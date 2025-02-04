import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetDailySalesView } from '../../features/sales-chart/interfaces/get-daily-sales.view';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}/api/Sale`;

@Injectable({
  providedIn: 'root',
})
export class SalesChartService {
  constructor(private http: HttpClient) {}

  getSalesData(startDate: string, endDate: string): Observable<GetDailySalesView> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<GetDailySalesView>(baseUrl, { params });
  }
}

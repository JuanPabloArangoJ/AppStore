import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateSaleRequest, GetSaleResponse } from '../interfaces/sale-dtos';

@Service()
export class SaleService {

  private http = inject(HttpClient);
  private endPoint = environment.apiUrl + '/sale';

  getAll(startDate?: Date | null, endDate?: Date | null): Observable<GetSaleResponse[]> {
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', this.formatDate(startDate));
    if (endDate) params = params.set('endDate', this.formatDate(endDate));

    return this.http.get<GetSaleResponse[]>(this.endPoint, { params });
  }

  getById(id: number): Observable<GetSaleResponse> {
    return this.http.get<GetSaleResponse>(`${this.endPoint}/${id}`);
  }

  create(req: CreateSaleRequest): Observable<void> {
    return this.http.post<void>(this.endPoint, req);
  }

  // Devuelve yyyy-MM-dd usando la fecha local (no UTC)
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
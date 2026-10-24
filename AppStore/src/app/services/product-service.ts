import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    CreateProductRequest,
    GetProductResponse,
    UpdateProductRequest
} from '../interfaces/product-dtos';

@Service()
export class ProductService {

    private http = inject(HttpClient);
    private endPoint = environment.apiUrl + '/product';

    getAll(): Observable<GetProductResponse[]> {
        return this.http.get<GetProductResponse[]>(this.endPoint);
    }

    getById(id: number): Observable<GetProductResponse> {
        return this.http.get<GetProductResponse>(`${this.endPoint}/${id}`);
    }

    create(req: CreateProductRequest): Observable<void> {
        const formData = new FormData();

        formData.append('SKU', req.sku);
        formData.append('Name', req.name);
        formData.append('Stock', req.stock.toString());
        formData.append('Price', req.price.toString());
        formData.append('Image', req.image);

        return this.http.post<void>(this.endPoint, formData);
    }

    update(req: UpdateProductRequest): Observable<void> {
        const formData = new FormData();

        formData.append('ProductId', req.productId.toString());

        formData.append('SKU', req.sku);
        formData.append('Name', req.name);
        formData.append('Stock', req.stock.toString());
        formData.append('Price', req.price.toString());
        if (req.image) formData.append('Image', req.image);

        return this.http.put<void>(`${this.endPoint}/${req.productId}`, formData);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endPoint}/${id}`);
    }
}
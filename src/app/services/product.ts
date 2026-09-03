import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../interfaces/category';
import { Product as IProduct } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private http = inject(HttpClient);
  private URL = environment.API_URL;
  private token = environment.TOKEN;

  getProducts(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${this.URL}/Check/products?token=${this.token}`)
      .pipe(
        map((products: IProduct[]) => products.filter((product) => product.isAvailable === true)),
      );
  }

  getProduct(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.URL}/Check/product/${id}?token=${this.token}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.URL}/CategoryProducts`);
  }

  getCategory(id: number) {
    return this.http.get<Category>(`${this.URL}/CategoryProducts/${id}`);
  }
}

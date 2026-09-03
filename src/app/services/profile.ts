import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderList } from '../interfaces/order';
import { CurrentUser } from '../interfaces/currentUser';
import { Company } from '../interfaces/company';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private http = inject(HttpClient);
  private URL = environment.API_URL;

  getUserOrders(user: CurrentUser, company: Company): Observable<OrderList> {
    return this.http.get<OrderList>(
      `${this.URL}/Order/orders?buyerUserId=${user.id}&companyId=${company.id}&page=1&pageSize=100`,
    );
  }

  getMyPaymentMethods() {
    return this.http.get<any>(`${this.URL}/UserPaymentMethods/me`);
  }

  deletePaymentMethod(id: string) {
    return this.http.delete<any>(
      `${this.URL}/User/connected/remove-payment-method/${id}`,
    );
  }

  updateProfile(payload: any) {
    return this.http.put<any>(`${this.URL}/User/me`, payload);
  }

  cancelAndRefund(orderPublicId: string): Observable<any> {
    return this.http.post(
      `${this.URL}/payments/cancel-and-refund/${orderPublicId}`,
      {},
    );
  }
}

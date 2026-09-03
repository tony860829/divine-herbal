import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auht';
import {
  CartItemAPI,
  CartItemList,
  Item,
} from '../interfaces/cartItem';
import { isPlatformBrowser } from '@angular/common';
import { Company } from '../interfaces/company';

@Injectable({ providedIn: 'root' })
export class Cart {
  private http = inject(HttpClient);
  private authService = inject(Auth);
  private platformId = inject(PLATFORM_ID);
  private API_URL = `${environment.API_URL}/Cart`;
  private LOCAL_KEY = 'guest_cart_items_v1';

  private _items = signal<Item[]>([]);
  items = this._items;
  private _cartId = signal<string | null>(null);
  cartId = this._cartId;
  totalItems = signal(0);
  totalPrice = signal(0);
  taxes = signal(0);
  total = signal(0);

  getCart(vendorCompanyId: number): Observable<CartItemList> {
    return this.http
      .get<CartItemList>(`${this.API_URL}?vendorCompanyId=${vendorCompanyId}`)
      .pipe(
        tap((cart) => {
          this._cartId.set(cart.cartId);
          this._items.set(cart.items || []);
          if (cart.totals) {
            this.totalItems.set(cart.totals.items);
            this.totalPrice.set(cart.totals.subtotal / 100);
            this.taxes.set(this.totalPrice() * 0.0825);
            this.total.set(this.totalPrice() + this.taxes());
          } else {
            this.updateTotals();
          }
        })
      );
  }

  refreshCart(): void {
    const company = this.authService.company();
    if (!company) {
      this.loadLocalCartIntoSignals();
      return;
    }

    this.getCart(company.id).subscribe({
      error: () => {
        this.clearLocalCart();
      },
    });
  }

  private loadLocalCartIntoSignals() {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem(this.LOCAL_KEY)
          : null;
      const items: Item[] = raw ? JSON.parse(raw) : [];
      this._items.set(items);
      this.updateTotals();
    } catch (e) {
      this._items.set([]);
      this.updateTotals();
    }
  }

  addToCart(item: CartItemAPI): Observable<CartItemAPI> {
    const currentUser = this.authService?.currentUser();
    const currentCompany = this.authService?.company();
    if (currentUser && currentCompany) {
      return this.http.post<CartItemAPI>(`${this.API_URL}/items`, item).pipe(
        tap(() => {
          this.refreshCart();
        })
      );
    }
    this.addToLocalCart(item);
    return of(item);
  }

  private addToLocalCart(item: CartItemAPI) {
    const items = this._items();
    const existing = items.find((i) => i.productId === item.productId);
    
    // ✅ Asegurar que imageUrl nunca sea null/undefined
    const safeItem = {
      ...item,
      imageUrl: item.imageUrl ?? '',  // fallback por si viene como 'image'
    };

    if (existing) {
      existing.quantity += safeItem.quantity || 1;
    } else {
      items.push({
        ...safeItem,
        id: this.generateTempId(),
        quantity: safeItem.quantity || 1,
      } as Item);
    }
    
    this._items.set([...items]);
    this.saveLocalCart(this._items());
    this.updateTotals();
  }
  
  updateToLocalCart(item: CartItemAPI) {
    const items = this._items();
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity = item.quantity || 1;
    } 
    this._items.set([...items]);
    this.saveLocalCart(this._items());
    this.updateTotals();
  }

  private saveLocalCart(items: Item[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(items));
  }

  private generateTempId() {
    const items = this._items();
    const min = items.length ? Math.min(...items.map((i) => i.id)) : 0;
    return min < 0 ? min - 1 : -1;
  }

  removeItem(productId: number): Observable<void> {
    const currentUser = this.authService?.currentUser();
    const currentCompany = this.authService?.company();
    if (currentUser && currentCompany) {
      return this.http
        .delete<void>(
          `${this.API_URL}/items/${productId}?vendorCompanyId=${
            this.authService.company()?.id
          }`
        )
        .pipe(
          tap(() => {
            this.refreshCart();
          })
        );
    }
    this.removeFromLocalCart(productId);
    return of(void 0);
  }

  removeFromLocalCart(productId: number) {
    const newItems = this._items().filter(
      (i) => Number(i.id) !== Number(productId)
    );
    this._items.set(newItems);
    this.saveLocalCart(newItems);
    this.refreshCart();
  }

  mergeLocalCartToRemote(currentCompany: Company): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    const localItems = this._items();
    if (!localItems || localItems.length === 0) return of(null);

    const requests = localItems.map((li) => {
      const payload: CartItemAPI = {
        vendorCompanyId: currentCompany?.id,
        connectedAccountId: currentCompany?.stripeAccountId,
        productId: li.productId,
        stripePriceId: li.stripePriceId || '',
        unitAmount: li.unitAmount,
        name: li.name,
        quantity: li.quantity,
        imageUrl: li.imageUrl,
        metadataJson: '',
      } as any;

      return this.http.post(`${this.API_URL}/items`, payload);
    });

    return forkJoin(requests).pipe(
      tap(() => {
        this.clearLocalCart();
        this.refreshCart();
      })
    );
  }

  clearLocalCart() {
    this._items.set([]);
    this.totalItems.set(0);
    this.totalPrice.set(0);
    this.taxes.set(0);
    this.total.set(0);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.LOCAL_KEY);
    }
  }

  clearCart() {
    const items = this.items();
    items.forEach((item) => {
      this.removeItem(item.id).subscribe();
    });
  }

  private updateTotals() {
    const items = this._items();
    this.totalItems.set(items.reduce((sum, i) => sum + i.quantity, 0));
    this.totalPrice.set(
      items.reduce((sum, i) => sum + (i.unitAmount / 100) * i.quantity, 0)
    );
    this.taxes.set(this.totalPrice() * 0.0825);
    this.total.set(this.totalPrice() + this.taxes());
  }
}
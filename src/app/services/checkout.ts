import { inject, Injectable, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Card } from '../interfaces/card';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Payment } from '../interfaces/payment';
import { Item } from '../interfaces/cartItem';

@Injectable({ providedIn: 'root' })
export class Checkout {
  private fb = inject(NonNullableFormBuilder);
  private http = inject(HttpClient);
  private API_URL = `${environment.API_URL}/Payments/pay-now`;

  // Formulario de dirección
  addressForm: FormGroup = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    state: ['', Validators.required],
    savePaymentMethod: [false],
  });

  paymentMethod: 'card' | 'affirm' | 'klarna' = 'card';
  selectedCard: Card | null = null;

  // 🔑 Items temporales para BuyNow
  buyNowItems = signal<Item[] | null>(null);
  isBuyNow = signal(false);

  payment = signal<any>(null);
  paymentResult = signal<any>(null);

  constructor() {
    this.loadFromStorage();
  }

  /** Guardar items BuyNow y marcar flag */
  setBuyNowItems(items: Item[]) {
    this.buyNowItems.set(items);
    this.isBuyNow.set(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('buyNowItems', JSON.stringify(items));
      localStorage.setItem('isBuyNow', 'true');
    }
  }

  /** Limpiar items BuyNow */
  clearBuyNowItems() {
    this.buyNowItems.set(null);
    this.isBuyNow.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('buyNowItems');
      localStorage.removeItem('isBuyNow');
    }
  }

  /** Guardar pago */
  setPayment(value: any) {
    this.payment.set(value);
    if (typeof window !== 'undefined')
      localStorage.setItem('payment', JSON.stringify(value));
  }

  /** Guardar resultado de pago */
  setPaymentResult(result: any) {
    this.paymentResult.set(result);
    if (typeof window !== 'undefined')
      localStorage.setItem('paymentResult', JSON.stringify(result));
  }

  /** Limpiar todo lo relacionado a pago */
  clearPayment() {
    this.payment.set(null);
    this.paymentResult.set(null);
    this.clearBuyNowItems();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('payment');
      localStorage.removeItem('paymentResult');
    }
  }

  /** Cargar estado desde localStorage al iniciar */
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem('buyNowItems');
      const storedFlag = localStorage.getItem('isBuyNow');
      const storedPayment = localStorage.getItem('payment');
      const storedPaymentResult = localStorage.getItem('paymentResult');

      if (storedItems) this.buyNowItems.set(JSON.parse(storedItems));
      if (storedFlag) this.isBuyNow.set(storedFlag === 'true');
      if (storedPayment) this.payment.set(JSON.parse(storedPayment));
      if (storedPaymentResult)
        this.paymentResult.set(JSON.parse(storedPaymentResult));
    }
  }

  /** Realizar PayNow */
  payNow(payment: Payment): Observable<any> {
    return this.http.post<Payment>(`${this.API_URL}`, payment);
  }

  /** Obtener items activos (BuyNow o cart) */
  getItems(cartItems: Item[]): Item[] {
    return this.buyNowItems() ?? cartItems;
  }

  /** Subtotal, taxes y total */
  getSubtotal(cartItems: Item[]): number {
    return this.getItems(cartItems).reduce(
      (acc, i) => acc + (i.unitAmount / 100) * i.quantity,
      0,
    );
  }

  getTaxes(cartItems: Item[], rate = 0.0825): number {
    return this.getSubtotal(cartItems) * rate;
  }

  getTotal(cartItems: Item[], rate = 0.0825): number {
    return this.getSubtotal(cartItems) + this.getTaxes(cartItems, rate);
  }

  confirmOrder(publicId: string | undefined) {
    return this.http.post(
      `${environment.API_URL}/Payments/confirm-order-after-action/${publicId}`,
      {},
    );
  }
}

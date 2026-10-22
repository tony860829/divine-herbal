import { Item } from "./cartItem";

export interface Order {
  companyId: number;
  buyerUserId: number;
  currency: string;
  stripeCustomerId: string;
  successUrl: string;
  cancelUrl: string;
  connectedAccountId: string;
  taxAmount: number;
  shippingAmount: number;
  applicationFeeAmount: number;
  items: Item[];
}

export interface OrderList {
  total: number;
  page: number;
  pageSize: number;
  data: OrderData[];
}

export interface OrderData {
  publicId: string;
  status: number;
  currency: string;
  totalAmount: number;
  createdAtUtc: string;
  items: OrderItemData[];
  payments: OrderPaymentData[];
}

export interface OrderItemData {
  name: string;
  quantity: number;
  unitAmount: number;
}

export interface OrderPaymentData {
  status: string;
  amount: number;
  receiptUrl: string | null;
  createdAtUtc: string;
}

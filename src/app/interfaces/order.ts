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
  data: Data[];
}

interface Data {
  publicId: string;
  status: number;
  currency: string;
  totalAmount: number;
  createdAtUtc: string;
  items: ItemList[];
  payments: any[];
}

interface ItemList {
  name: string;
  quantity: number;
  unitAmount: number;
}
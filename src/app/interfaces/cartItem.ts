export interface CartItemAPI {
  vendorCompanyId: number;
  connectedAccountId: string;
  productId: number;
  stripePriceId: string;
  unitAmount: number; 
  name: string;
  quantity: number;
  imageUrl: string;
  metadataJson: string;
}

export interface CartItemList {
  cartId: string;
  vendorCompanyId: number;
  connectedAccountId: string;
  currency: string;
  items: Item[];
  totals: Totals;
}

export interface Totals {
  subtotal: number;
  items: number;
}

export interface Item {
  id: number;
  productId: number;
  stripePriceId: string;
  name: string;
  imageUrl: string;
  unitAmount: number;
  quantity: number;
}
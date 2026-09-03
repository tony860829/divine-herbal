export interface Product {
  id: number;
  companyId: number;
  company?: any;
  name: string;
  description: string;
  recurring: boolean;
  interval?: any;
  intervalCount?: any;
  isAvailable: boolean;
  code: string;
  price: number;
  salePrice: number;
  measureId: number;
  measure?: any;
  categoryProductId: number;
  categoryProduct?: any;
  pictures: Picture[];
  specifications: any[];
  stripeProductId: string;
  stripePriceId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface Picture {
  id: number;
  name: string;
  productId: number;
  product?: any;
}

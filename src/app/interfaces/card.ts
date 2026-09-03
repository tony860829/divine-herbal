export interface Card {
  id: number;
  userId: number;
  stripeCustomerId: string;
  paymentMethodId: string;
  last4: string;
  brand: string;
  isDefault: boolean;
  createdAt: string;
  cardType?:string;
}
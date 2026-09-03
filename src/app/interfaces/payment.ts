export interface Payment {
  orderPublicId: string;
  connectedAccountId: string;
  stripeCustomerId: string;
  paymentMethodId?: string;
}

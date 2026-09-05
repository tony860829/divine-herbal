export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActivate: boolean;
  emailConfirm: boolean;
  isFirstLogin: boolean;
  stripeCustomerId: string;
  avatar?: any;
  token: string;
  phone?: any;
  companies: Company[];
  line1: string;
  line2:string;
  postalCode: string;
  city: string;
  state: string;
  hasRecipeAccess:boolean;
}

export interface Company {
  id: number;
  name: string;
  type?: any;
  logo: string;
  role: string;
}
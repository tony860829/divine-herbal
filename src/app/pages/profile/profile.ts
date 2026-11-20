import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Auth as AuthService } from '../../services/auht';
import { Profile as ProfileService } from '../../services/profile';
import { Company } from '../../interfaces/company';
import { CurrentUser } from '../../interfaces/currentUser';
import { OrderData } from '../../interfaces/order';
import { Translation } from '../../services/translation';

interface RecipePurchase {
  reference: string;
  amount: number | null;
  currency: string;
  dateUtc: string;
  cardBrand: string | null;
  last4: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private translation = inject(Translation);

  currentUser = this.authService.currentUser;
  purchase = signal<RecipePurchase | null>(null);
  orders = signal<OrderData[]>([]);

  hasRecipeAccess = computed(() => this.currentUser()?.hasRecipeAccess ?? false);

  initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  });

  ngOnInit(): void {
    this.title.setTitle('My Profile | Divine Herbal Remedies');
    this.meta.updateTag({
      name: 'description',
      content: 'View your personal information and your lifetime recipe access purchase.',
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    if (isPlatformBrowser(this.platformId)) {
      this.loadPurchase();
      this.loadOrders();
    }
  }

  private loadPurchase(): void {
    try {
      const raw = localStorage.getItem('recipePurchase');
      if (!raw) return;
      const parsed = JSON.parse(raw) as RecipePurchase;
      if (parsed?.reference || parsed?.dateUtc) {
        this.purchase.set(parsed);
      }
    } catch {
      /* registro corrupto: se ignora */
    }
  }

  private loadOrders(): void {
    const user: CurrentUser | null = this.currentUser();
    const company: Company | null = this.authService.company();
    if (!user || !company) return;

    this.profileService.getUserOrders(user, company).subscribe({
      next: (response) => {
        this.orders.set(response.data ?? []);
        this.translation.refresh();
      },
      error: () => this.orders.set([]),
    });
  }

  statusLabel(status: number): string {
    switch (status) {
      case 2:
        return 'Paid';
      case 3:
        return 'Partially Refunded';
      case 4:
        return 'Refunded';
      case 5:
        return 'Canceled';
      case 6:
        return 'Failed';
      default:
        return 'Pending';
    }
  }

  orderAmountLabel(amount: number | null, currency: string): string {
    if (amount === null || amount === undefined) return '';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: (currency || 'usd').toUpperCase(),
      }).format(amount / 100);
    } catch {
      return `$${(amount / 100).toFixed(2)}`;
    }
  }

  receiptUrl(order: OrderData): string | null {
    return order.payments?.find((payment) => payment.receiptUrl)?.receiptUrl ?? null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

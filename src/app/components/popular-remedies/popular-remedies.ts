import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { Product as ProductService } from '../../services/product';
import { Product as IProduct } from '../../interfaces/product';

@Component({
  selector: 'app-popular-remedies',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './popular-remedies.html',
  styleUrl: './popular-remedies.scss',
})
export class PopularRemedies {
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);

  remedies = signal<IProduct[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.productService
      .getProducts()
      .pipe(take(1))
      .subscribe((products) => {
        this.remedies.set(products.slice(0, 6));
      });
  }

  pictureUrl(product: IProduct): string {
    const name = product.pictures?.[0]?.name;
    return name ? this.productService.resolvePictureUrl(name) : '';
  }

  introOf(product: IProduct): string {
    return (product.description ?? '').split(/\n+/)[0]?.trim() ?? '';
  }
}

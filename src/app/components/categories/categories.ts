import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { Product as ProductService } from '../../services/product';
import { Product as IProduct } from '../../interfaces/product';
import { Category as ICategory } from '../../interfaces/category';
import { Translation } from '../../services/translation';

interface CategoryCard {
  id: number;
  name: string;
  image: string;
  icon: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);
  private translation = inject(Translation);

  private readonly categoryIcons = [
    { keywords: ['digest', 'stomach', 'infusion', 'tea'], icon: 'images/icon-stomach.webp' },
    { keywords: ['respir', 'lung', 'breath'], icon: 'images/icon-lungs.webp' },
    { keywords: ['skin', 'aloe', 'topical'], icon: 'images/icon-skin.webp' },
    { keywords: ['defense', 'immune', 'shield'], icon: 'images/icon-shield.webp' },
  ];

  categories = signal<CategoryCard[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.productService.getCategories(),
    })
      .pipe(take(1))
      .subscribe(({ products, categories }) => {
        const companyId = products[0]?.companyId;
        const pictureByCategory = this.firstPictureByCategory(products);
        const usedCategoryIds = new Set(products.map((product) => product.categoryProductId));
        this.categories.set(
          categories
            .filter(
              (category: ICategory) =>
                category.companyId === companyId && usedCategoryIds.has(category.id),
            )
            .map((category: ICategory) => ({
              id: category.id,
              name: category.name,
              image: pictureByCategory.get(category.id) ?? '',
              icon: this.iconFor(category.name),
            })),
        );
        this.translation.refresh();
      });
  }

  private firstPictureByCategory(products: IProduct[]): Map<number, string> {
    const pictureByCategory = new Map<number, string>();
    for (const product of products) {
      const name = product.pictures?.[0]?.name;
      if (name && !pictureByCategory.has(product.categoryProductId)) {
        pictureByCategory.set(
          product.categoryProductId,
          this.productService.resolvePictureUrl(name),
        );
      }
    }
    return pictureByCategory;
  }

  private iconFor(name: string): string {
    const normalized = name.toLowerCase();
    const match = this.categoryIcons.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword)),
    );
    return match?.icon ?? 'images/icon-leaf.webp';
  }
}

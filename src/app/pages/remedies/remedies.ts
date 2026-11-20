import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Product as ProductService } from '../../services/product';
import { Product as IProduct } from '../../interfaces/product';
import { Category } from '../../interfaces/category';
import { Translation } from '../../services/translation';

@Component({
  selector: 'app-remedies',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './remedies.html',
  styleUrl: './remedies.scss',
})
export class Remedies {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private meta = inject(Meta);
  private title = inject(Title);
  private translation = inject(Translation);

  products = signal<IProduct[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  search = signal('');
  selectedCategoryId = signal<number | null>(null);

  filteredProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();
    return this.products().filter((product) => {
      const matchesCategory = categoryId === null || product.categoryProductId === categoryId;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? '').toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  ngOnInit(): void {
    this.title.setTitle('Natural Remedies | Divine Herbal Remedies');

    this.meta.updateTag({
      name: 'description',
      content:
        'Explore our complete collection of natural herbal remedies. Honey and lemon, aloe vera, chamomile, ginger, and more natural solutions for your health.',
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'natural remedies, herbal medicine, honey lemon, aloe vera, chamomile tea, ginger remedy, natural health',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Natural Remedies | Divine Herbal Remedies',
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Explore our complete collection of natural herbal remedies made from plants, fruits, and spices for your daily well-being.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({
      property: 'og:url',
      content: 'https://divineherbalremedies.com/remedies',
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.route.queryParamMap.subscribe((params) => {
      const categoryId = Number(params.get('category'));
      if (!Number.isNaN(categoryId) && categoryId > 0) {
        this.selectedCategoryId.set(categoryId);
      }
      const search = params.get('search');
      if (search !== null) {
        this.search.set(search);
      }
    });

    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    forkJoin({
      products: this.productService.getProducts(),
      categories: this.productService.getCategories(),
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.translation.refresh();
        }),
      )
      .subscribe(({ products, categories }) => {
        const companyId = products[0]?.companyId;
        const usedCategoryIds = new Set(products.map((product) => product.categoryProductId));
        this.categories.set(
          categories.filter(
            (category) => category.companyId === companyId && usedCategoryIds.has(category.id),
          ),
        );
        this.products.set(products);
      });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId.set(id);
  }

  pictureUrl(product: IProduct): string {
    const name = product.pictures?.[0]?.name;
    return name ? this.productService.resolvePictureUrl(name) : '';
  }

  introOf(product: IProduct): string {
    return (product.description ?? '').split(/\n+/)[0]?.trim() ?? '';
  }
}

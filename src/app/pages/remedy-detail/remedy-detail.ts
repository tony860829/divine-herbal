import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { Product as ProductService } from '../../services/product';
import { Product as IProduct } from '../../interfaces/product';

@Component({
  selector: 'app-remedy-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './remedy-detail.html',
  styleUrl: './remedy-detail.scss',
})
export class RemedyDetail {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private meta = inject(Meta);
  private title = inject(Title);

  product = signal<IProduct | null>(null);
  isLoading = signal(true);
  selectedPictureIndex = signal(0);

  pictureUrl = computed(() => {
    const name = this.product()?.pictures?.[this.selectedPictureIndex()]?.name;
    return name ? this.productService.resolvePictureUrl(name) : '';
  });

  paragraphs = computed(() =>
    (this.product()?.description ?? '')
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => {
        const separatorIndex = paragraph.indexOf(':');
        const isLabel = separatorIndex > 0 && separatorIndex <= 30;
        return isLabel
          ? { label: paragraph.slice(0, separatorIndex + 1), text: paragraph.slice(separatorIndex + 1).trim() }
          : { label: '', text: paragraph };
      }),
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isNaN(id) || id <= 0) {
        this.isLoading.set(false);
        return;
      }
      this.load(id);
    });
  }

  load(id: number): void {
    this.isLoading.set(true);
    this.productService
      .getProduct(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.selectedPictureIndex.set(0);
          this.updateSeo(product);
        },
        error: () => this.product.set(null),
      });
  }

  selectPicture(index: number): void {
    this.selectedPictureIndex.set(index);
  }

  thumbUrl(index: number): string {
    const name = this.product()?.pictures?.[index]?.name;
    return name ? this.productService.resolvePictureUrl(name) : '';
  }

  private updateSeo(product: IProduct): void {
    this.title.setTitle(`${product.name} | Divine Herbal Remedies`);
    this.meta.updateTag({
      name: 'description',
      content: (product.description ?? '').slice(0, 155),
    });
    this.meta.updateTag({
      property: 'og:title',
      content: `${product.name} | Divine Herbal Remedies`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: (product.description ?? '').slice(0, 155),
    });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    if (product.pictures?.[0]?.name) {
      this.meta.updateTag({
        property: 'og:image',
        content: this.productService.resolvePictureUrl(product.pictures[0].name),
      });
    }
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductService, Product } from '../../shared/product/product.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    ProductCardComponent,
    FormsModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = this.productService.getProducts(); // Todos os produtos
  searchTerm = signal('');
  showMoreProducts = signal(false); // Controla se os cards ocultos devem ser mostrados

  // Define quantos produtos serão ocultados inicialmente
  private productsToHideCount = 3;

  // Computed signal para os produtos que serão exibidos no grid principal
  displayedProducts = computed(() => {
    if (this.showMoreProducts()) {
      return this.products(); // Se 'Ver mais...' foi clicado, mostra todos os produtos
    } else {
      // Caso contrário, mostra todos os produtos exceto os últimos 'productsToHideCount'
      const initialDisplayLimit = Math.max(0, this.products().length - this.productsToHideCount);
      return this.products().slice(0, initialDisplayLimit);
    }
  });

  // Computed signal para determinar se o botão 'Ver mais...' deve ser exibido
  shouldShowSeeMoreButton = computed(() => {
    // O botão aparece se não estivermos mostrando todos os produtos E se houver produtos ocultos
    return !this.showMoreProducts() && this.products().length > this.displayedProducts().length;
  });

  // O filtro de pesquisa deve sempre buscar em TODOS os produtos, visíveis ou não
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return []; // Retorna array vazio se o termo de pesquisa estiver vazio
    }
    return this.products().filter(product => // Filtra a lista COMPLETA de produtos
      product.title.toLowerCase().includes(term)
    );
  });

  goToProductDetail(productId: string) {
    this.router.navigate(['/jerseys', productId]);
    this.searchTerm.set(''); // Limpa o termo de pesquisa após a navegação
  }

  // Método para alternar a visibilidade dos cards adicionais/restantes
  toggleMoreProducts() {
    this.showMoreProducts.update(value => !value);
  }
}
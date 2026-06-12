import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../product/product.service'; // Mantenha este caminho
import { RouterModule } from '@angular/router'; // [1] IMPORTAÇÃO DO ROUTERMODULE

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule], // [2] ADIÇÃO DO ROUTERMODULE AQUI
  template: `
    <a [routerLink]="['/jerseys', product.id]">
      <div class="border p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <img [src]="product.imagem" alt="" class="w-full h-48 object-cover object-top mb-4" />
        <h2 class="text-lg font-bold">{{ product.title }}</h2>
        <p class="text-green-600 font-semibold">R$ {{ product.preco | number:'1.2-2' }}</p>
        <p class="text-sm text-gray-500">Estoque: {{ product.qtd_estoque }}</p>
      </div>
    </a>
  `,
  // Remova o bloco 'styles' inteiro ou deixe-o vazio:
  // styles: []
})
export class ProductCardComponent {
  @Input() product!: Product;
}
import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { CartService } from '../cart/cart.service';
// IMPORT NECESSÁRIO PARA O routerLink FUNCIONAR
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  // ADICIONADO O RouterModule AQUI
  imports: [CommonModule, NgIf, NgFor, CurrencyPipe, RouterModule], 
  template: `
    <!-- Overlay -->
    <div
      *ngIf="cart.isOpen()"
      class="fixed inset-0 bg-black/40 z-40"
      (click)="cart.close()"
    ></div>

    <!-- Drawer: flex column para permitir footer fixo -->
    <aside
      class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50
             transform transition-transform duration-300 flex flex-col"
      [class.translate-x-full]="!cart.isOpen()"
      [class.translate-x-0]="cart.isOpen()"
    >
      <!-- cabeçalho -->
      <header class="px-6 py-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">Seu Carrinho</h3>
        <button (click)="cart.close()" class="p-2 rounded hover:bg-gray-100">&times;</button>
      </header>

      <!-- conteúdo central rolável -->
      <div class="p-4 flex-1 overflow-auto space-y-3">
        <div *ngIf="cart.items().length === 0" class="text-gray-500 text-center py-10">
          Seu carrinho está vazio.
        </div>

        <div *ngFor="let item of cart.items(); let i = index" class="flex gap-3 border rounded-lg p-3">
          <img [src]="item.product.imagem" [alt]="item.product.title"
               class="w-16 h-16 rounded object-cover" />
          <div class="flex-1">
            <div class="font-medium">{{ item.product.title }}</div>
            <div class="text-sm text-gray-600">
              {{ item.quantity }} × {{ item.price | currency:'BRL':'symbol':'1.2-2' }}
            </div>
          </div>
          <button (click)="cart.removeAt(i)" class="text-red-600 hover:underline text-sm">Remover</button>
        </div>

        <!-- espaço extra no final para não colar o último item no footer (opcional) -->
        <div class="h-4"></div>
      </div>

      <!-- footer fixo sempre visível -->
      <footer class="border-t p-6 bg-white z-50">
        <div class="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{{ cart.subtotal() | currency:'BRL':'symbol':'1.2-2' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>Frete</span>
          <span>{{ cart.shipping() === 0 ? 'Grátis!' : (cart.shipping() | currency:'BRL':'symbol':'1.2-2') }}</span>
        </div>
        <div class="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{{ cart.total() | currency:'BRL':'symbol':'1.2-2' }}</span>
        </div>

        <div *ngIf="cart.missingForFree() > 0" class="text-xs text-orange-600 mt-2">
          Faltam {{ cart.missingForFree() | currency:'BRL':'symbol':'1.2-2' }} para frete grátis.
        </div>

        <div class="flex gap-3 pt-4">
          <button class="flex-1 rounded-full border px-4 py-2 hover:bg-gray-50"
                  (click)="cart.close()">Continuar comprando</button>
          <button class="flex-1 rounded-full bg-green-600 text-white px-4 py-2 hover:bg-green-700"
                  [routerLink]="['/checkout']"
                  (click)="cart.close()">
            Finalizar
          </button>
        </div>
      </footer>
    </aside>
  `
})
export class CartDrawerComponent {
  public cart = inject(CartService);
}

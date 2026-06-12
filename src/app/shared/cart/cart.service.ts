import { Injectable, computed, signal } from '@angular/core';
import type { Product } from '../product/product.service';

// Replicando as interfaces necessárias para o serviço
export interface Address {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Payment {
  paymentMethod: 'card' | 'boleto';
}

export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

export interface OrderResponse {
    orderId: string;
    timestamp: number;
    total: number;
    items: OrderItem[];
    payment: Payment;
    address: Address;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number; // conveniente: mirror de product.preco
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // UI state
  isOpen = signal(false);

  // --- Dados do Carrinho ---
  private _items = signal<CartItem[]>([]);
  readonly items = computed(() => this._items());

  // --- Estado do Último Pedido (NOVO) ---
  private _lastOrder = signal<OrderResponse | null>(null);

  // métricas
  readonly count = computed(() => this._items().reduce((a, i) => a + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.price * i.quantity, 0));

  // Frete grátis acima do valor X (ajuste se quiser)
  readonly freeShippingThreshold = 600; // R$ 600,00
  readonly shipping = computed(() => (this.subtotal() >= this.freeShippingThreshold ? 0 : 25));
  readonly total = computed(() => this.subtotal() + this.shipping());
  readonly missingForFree = computed(() =>
    Math.max(0, this.freeShippingThreshold - this.subtotal())
  );

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
  toggle() { this.isOpen.update(v => !v); }

  addItem(product: Product, quantity = 1) {
    const idx = this._items().findIndex(i => i.product.id === product.id);
    if (idx > -1) {
      const next = [...this._items()];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      this._items.set(next);
    } else {
      this._items.set([{ product, quantity, price: product.preco }, ...this._items()]);
    }
    this.open();
  }

  removeAt(index: number) {
    const next = [...this._items()];
    next.splice(index, 1);
    this._items.set(next);
  }

  // Funções de Pedido (NOVAS)
  setLastOrder(order: OrderResponse): void {
    console.log('SET LAST ORDER:', order);
    this._lastOrder.set(order);
  }

  getLastOrder(): OrderResponse | null {
  const order = this._lastOrder();

  console.log('CART SERVICE ORDER:', order);

  return order;
}
  
  clear() { this._items.set([]); }
}

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, NgIf, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product, ShippingInfo } from '../../shared/product/product.service';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../shared/cart/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, NgIf, CurrencyPipe, FormsModule],
  template: `
    <!-- Novo container para a imagem de fundo (banner) -->
    <div class="product-page-banner">
      <section *ngIf="product(); else loading" class="py-12">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow-lg rounded-2xl p-8">
          <div class="flex flex-col md:flex-row -mx-4">
            <div class="md:flex-1 px-4 mb-8 md:mb-0">
              <!-- CÓDIGO ALTERADO AQUI PARA O EFEITO DE LUPA (MAGNIFYING GLASS) -->
              <div 
                class="rounded-2xl overflow-hidden shadow-lg relative cursor-crosshair"
                (mouseenter)="isZoomActive.set(true)"
                (mouseleave)="isZoomActive.set(false)"
                (mousemove)="onMouseMove($event)"
              >
                <img 
                  [src]="product()!.imagem" 
                  [alt]="product()!.title" 
                  class="w-full object-cover rounded-2xl"
                  (load)="onImageLoad($event)"
                  #imageElement
                >
                
                <!-- A "LUPA" - só aparece quando o zoom está ativo -->
                <div 
                  *ngIf="isZoomActive()"
                  class="absolute rounded-full border-4 border-gray-400"
                  [ngStyle]="magnifierStyle()"
                ></div>
              </div>
              <!-- FIM DO CÓDIGO ALTERADO -->
            </div>

            <div class="md:flex-1 px-4">
              <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ product()!.title }}</h2>

              <div class="mb-6 pb-4 border-b">
                <p class="text-sm font-medium text-yellow-500 mb-4">
                  ⭐⭐⭐⭐⭐ (128 avaliações)
                </p>

                <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
  <p><span class="font-semibold">Clube:</span> {{ product()!.clube }}</p>
  <p><span class="font-semibold">Temporada:</span> {{ product()!.temporada }}</p>
  <p><span class="font-semibold">Categoria:</span> Camisa Oficial</p>
</div>

<div>
  <p><span class="font-semibold">Liga:</span> {{ product()!.liga }}</p>
  <p><span class="font-semibold">Patrocinador:</span> {{ product()!.patrocinador }}</p>
  <p><span class="font-semibold">País:</span> {{ product()!.pais }}</p>
  <p><span class="font-semibold">Tamanho:</span> {{ product()!.tamanho }}</p>
  <p><span class="font-semibold">Estoque:</span> {{ product()!.qtd_estoque }}</p>
</div>

                </div>
              </div>

              <div class="mb-6 pb-4 border-b">
                  <h3 class="text-xl font-bold text-gray-800 mt-6 mb-2">Descrição</h3>
                  <p class="text-gray-600">{{ product()!.descricao }}</p>
              </div>

              <div class="mt-8 flex items-end justify-between">
                <div>
                  <p class="font-bold text-gray-700 text-lg mb-1">{{ product()!.preco | currency:'BRL':'symbol':'1.2-2' }}</p>
                  <div class="flex items-center">
                    <span class="font-bold text-gray-700">Qtd:</span>
                    <input type="number" [(ngModel)]="quantity" min="1" class="w-16 ml-2 text-center border rounded-md">
                  </div>
                </div>
                <div>
                  <p class="text-green-600 text-2xl font-bold mb-1">Total: {{ total() | currency:'BRL':'symbol':'1.2-2' }}</p>
                </div>
              </div>

              <div class="mt-6">
                <h4 class="font-bold text-gray-700 mb-2">Calcular Frete</h4>
                <div class="flex">
                  <input type="text" [(ngModel)]="cep" placeholder="Digite seu CEP" class="flex-grow px-3 py-2 border rounded-md">
                  <button 
                    (click)="calculateShipping()"
                    class="bg-gray-800 text-white px-6 py-2 ml-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Calcular
                  </button>
                </div>
                <div *ngIf="shippingInfo()" class="mt-2 text-sm text-gray-600">
                  <p>Valor do frete: {{ shippingInfo()!.valor | currency:'BRL':'symbol':'1.2-2' }}</p>
                  <p>Prazo de entrega: {{ shippingInfo()!.prazo }}</p>
                </div>
              </div>
              
              <div class="mt-8">
                <button 
                  (click)="addToCart()"
                  [class.bg-green-600]="!isAddedToCart()"
                  [class.bg-blue-600]="isAddedToCart()"
                  [class.hover:bg-green-700]="!isAddedToCart()"
                  [class.hover:bg-blue-700]="isAddedToCart()"
                  class="w-full text-white py-3 px-6 rounded-md transition-colors"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div *ngIf="isAddedToCart()" 
          class="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-fade-in-up transition-transform duration-500">
      {{ quantity() }}x {{ product()!.title }} adicionado ao carrinho!
    </div>

    <ng-template #loading>
      <div class="flex justify-center items-center h-screen bg-gray-100">
        <p class="text-lg text-gray-500">Carregando detalhes do produto...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-page-banner {
      background-image: url('assets/images/banner.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      min-height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
    }
    section.py-12 { background-color: transparent; width: 100%; }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(20px); }
      20%,80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(20px); }
    }
    .animate-fade-in-up { animation: fadeInOut 3s ease-in-out forwards; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | undefined>(undefined);
  quantity = signal(1);
  isAddedToCart = signal(false);
  
  cep = signal('');
  shippingInfo = signal<ShippingInfo | undefined>(undefined);

  // Novos sinais para controlar o zoom
  isZoomActive = signal(false);
  zoomFactor = 2 ; // Fator de ampliação da imagem, você pode mudar

  // Sinal para a posição da "lupa"
  private magnifierPosition = signal({ x: 0, y: 0 });
  // Novos sinais para armazenar as dimensões da imagem na tela e as dimensões naturais
  private imageDisplayedWidth = signal(0);
  private imageDisplayedHeight = signal(0);
  private imageNaturalWidth = signal(0);
  private imageNaturalHeight = signal(0);

  // Propriedade computada para gerar o estilo da lupa dinamicamente
  magnifierStyle = computed(() => {
    const p = this.product();
    if (!p) return {};
    
    // Dimensões na tela
    const displayedWidth = this.imageDisplayedWidth();
    const displayedHeight = this.imageDisplayedHeight();
    
    // Dimensões naturais (originais) da imagem
    const naturalWidth = this.imageNaturalWidth();
    const naturalHeight = this.imageNaturalHeight();

    // Posição do mouse
    const { x, y } = this.magnifierPosition();
    
    // Retorna um objeto vazio se as dimensões não estiverem prontas
    if (displayedWidth === 0 || displayedHeight === 0 || naturalWidth === 0 || naturalHeight === 0) {
      return {};
    }

    // Calcula a proporção entre o tamanho real e o tamanho na tela
    const scaleRatioX = naturalWidth / displayedWidth;
    const scaleRatioY = naturalHeight / displayedHeight;

    // Calcula a posição do background para a lupa. A posição é o negativo do cursor, ajustada pela proporção da imagem
    const backgroundPositionX = -x * scaleRatioX * this.zoomFactor + (150 / 2);
    const backgroundPositionY = -y * scaleRatioY * this.zoomFactor + (150 / 2);
    

    return {
      width: '150px', // Tamanho da janela da lupa
      height: '150px',
      'border-radius': '50%',
      top: `${y}px`,
      left: `${x}px`,
      'transform': 'translate(-50%, -50%)', // Centraliza a lupa no cursor
      'background-image': `url(${p.imagem})`,
      'background-size': `${naturalWidth * this.zoomFactor}px ${naturalHeight * this.zoomFactor}px`,
      'background-position': `${backgroundPositionX}px ${backgroundPositionY}px`
    };
  });


  total = computed(() => {
    const productPrice = this.product()?.preco ?? 0;
    return productPrice * this.quantity();
  });

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (data) => this.product.set(data),
        error: (err) => {
          console.error('Erro ao buscar o produto', err);
          this.product.set(undefined);
        }
      });
    }
  }

  // Novo método para rastrear o movimento do mouse e atualizar a posição da lupa
  onMouseMove(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.magnifierPosition.set({ x, y });
  }

  // Novo método para capturar as dimensões da imagem
  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    this.imageDisplayedWidth.set(imgElement.offsetWidth);
    this.imageDisplayedHeight.set(imgElement.offsetHeight);
    this.imageNaturalWidth.set(imgElement.naturalWidth);
    this.imageNaturalHeight.set(imgElement.naturalHeight);
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.cart.addItem(p, this.quantity());
    this.isAddedToCart.set(true);
    setTimeout(() => this.isAddedToCart.set(false), 3000);
  }

  calculateShipping() {
    const currentCep = this.cep();
    if (currentCep) {
      this.productService.calculateShipping(currentCep).subscribe(info => {
        this.shippingInfo.set(info);
      });
    }
  }
}

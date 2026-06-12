import { Component, OnInit, inject, signal } from '@angular/core';
// Importa o registro de locale e o locale pt-BR
import { CommonModule, DatePipe, CurrencyPipe, TitleCasePipe, registerLocaleData } from '@angular/common'; 
import localePt from '@angular/common/locales/pt'; 
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../shared/cart/cart.service';

// REGISTRAR O LOCALE PT-BR AQUI PARA GARANTIR QUE O CURRENCYPIPE FUNCIONE CORRETAMENTE
registerLocaleData(localePt, 'pt-BR'); 

// 1. Definição das Interfaces (Mantenho as interfaces para consistência)
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

// FUNÇÃO MOCK PARA CRIAR UM PEDIDO FALSO
function createMockOrder(): OrderResponse {
    return {
        orderId: 'ADV' + Math.floor(Math.random() * 100000),
        timestamp: Date.now(),
        total: 1260.00,
        items: [
            { id: 1, name: 'Galactic Glue - 100g', quantity: 2, price: 630.00 },
        ],
        payment: { paymentMethod: 'card' },
        address: {
            logradouro: 'Rua das Flores',
            numero: '123',
            complemento: 'Ap. 402',
            bairro: 'Jardim Primavera',
            cidade: 'Osasco',
            estado: 'SP',
            cep: '06132050'
        }
    };
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, TitleCasePipe, DatePipe, CurrencyPipe], 
  template: `
    <!-- NOTIFICAÇÃO PUSH DE SUCESSO -->
    @if (showNotification()) {
      <div class="fixed top-0 left-0 w-full z-50 p-4 animate-push-in-out">
        <div class="max-w-md mx-auto bg-indigo-600 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center">
          <div class="flex items-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.472 6.671 6 8.799 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span class="font-semibold">Pedido Concluído!</span>
          </div>
          <button (click)="showNotification.set(false)" class="text-white opacity-75 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    }

    <div class="container mx-auto px-4 py-8">
      
      <!-- ESTADO DE CARREGAMENTO -->
      @if (isLoading()) {
        <div class="text-center py-20 bg-white rounded-lg shadow-lg">
          <!-- Spinner animado -->
          <div class="flex justify-center items-center mb-4">
              <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          </div>
          <h3 class="mt-2 text-xl font-bold text-gray-900">Carregando Pedido...</h3>
          <p class="mt-1 text-sm text-gray-500">Aguarde enquanto confirmamos os detalhes da sua compra.</p>
        </div>
      } 
      <!-- ESTADO DE SUCESSO -->
      @else if (orderData()) {
        <!-- 
            CORREÇÃO CHAVE: Usamos a sintaxe 'as order' no @if principal (ou @if que contém a verificação)
            para criar a variável de template 'order' com o tipo OrderResponse garantido, 
            eliminando os erros TS2339.
            Porém, como a verificação de isLoading() é a primeira, faremos a desreferência
            diretamente no bloco, usando o operador de acesso nulo (?) para segurança,
            e o operador ! para informar ao compilador que o Signal não é nulo.
        -->

        <!-- Usamos uma div wrapper para criar um escopo onde podemos usar a desreferenciação segura -->
        <!-- Alternativa: Usar *ngIf (se estivesse disponível) ou simplesmente acessar orderData().propriedade! -->

        @for (order of [orderData()!]; track order) {
        
          <!-- Mensagem de Sucesso -->
          <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 mb-8 rounded-lg shadow-md" role="alert">
            <h1 class="text-2xl font-bold mb-2 flex items-center">
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Pedido Recebido com Sucesso!
            </h1>
            <p class="text-lg">Obrigado por sua compra na Elite Jerseys. Os detalhes do seu pedido estão abaixo.</p>
          </div>

          <!-- Detalhes do Pedido -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Coluna 1: Resumo Geral e Pagamento (2/3 da largura em telas grandes) -->
            <div class="lg:col-span-2">
              <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Resumo da Transação</h2>
                
                <p class="mb-2 text-gray-600">
                  Número do Pedido: <span class="font-mono text-xl text-indigo-600">{{ order.orderId }}</span>
                </p>
                <p class="mb-4 text-gray-600">
                  Data/Hora: <span class="font-medium">{{ order.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                </p>

                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-lg font-bold text-gray-900 flex justify-between">
                    <span>Total Pago:</span>
                    <span class="text-green-600">{{ order.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </p>
                </div>

                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">Método de Pagamento</h3>
                <p class="text-gray-600">
                  {{ (order.payment.paymentMethod === 'card' ? 'Cartão de Crédito' : 'Boleto Bancário') | titlecase }}
                </p>
              </div>

              <!-- Detalhes dos Itens -->
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Itens Comprados</h2>
                @for (item of order.items; track item.id) {
                  <div class="flex justify-between items-center py-2 border-b last:border-b-0">
                    <p class="text-gray-700">
                      <span class="font-medium">{{ item.quantity }}x</span> {{ item.name }}
                    </p>
                    <p class="font-semibold text-gray-800">
                      {{ item.price * item.quantity | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </p>
                  </div>
                } @empty {
                  <p class="text-gray-500">Nenhum item encontrado no pedido.</p>
                }
              </div>
            </div>

            <!-- Coluna 2: Endereço de Entrega (1/3 da largura em telas grandes) -->
            <div class="lg:col-span-1">
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Endereço de Entrega</h2>
                
                <address class="not-italic text-gray-600">
                  {{ order.address.logradouro }}, {{ order.address.numero }} 
                  @if (order.address.complemento) {
                      - {{ order.address.complemento }}
                  }
                  <br>
                  {{ order.address.bairro }}<br>
                  {{ order.address.cidade }} - {{ order.address.estado }}<br>
                  CEP: {{ order.address.cep }}
                </address>
              </div>

              <!-- Ações -->
              <div class="mt-8">
                <a [routerLink]="['/']" class="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md">
                  Voltar para a Home
                </a>
              </div>
            </div>
          </div>
        }
      } 
      <!-- ESTADO DE FALHA / VAZIO (APÓS CARREGAMENTO) -->
      @else {
        <div class="text-center py-10 bg-white rounded-lg shadow-lg">
            <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h3 class="mt-2 text-xl font-bold text-gray-900">Falha ao Encontrar Pedido!</h3>
            <p class="mt-1 text-sm text-gray-500">Não foi possível recuperar os detalhes do seu pedido. Abaixo está um pedido de Demonstração.</p>
            <button (click)="loadMockOrder()" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-600 rounded-lg px-4 py-2 transition duration-200">
              Ver Pedido de Demonstração
            </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      background-color: #f7f9fb;
      min-height: 100vh;
    }
    .container {
        max-width: 1200px;
    }
    /* Keyframes para a animação do push notification */
    @keyframes push-in-out {
      /* Começa fora da tela, invisível */
      0% { opacity: 0; transform: translateY(-100px); }
      /* Entra rapidamente */
      10% { opacity: 1; transform: translateY(0); }
      /* Permanece na tela */
      85% { opacity: 1; transform: translateY(0); }
      /* Sai rapidamente */
      100% { opacity: 0; transform: translateY(-100px); }
    }
    .animate-push-in-out {
      animation: push-in-out 4s ease-in-out forwards;
    }
  `
})
export class OrderConfirmationComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);

  // orderData como um Signal que pode ser null
  orderData = signal<OrderResponse | null>(null);

  // NOVO: Signal para controlar o estado de carregamento
  isLoading = signal(true); 

  // Signal para controlar a notificação push
  showNotification = signal(false);

  ngOnInit(): void {
    // Simulamos um pequeno atraso para dar tempo de ver o carregamento, 
    // mesmo que a leitura do CartService seja instantânea.
    setTimeout(() => {
        const lastOrder = this.cartService.getLastOrder();

        console.log('PEDIDO LIDO:', lastOrder);


        if (lastOrder) {
          console.log('ORDER RECEBIDO:', lastOrder);
          // Pedido Real Encontrado
          this.orderData.set(lastOrder);
          this.showNotification.set(true);
          
          // Esconde a notificação APÓS a animação CSS (4 segundos)
          setTimeout(() => {
            this.showNotification.set(false);
          }, 4000); 

          // Esvazia o carrinho APÓS exibir os dados do pedido.
          this.cartService.clear();
        } else {
          // Pedido NÃO encontrado. Exibe a mensagem de falha.
          console.error('Nenhum pedido encontrado no CartService. Exibindo estado de falha.');
        }

        // FIM do carregamento, independente de ter encontrado o pedido ou não
        this.isLoading.set(false);

    }, 500); // 500ms de carregamento simulado (meio segundo)
  }

  // Método para carregar um pedido mock
  loadMockOrder(): void {
    // Resetar para carregamento (opcional, mas bom para simular)
    this.isLoading.set(true); 

    // Simula o carregamento do Mock
    setTimeout(() => {
        const mockOrder = createMockOrder();
        this.orderData.set(mockOrder);
        this.showNotification.set(true);
        this.isLoading.set(false); // Fim do carregamento do mock

        setTimeout(() => {
            this.showNotification.set(false);
        }, 4000); 
    }, 300); // 300ms para carregar o mock
  }
}

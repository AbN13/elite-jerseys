  import { Component, inject, signal, computed, Signal } from '@angular/core';
  import { CommonModule, NgIf } from '@angular/common';
  import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
  import { Router } from '@angular/router'; 
  import { ApiService, EnderecoResponse, OrderResponse, OrderData } from '../../shared/api/api.service';
  import { tap, catchError } from 'rxjs/operators';
  import { of } from 'rxjs';
  import { CurrencyPipe } from '@angular/common';
  import { CartService } from '../../shared/cart/cart.service'; 

  // --- MOCK DO CART SERVICE (Simulação do Carrinho) ---
  interface CartItem {
      id: number;
      title: string;
      price: number;
      quantity: number;
  }

  class MockCartService {
    cartItems = signal<CartItem[]>([
        { id: 1, title: 'Barcelona Home 24/25', price: 299.90, quantity: 2 },
        { id: 2, title: 'Manchester United Home 24/25', price: 299.90, quantity: 1 }
    ]); 


      cartTotal = computed(() => 
          this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)
      );

      clearCart() {
          this.cartItems.set([]);
      }
  }
  // --- FIM DO MOCK ---

  @Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgIf, CurrencyPipe],
    template: `
      <main class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Finalizar Compra</h1>

        <div class="grid lg:grid-cols-3 gap-8">
          
          <!-- Coluna 1: Formulários (Endereço e Pagamento) -->
          <section class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            
            <h2 class="text-2xl font-semibold mb-4 text-green-700">1. Endereço de Entrega</h2>
            <!-- Form 1: Endereço -->
            <!-- O ID 'addressForm' é usado para vincular o formulário -->
            <form [formGroup]="addressForm" id="addressForm"> 
              
              <!-- CAMPOS DO ENDEREÇO (MANTIDOS IGUAIS) -->
              <div class="mb-4">
                <label for="cep" class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <div class="flex gap-2">
                  <input 
                    id="cep" 
                    type="text" 
                    formControlName="cep" 
                    maxlength="8"
                    (keyup.enter)="buscarCep()"
                    [class]="getInputClasses('cep')"
                    placeholder="Ex: 01000000"
                  />
                  <button 
                    type="button" 
                    (click)="buscarCep()"
                    [disabled]="addressForm.get('cep')?.invalid"
                    class="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                  >
                    Buscar
                  </button>
                </div>
                <div *ngIf="isFieldInvalid('cep')" class="text-red-500 text-xs mt-1">
                  CEP é obrigatório (8 dígitos).
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="logradouro" class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                  <input 
                    id="logradouro" 
                    type="text" 
                    formControlName="logradouro" 
                    [class]="getInputClasses('logradouro', true)"
                    placeholder="Rua, Avenida, etc."
                    [readonly]="!!addressForm.get('logradouro')?.value"
                  />
                </div>
                <div>
                  <label for="bairro" class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input 
                    id="bairro" 
                    type="text" 
                    formControlName="bairro" 
                    [class]="getInputClasses('bairro', true)"
                    placeholder="Seu bairro"
                    [readonly]="!!addressForm.get('bairro')?.value"
                  />
                </div>
              </div>

              <div class="grid md:grid-cols-4 gap-4 mb-4">
                <div class="md:col-span-2">
                  <label for="cidade" class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input 
                    id="cidade" 
                    type="text" 
                    formControlName="cidade" 
                    [class]="getInputClasses('cidade', true)"
                    placeholder="Sua cidade"
                    [readonly]="!!addressForm.get('cidade')?.value"
                  />
                </div>
                <div>
                  <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input 
                    id="estado" 
                    type="text" 
                    formControlName="estado" 
                    maxlength="2"
                    [class]="getInputClasses('estado', true)"
                    placeholder="UF"
                    [readonly]="!!addressForm.get('estado')?.value"
                  />
                  <div *ngIf="isFieldInvalid('estado')" class="text-red-500 text-xs mt-1">
                      Estado é obrigatório (2 letras).
                  </div>
                </div>
                <div>
                  <label for="numero" class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input 
                    id="numero" 
                    type="text" 
                    formControlName="numero" 
                    [class]="getInputClasses('numero')"
                    placeholder="Nº"
                  />
                  <div *ngIf="isFieldInvalid('numero')" class="text-red-500 text-xs mt-1">
                      Número é obrigatório.
                  </div>
                </div>
              </div>

              <div class="mb-6">
                <label for="complemento" class="block text-sm font-medium text-gray-700 mb-1">Complemento (opcional)</label>
                <input 
                  id="complemento" 
                  type="text" 
                  formControlName="complemento" 
                  [class]="getInputClasses('complemento')"
                  placeholder="Ex: Apartamento, Bloco, Referência"
                />
              </div>

            </form>


            <!-- Etapa 2: Forma de Pagamento -->
            <h2 class="text-2xl font-semibold mb-4 mt-8 text-green-700">2. Forma de Pagamento</h2>

            <!-- O ID 'paymentForm' é usado para vincular o formulário aos botões -->
            <form [formGroup]="paymentForm" (submit)="onSubmit()" id="paymentForm"> 

              <!-- Seleção do Método de Pagamento -->
              <div class="mb-6" [ngClass]="{'opacity-50 pointer-events-none': addressForm.invalid}">
                <label class="block text-sm font-medium text-gray-700 mb-2">Selecione o Método</label>
                
                <div class="flex flex-col space-y-3">
                  
                  <!-- Opção Cartão de Crédito -->
                  <label [for]="'card'" 
                        class="flex items-center p-4 border rounded-lg cursor-pointer transition duration-150"
                        [ngClass]="paymentForm.get('paymentMethod')?.value === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50'">
                    <input type="radio" id="card" value="card" formControlName="paymentMethod" class="hidden" [disabled]="addressForm.invalid" />
                    <div class="flex items-center w-full">
                        <span class="text-green-700 font-semibold mr-3">💳</span>
                        <span class="flex-1">Cartão de Crédito</span>
                        <span class="text-xs text-gray-500">Pague em até 12x</span>
                    </div>
                  </label>

                  <!-- Opção Boleto -->
                  <label [for]="'boleto'" 
                        class="flex items-center p-4 border rounded-lg cursor-pointer transition duration-150"
                        [ngClass]="paymentForm.get('paymentMethod')?.value === 'boleto' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50'">
                    <input type="radio" id="boleto" value="boleto" formControlName="paymentMethod" class="hidden" [disabled]="addressForm.invalid" />
                    <div class="flex items-center w-full">
                        <span class="text-blue-700 font-semibold mr-3">🧾</span>
                        <span class="flex-1">Boleto Bancário</span>
                        <span class="text-xs text-gray-500">Vencimento em 1 dia útil</span>
                    </div>
                  </label>

                </div>
                <div *ngIf="isPaymentMethodInvalid()" class="text-red-500 text-xs mt-1">
                  Selecione uma forma de pagamento.
                </div>
              </div>

              <!-- Campos Condicionais: CARTÃO DE CRÉDITO -->
              <div *ngIf="paymentForm.get('paymentMethod')?.value === 'card'" 
                  [formGroup]="getCardDetailsGroup()!" 
                  class="p-4 border border-gray-200 rounded-xl bg-gray-50 mb-6 space-y-4">
                  
                <h3 class="font-semibold text-lg text-gray-700">Detalhes do Cartão</h3>

                <div>
                  <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                  <input 
                    id="cardNumber" 
                    type="text" 
                    formControlName="cardNumber" 
                    [class]="getInputClasses('cardNumber', false, getCardDetailsGroup())"
                    placeholder="0000 0000 0000 0000"
                    maxlength="19"
                  />
                  <div *ngIf="isFieldInvalid('cardNumber', getCardDetailsGroup())" class="text-red-500 text-xs mt-1">
                      Número do cartão inválido.
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div class="col-span-2">
                    <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-1">Validade (MM/AA)</label>
                    <input 
                      id="expiryDate" 
                      type="text" 
                      formControlName="expiryDate" 
                      [class]="getInputClasses('expiryDate', false, getCardDetailsGroup())"
                      placeholder="MM/AA"
                      maxlength="5"
                    />
                    <div *ngIf="isFieldInvalid('expiryDate', getCardDetailsGroup())" class="text-red-500 text-xs mt-1">
                        Data de validade inválida.
                    </div>
                  </div>
                  <div>
                    <label for="cvv" class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input 
                      id="cvv" 
                      type="text" 
                      formControlName="cvv" 
                      [class]="getInputClasses('cvv', false, getCardDetailsGroup())"
                      placeholder="123"
                      maxlength="4"
                    />
                    <div *ngIf="isFieldInvalid('cvv', getCardDetailsGroup())" class="text-red-500 text-xs mt-1">
                        CVV inválido.
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Campos Condicionais: BOLETO -->
              <div *ngIf="paymentForm.get('paymentMethod')?.value === 'boleto'" 
                  class="p-4 border border-blue-200 rounded-xl bg-blue-50 mb-6">
                  <p class="text-sm text-blue-800">Você receberá o boleto por e-mail após a confirmação do pedido.</p>
              </div>


              <!-- Botão de Submissão Final (Coluna 1) -->
              <!-- Este botão já estava funcionando corretamente -->
              <button type="submit" 
                [disabled]="addressForm.invalid || paymentForm.invalid || cartTotal() === 0 || isSubmitting()"
                class="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition duration-150 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSubmitting() ? 'Processando...' : ('Concluir Pedido (' + (cartTotal() | currency:'BRL') + ')') }}
              </button>

            </form>
            
            <div *ngIf="!addressForm.valid" class="p-4 bg-yellow-100 border border-yellow-300 rounded-lg mt-4 text-yellow-800">
                <p class="font-medium">⚠️ Preencha o Endereço para continuar</p>
            </div>

            <!-- Mensagem de Status do CEP -->
            <div *ngIf="cepStatus === 'loading'" class="text-sm text-blue-600 mt-2">Buscando endereço...</div>
            <div *ngIf="cepStatus === 'success'" class="text-sm text-green-600 mt-2">Endereço preenchido com sucesso.</div>
            <div *ngIf="cepStatus === 'error'" class="text-sm text-red-600 mt-2">Erro ao buscar CEP. Por favor, preencha manualmente.</div>
            
            <!-- Mensagem de erro na submissão -->
            <div *ngIf="submissionError()" class="p-4 bg-red-100 border border-red-300 rounded-lg mt-4 text-red-800">
              <p class="font-medium">❌ Erro ao Finalizar:</p>
              <p class="text-sm">{{ submissionError() }}</p>
            </div>

          </section>

          <!-- Coluna 2: Resumo e Pagamento -->
          <section class="lg:col-span-1">
            <div class="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 sticky top-4">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Resumo do Pedido</h2>
              
              <!-- Lista de Itens do Carrinho (AGORA REFLETINDO O MOCK ATUALIZADO) -->
              <div class="space-y-3 border-b pb-4 mb-4">
                  <div *ngFor="let item of cartItems()" class="flex justify-between text-sm text-gray-600">
                      <span class="truncate pr-2">{{ item.quantity }}x {{ item.product.title }} </span>
                      <span>{{ (item.price * item.quantity) | currency:'BRL' }}</span>
                  </div>
              </div>
              
              <!-- Totais -->
              <div class="space-y-2 mb-6">
                  <div class="flex justify-between text-base">
                      <span class="font-medium">Subtotal</span>
                      <span>{{ cartTotal() | currency:'BRL' }}</span>
                  </div>
                  <div class="flex justify-between text-base text-green-600">
                      <span class="font-medium">Frete</span>
                      <span class="font-semibold">Grátis</span>
                  </div>
                  <div class="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span class="text-green-700">{{ cartTotal() | currency:'BRL' }}</span>
                  </div>
              </div>
              
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Pagamento</h2>
              <div class="mb-6">
                  <div class="p-4 border rounded-lg bg-white">
                      <p class="font-medium">Forma de Pagamento Selecionada:</p>
                      <p *ngIf="paymentForm.get('paymentMethod')?.value === 'card'" class="text-sm text-gray-500">Cartão de Crédito</p>
                      <p *ngIf="paymentForm.get('paymentMethod')?.value === 'boleto'" class="text-sm text-gray-500">Boleto Bancário</p>
                      <p *ngIf="!paymentForm.get('paymentMethod')?.value" class="text-sm text-gray-500">Selecione na Etapa 2</p>
                  </div>
              </div>

              <!-- Botão de Submissão Final (Coluna 2) -->
              <!-- CORREÇÃO: Adicionando o atributo form="paymentForm" para vincular ao formulário da coluna 1 -->
              <button type="submit" form="paymentForm" 
                [disabled]="addressForm.invalid || paymentForm.invalid || cartTotal() === 0 || isSubmitting()"
                class="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSubmitting() ? 'Processando...' : ('Concluir Pedido (' + (cartTotal() | currency:'BRL') + ')') }}
              </button>

              <p class="text-xs text-center text-gray-500 mt-3">Ao finalizar, você concorda com nossos termos e condições.</p>
            </div>
          </section>
        </div>
      </main>
    `,
    styles: [`
      /* Adicionando alguns estilos para rolagem e sticky */
      .sticky {
          position: sticky;
          top: 2rem; /* Distância do topo */
      }
    `]
  })
  export class CheckoutComponent {
    private fb = inject(FormBuilder);
    private apiService = inject(ApiService);
    private router = inject(Router); 
    private cartService = inject(CartService);
    
    private mockCartService = new MockCartService(); 

    isSubmitting = signal(false); 
    submissionError = signal<string | null>(null);
    
    cartItems = this.cartService.items;
    cartTotal: Signal<number> = this.mockCartService.cartTotal;
    
    addressForm: FormGroup;
    paymentForm: FormGroup;
    cepStatus: 'initial' | 'loading' | 'success' | 'error' = 'initial';
    
    private baseInputClasses = 'w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150';

    constructor() {
      this.addressForm = this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        logradouro: [''], 
        numero: ['', Validators.required],
        complemento: [''],
        bairro: [''],
        cidade: [''],
        estado: ['', [Validators.required, Validators.maxLength(2)]],
      });

      this.paymentForm = this.fb.group({
        paymentMethod: ['', Validators.required], // 'card' ou 'boleto'
        cardDetails: this.fb.group({
          cardNumber: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(19)]],
          expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]], // MM/AA
          cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
        }),
      });

      this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
        const cardDetails = this.paymentForm.get('cardDetails');
        if (method === 'card') {
          cardDetails?.enable();
          cardDetails?.get('cardNumber')?.setValidators([Validators.required, Validators.minLength(13), Validators.maxLength(19)]);
          cardDetails?.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]);
          cardDetails?.get('cvv')?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(4)]);
        } else {
          cardDetails?.disable();
          cardDetails?.get('cardNumber')?.clearValidators();
          cardDetails?.get('expiryDate')?.clearValidators();
          cardDetails?.get('cvv')?.clearValidators();
        }
        cardDetails?.updateValueAndValidity();
      });
      
      this.paymentForm.get('cardDetails')?.disable();
    }

    // MÉTODO CORRIGIDO para evitar o erro TS2322. Usamos 'AbstractControl' com verificação de tipo.
    getCardDetailsGroup(): FormGroup | null {
      const control = this.paymentForm.get('cardDetails');
      return control instanceof FormGroup ? control : null;
    }

    isPaymentMethodInvalid(): boolean {
        const control = this.paymentForm.get('paymentMethod');
        return !!control && control.invalid && (control.dirty || control.touched);
    }

    isFieldInvalid(field: string, formGroup: FormGroup | AbstractControl | null = this.addressForm): boolean {
      if (!formGroup) return false;
      // Se for um AbstractControl, precisamos verificar se é um FormGroup antes de usar get(field)
      const control = formGroup instanceof FormGroup ? formGroup.get(field) : formGroup.get(field); 
      return !!control && control.invalid && (control.dirty || control.touched);
    }

    getInputClasses(field: string, isApiField: boolean = false, formGroup: FormGroup | AbstractControl | null = this.addressForm): string {
      if (!formGroup || !(formGroup instanceof FormGroup)) return this.baseInputClasses;
      
      const control = formGroup.get(field);
      let classes = this.baseInputClasses;

      if (isApiField && control && control.value) {
          classes += ' bg-gray-50';
      } else {
          classes += ' border-gray-300';
      }

      if (this.isFieldInvalid(field, formGroup)) {
        classes = classes.replace('border-gray-300', 'border-red-500');
        classes = classes.replace('focus:ring-green-500', 'focus:ring-red-500');
        classes = classes.replace('focus:border-green-500', 'focus:border-red-500');
      }

      if (control && control.disabled) {
          classes += ' bg-gray-200 cursor-not-allowed';
      }
      
      return classes;
    }
    
    buscarCep(): void {
      const cep = this.addressForm.get('cep')?.value;

      if (this.addressForm.get('cep')?.valid) {
        this.cepStatus = 'loading';
        this.addressForm.disable(); 

        this.apiService.buscarCep(cep)
          .pipe(
            tap((response: EnderecoResponse) => {
              this.addressForm.patchValue({
                logradouro: response.logradouro,
                bairro: response.bairro,
                cidade: response.cidade,
                estado: response.estado
              });
              this.cepStatus = 'success';
              this.addressForm.enable();
              this.addressForm.get('cep')?.enable(); 
            }),
            catchError((error) => {
              console.error('Erro ao buscar CEP:', error);
              this.cepStatus = 'error';
              this.addressForm.enable();
              this.addressForm.get('cep')?.enable(); 
              
              this.addressForm.patchValue({
                logradouro: '',
                bairro: '',
                cidade: '',
                estado: ''
              });
              return of(null);
            })
          )
          .subscribe();
      }
    }

    onSubmit(): void {
      this.submissionError.set(null);
      
      this.addressForm.markAllAsTouched();
      this.paymentForm.markAllAsTouched();
      
      // CORREÇÃO DE TIPAGEM: Usamos o método getCardDetailsGroup() para obter o FormGroup
      const cardDetailsGroup = this.getCardDetailsGroup();
      if (this.paymentForm.get('paymentMethod')?.value === 'card' && cardDetailsGroup) {
          cardDetailsGroup.markAllAsTouched();
      }

      if (this.addressForm.valid && this.paymentForm.valid && this.cartTotal() > 0) {
        
        this.isSubmitting.set(true);
        
        const orderData: OrderData = {
            address: this.addressForm.value,
            payment: this.paymentForm.value,
            items: this.cartItems().map(item => ({
                id: item.product.id,
                name: item.product.title,
                quantity: item.quantity,
                price: item.price,
            })),
            total: this.cartTotal()
        };

        console.log('Enviando Dados do Pedido:', orderData);
        
        this.apiService.submitOrder(orderData).subscribe({
            next: (response: OrderResponse) => {
                console.log('Pedido Enviado com Sucesso:', response);
                alert('SALVANDO PEDIDO');
                console.log('SALVANDO PEDIDO:', response);
                this.cartService.setLastOrder(response);                
                // 3. CORREÇÃO: Redireciona primeiro, e só depois de tentar o redirecionamento limpa o carrinho
                this.router.navigate(['/order-confirmation'], {
                    state: { orderData: response }
                }).then(success => {
                    if (success) {
                        this.mockCartService.clearCart(); // Limpa o mock do carrinho APÓS O REDIRECIONAMENTO (se a rota existir)
                        console.log("Carrinho Limpo e Redirecionamento bem-sucedido.");
                    } else {
                        // Se a navegação falhou (provavelmente a rota não existe ainda), limpa o carrinho para simular
                        console.warn("Navegação falhou (rota /order-confirmation não existe). Limpando carrinho para simulação.");
                        this.mockCartService.clearCart();
                    }
                });
            },
            error: (err) => {
                console.error('Erro ao enviar pedido para a API', err);
                this.submissionError.set(err.error?.message || 'Ocorreu um erro inesperado ao finalizar o pedido. Verifique o console para mais detalhes.');
            },
            complete: () => {
                this.isSubmitting.set(false);
            }
        });
        
      } else {
        console.log('Falha na Submissão: Formulário inválido ou carrinho vazio.');
        this.submissionError.set('Por favor, preencha todos os campos obrigatórios e verifique se o carrinho não está vazio.');
      }
    }
  }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Tipagem básica para a resposta da API do CEP
export interface EnderecoResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Tipagem para os dados do pedido (enviado pelo Angular)
export interface OrderData {
  address: any; 
  payment: any;
  items: { id: number; quantity: number; price: number }[];
  total: number;
}

// Tipagem para a resposta de sucesso da API de pedidos
export interface OrderResponse {
    message: string;
    orderId: string;
    total: number;
    timestamp: number;

    items: {
        id: number;
        name: string;
        quantity: number;
        price: number;
    }[];

    payment: {
        paymentMethod: 'card' | 'boleto';
    };

    address: {
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  // URL base para sua API em PHP (ajuste se necessário, mas geralmente é 'api/')
  private apiUrl = 'http://localhost/api/';

  // Endpoint para buscar CEP (MANTIDO IGUAL)
  buscarCep(cep: string): Observable<EnderecoResponse> {
    const url = `${this.apiUrl}buscar-cep.php?cep=${cep}`;
    return this.http.get<EnderecoResponse>(url);
  }

  // NOVO: Endpoint para submeter o pedido
  submitOrder(orderData: OrderData): Observable<OrderResponse> {
    const url = `${this.apiUrl}orders.php`;
    // O Angular (HttpClient) lida automaticamente com o cabeçalho Content-Type: application/json
    return this.http.post<OrderResponse>(url, orderData);
  }
}

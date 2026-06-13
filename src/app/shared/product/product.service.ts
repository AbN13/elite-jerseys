import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

// Interface COMPLETA com todos os campos do banco
export interface Product {
  id: number;
  title: string;
  preco: number;
  imagem: string;
  qtd_estoque: number;

  clube?: string;
  liga?: string;
  temporada?: string;
  patrocinador?: string;
  pais?: string;
  tamanho?: string;

  descricao?: string;
}

// Interface para o cálculo do frete
export interface ShippingInfo {
  prazo: string;
  valor: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // URL apontando para seu PHP no XAMPP (via proxy)
  private productsUrl = 'http://localhost/api/products.php';
  private productDetailUrl = 'http://localhost/api/product_detail.php';

  constructor(private http: HttpClient) {}

  // Retorna todos os produtos como signal
  getProducts() {
    return toSignal(this.http.get<Product[]>(this.productsUrl), {
      initialValue: [],
    });
  }

  // Busca um produto específico pelo ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.productDetailUrl}?id=${id}`);
  }

  // Simula cálculo de frete (pode depois apontar para um PHP real)
  calculateShipping(cep: string): Observable<ShippingInfo> {
    const freteSimulado: ShippingInfo = {
      prazo: '5-7 dias úteis',
      valor: 25.0,
    };
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next(freteSimulado);
        observer.complete();
      }, 500);
    });
  }
}

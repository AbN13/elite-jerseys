import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component'; 
// NOVO: Adicione a importação do OrderConfirmationComponent
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home | Elite Jerseys'
  },
  {
    path: 'jerseys',
    component: ProductsComponent,
    title: 'Jerseys | Elite Jerseys'
  },
  {
    path: 'jerseys/:id', // Rota de detalhe do produto
    component: ProductDetailComponent,
    title: 'Product Detail | Elite Jerseys'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About | Elite Jerseys'
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact | Elite Jerseys'
  },
  { 
      path: 'checkout',
      component: CheckoutComponent,
      title: 'Checkout | Elite Jerseys'
  }, 
  // ROTA NOVA: Confirmação do Pedido
  {
    path: 'order-confirmation',
    component: OrderConfirmationComponent,
    title: 'Confirmação do Pedido | Elite Jerseys'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

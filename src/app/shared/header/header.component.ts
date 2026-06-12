import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { CartService } from '../../shared/cart/cart.service'; // <- ajuste se seu header estiver em outra pasta

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  cart = inject(CartService);
}

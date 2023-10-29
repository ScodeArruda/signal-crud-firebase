import { Component } from '@angular/core';
import { FiredbService } from '../../service/firedb.service';

@Component({
  selector: 'app-productsummary',
  templateUrl: './productsummary.component.html',
  styleUrls: ['./productsummary.component.css']
})
export class ProductsummaryComponent {
  products: any[] = [];
  public totalqty: any;
  constructor(private fireService: FiredbService,) { }

  ngOnInit(): void {
    this.fireService.getProducts().subscribe((data: any[]) => {
      this.products = data;
    });
  }

  calculateTotalQty(): number {
    // Soma a quantidade total de produtos
    return this.products.reduce((total, product) => total + Number(product.qty), 0);
  }  

  calculateSummaryTotal(): number {
    // Calcula o resumo total
    return this.products.reduce((total, product) => total + parseFloat(product.total.toString().replace(',', '.')), 0);
  }

  calculateSummaryTax(): number {
    // Calcula o resumo do imposto (7% do resumo total)
    return (this.calculateSummaryTotal() * 7) / 100;
  }

  calculateSummaryNetTotal(): number {
    // Calcula o resumo total + imposto
    return this.calculateSummaryTotal() + this.calculateSummaryTax();
  }

}

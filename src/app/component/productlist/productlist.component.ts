import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FiredbService } from 'src/app/service/firedb.service';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css']
})
export class ProductlistComponent {
  products: any[] = [];
  selectedProduct: any = {
    code: '',
    slno: 0,
    name: '',
    qty: 0,
    price: 0,
    total: 0,
  };
  closeResult = '';
  loading = false;

  constructor(
    private fireService: FiredbService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.fireService.getProducts().subscribe((data: any[]) => {
      this.products = data;
      this.loading = false;
    });
  }

  loadProductData(product: any): void {
    // Carregue os dados do produto selecionado com base no campo "code"
    const selectedProduct = this.products.find((p) => p.code === product.code);

    if (selectedProduct) {
      this.selectedProduct = { ...selectedProduct };
    }
  }

  updateProduct(): void {
    // Remova todos os pontos e vírgulas do valor antes de atualizar
    const priceWithoutCommas = this.selectedProduct.price.replace(/[,]/g, '.');

    // Recalcula o total após a atualização bem-sucedida
    const newTotal = this.selectedProduct.qty * parseFloat(priceWithoutCommas);

    // Atualize o produto no banco de dados com o novo valor total
    this.fireService.updateProduct(this.selectedProduct.code, {
      name: this.selectedProduct.name,
      qty: this.selectedProduct.qty,
      price: priceWithoutCommas,
      total: newTotal,
    })
      .then(() => {
        this.selectedProduct.total = newTotal; // Atualiza o valor total no seu objeto local

        console.log('Produto atualizado com sucesso.');
        // Limpe os campos após a atualização
        this.clearFields();
      })
      .catch((error) => {
        console.error('Erro ao atualizar o produto:', error);
      });
  }

  clearFields(): void {
    this.selectedProduct = {
      code: '',
      slno: 0,
      name: '',
      qty: 0,
      price: 0,
    };
  }
}
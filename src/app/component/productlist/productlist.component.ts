import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { FiredbService } from 'src/app/service/firedb.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(-100%)' })),
      transition('in => out', animate('0.2s ease-in')),
      transition('out => in', animate('0.2s ease-out'))
    ])
  ]
})
export class ProductlistComponent {
  products: any[] = [];
  selectedProduct: any = {
    key: '',
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
    const selectedProduct = this.products.find((p) => p.key === product.key);

    if (selectedProduct) {
      this.selectedProduct = { ...selectedProduct };
    }
  }

  updateProduct(): void {
    const key = this.selectedProduct.key;

  // Certifique-se de que 'price' seja uma string usando 'toString()'
  const priceWithoutCommas = this.selectedProduct.price.toString().replace(/[,]/g, '.');

  // Recalcula o total após a atualização bem-sucedida
  const newTotal = this.selectedProduct.qty * parseFloat(priceWithoutCommas);
    
    // Atualize o produto no banco de dados com o novo valor total
    this.fireService.updateProduct(key, {
      name: this.selectedProduct.name,
      qty: this.selectedProduct.qty,
      price: priceWithoutCommas,
      total: newTotal,
    })
      .then(() => {
        this.selectedProduct.total = newTotal; // Atualiza o valor total no seu objeto local
        Swal.fire({
          position: 'top',
          icon: 'success',
          title: 'Produto atualizado com sucesso.',
          showConfirmButton: false,
          timer: 2500
        });
        // Limpe os campos após a atualização
        this.clearFields();
      })
      .catch((error) => {
        console.error('Erro ao atualizar o produto:', error);
      });
  }

  clearFields(): void {
    this.selectedProduct = {
      key: '',
      slno: 0,
      name: '',
      qty: 0,
      price: 0,
    };
  }

  onDeleteProduct(index: number) {
    const product = this.products[index];
    if (product) {
      const productKey = product.key;
  
      this.fireService.deleteProduct(productKey)
        .then(() => {
          Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'Produto excluído com sucesso',
            showConfirmButton: false,
            timer: 1500
          })
        })
        .catch((error) => {
          console.error('Erro ao excluir o produto: ' + error, 'Erro');
        });
    }
  }
  
}
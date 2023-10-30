import { Component } from '@angular/core';
import { FiredbService } from 'src/app/service/firedb.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css']
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
    unformattedPrice: 0,
  };
  closeResult = '';
  loading = false;
  editingEnabled = false;

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
    // Carregue os dados do produto selecionado com base na chave "key"
    const selectedProduct = this.products.find((p) => p.key === product.key);
    this.editingEnabled = true;

    if (selectedProduct) {
      this.selectedProduct = {
        ...selectedProduct,
        unformattedPrice: selectedProduct.price // Inicialize unformattedPrice com o valor de price
      };
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
        // Desabilite o modo de edição automaticamente após a atualização
        this.editingEnabled = false;
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
  
      Swal.fire({
        title: 'Tem certeza que deseja excluir este item?',
        showDenyButton: true,
        // showCancelButton: true,
        confirmButtonText: 'Sim',
        customClass: {
          actions: 'my-actions',
          cancelButton: 'order-1 right-gap',
          confirmButton: 'order-2',
          denyButton: 'order-3',
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Confirmação de exclusão, prosseguir com a exclusão
          this.fireService.deleteProduct(productKey)
            .then(() => {
              Swal.fire('Produto excluído com sucesso!', '', 'success');
            })
            .catch((error) => {
              console.error('Erro ao excluir o produto: ' + error, 'Erro');
              Swal.fire('Erro ao excluir o produto', '', 'error');
            });
        } else if (result.isDenied) {
          Swal.fire('Exclusão cancelada', '', 'info');
        }
      });
    }
  }

}
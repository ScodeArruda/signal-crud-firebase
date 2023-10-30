import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { FiredbService } from '../../service/firedb.service';

@Component({
  selector: 'app-productadd',
  templateUrl: './productadd.component.html',
  styleUrls: ['./productadd.component.css']
})

export class ProductAddComponent {

  btntext = 'Add Produto';
  isButtonEnabled: boolean = false;
  currentSlno: number = 1; // Variável para controlar o slno
  currentProductCode: number = 1; // Variável para controlar o código do produto

  constructor(private builder: FormBuilder, private firedbService: FiredbService) { }

  productform = this.builder.group({
    slno: this.builder.control(0),
    name: this.builder.control(''),
    qty: this.builder.control(0),
    price: this.builder.control(0),
    total: this.builder.control(0)
  });

  formatInput(event: any, field: string) {
    const value = event.target.value;
    // Substitua vírgulas por pontos (formato pt-BR para número)
    const formattedValue = value.replace(',', '.');
    // Atualize o valor do campo com a versão formatada
    this.productform.get(field)?.setValue(formattedValue);
    this.checkButtonValidity();
  }

  checkButtonValidity() {
    const name = this.productform.value.name;
    const qty = parseFloat(this.productform.value.qty as any);
    const price = parseFloat(this.productform.value.price as any);

    // Verifica se os campos não são nulos ou indefinidos e se qty e price são números válidos e maiores que zero
    this.isButtonEnabled = !!name && !isNaN(qty) && !isNaN(price) && qty > 0 && price > 0;
  }

  AddProduct() {
    const qtyValue = this.productform.value.qty;
    const priceValue = this.productform.value.price;
  
    if (qtyValue !== null && priceValue !== null) {
      const _qty = parseFloat(qtyValue!.toString().replace(',', '.')) as number;
      const _price = parseFloat(priceValue!.toString().replace(',', '.')) as number;
      const _total = _qty * _price;
      const _slno = this.productform.value.slno as number;
  
      if (_slno == 0) {
        // Crie um novo FormGroup com os valores do SalesProduct
        const _objFormGroup: FormGroup = this.builder.group({
          slno: this.builder.control(0),
          name: this.builder.control(this.productform.value.name),
          price: this.builder.control(_price),
          qty: this.builder.control(_qty),
          total: this.builder.control(_total), // O campo "total" será calculado
        });
  
        // Recupere o número total de produtos no banco de dados
        this.firedbService.getTotalProductCount().then((count) => {
          const _slno = count + 1; // Incrementa o valor sequencial de slno
          _objFormGroup.controls.slno.setValue(_slno);
  
          this.firedbService.AddProduct(_objFormGroup)
            .then(() => {
              Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Produto cadastrado com sucesso.',
                showConfirmButton: false,
                timer: 2500
              })
              // Resultado da adição bem-sucedida, você pode processá-lo se necessário
              this.productform.setValue({
                slno: 0,
                name: '',
                qty: 0,
                price: 0,
                total: 0
              });
              this.btntext = 'Add Produto';
            })
            .catch((error) => {
              // Trate o erro, se houver
              console.error('Erro ao adicionar o produto:', error);
            });
        });
      } else {
        // Use o serviço FiredbService para atualizar o produto (se necessário)
        // Você deve implementar um método de atualização em FiredbService
      }
    }
  }  
  

  productchange(element: any) {
    let productname = element.target['options'][element.target['options'].selectedIndex].text;
    this.productform.controls['name'].setValue(productname);
  }
}
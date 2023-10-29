import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiredbService {

  constructor(private db: AngularFireDatabase) { }

  AddProduct(productForm: FormGroup): Promise<any> {
    return new Promise((resolve, reject) => {
      const productData = productForm.value;
      // Você pode adicionar validações adicionais aqui

      // Adicione os dados do produto ao Realtime Firebase
      this.db.list('products')
        .push(productData)
        .then((result) => {
          // O resultado contém informações sobre o novo nó adicionado, se necessário
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getTotalProductCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.database.ref('products').once('value')
        .then((snapshot) => {
          const count = snapshot.numChildren(); // Retorna o número de filhos (produtos)
          resolve(count);
        })
        .catch((error) => {
          console.error('Erro ao recuperar a contagem de produtos:', error);
          reject(error);
        });
    });
  }

  // getProducts(): Observable<any> {
  //   return this.db.list('products/').valueChanges();
  // }

  updateProduct(code: string, updatedProduct: any) {
    return new Promise<void>((resolve, reject) => {
      this.db.list('products', (ref) => ref.orderByChild('code').equalTo(code))
        .snapshotChanges()
        .pipe(take(1))
        .subscribe((snapshots) => {
          if (snapshots && snapshots.length > 0) {
            const productKey = snapshots[0].payload.key;
            this.db.object(`products/${productKey}`).update(updatedProduct)
              .then(() => {
                console.log('Produto atualizado com sucesso.');
                resolve();
              })
              .catch((error) => {
                console.error('Erro ao atualizar o produto:', error);
                reject(error);
              });
          } else {
            console.error('Produto não encontrado para atualização.');
            reject('Produto não encontrado');
          }
        });
    });
  }  

  // Método para obter a lista de produtos a partir do Firebase Realtime Database
  getProducts() {
    return this.db.list('products').valueChanges();
  }

}

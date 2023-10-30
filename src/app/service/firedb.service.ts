import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { SalesProduct } from '../model/salesproduct';

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

  updateProduct(key: string, updatedProduct: any) {
    return new Promise<void>((resolve, reject) => {
      this.db.object(`products/${key}`).update(updatedProduct)
        .then(() => {
          // console.log('Produto atualizado com sucesso.');
          resolve();
        })
        .catch((error) => {
          console.error('Erro ao atualizar o produto:', error);
          reject(error);
        });
    });
  }

  // Método para obter a lista de produtos a partir do Firebase Realtime Database com as chaves
  getProducts() {
    return this.db.list('products').snapshotChanges().pipe(
      map((snapshots) => {
        return snapshots.map((snapshot) => {
          const key = snapshot.payload.key;
          const data = snapshot.payload.val() as SalesProduct;
          return { key, ...data };
        });
      })
    );
  }

  // Método para excluir um produto com base em sua chave (key)
  deleteProduct(productKey: string) {
    return this.db.object(`products/${productKey}`).remove();
  }

}

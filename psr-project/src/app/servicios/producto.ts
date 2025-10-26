import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoDto {
  id: number;
  nombre: string;
  descripcion: string; 
  precio: number;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})

export class Producto { 

  // URL base de tu microservicio de Productos 
  private apiUrl = 'http://localhost:8081/api/productos';

  constructor(private http: HttpClient) { }

  listarProductos(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(`${this.apiUrl}/listar`);
  }

  guardarProducto(producto: ProductoDto): Observable<void> {
    const url = `${this.apiUrl}/agregar`;
    // El backend espera un ProductoDto, lo enviamos en el body
    return this.http.post<void>(url, producto);
  }

  //buscar por tipo y ... faltan
}
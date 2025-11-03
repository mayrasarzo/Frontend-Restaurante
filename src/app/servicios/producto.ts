import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoProducto } from '../enums/tipo-producto.enum';

export interface ProductoDto {
  id: number;
  nombre: string;
  descripcion: string; 
  precio: number;
  tipo: TipoProducto;
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

  buscarProductoPorId(id: number): Observable<ProductoDto> {
    return this.http.get<ProductoDto>(`${this.apiUrl}/buscar/${id}`);
  }

  buscarPorTipo(tipo: TipoProducto): Observable<ProductoDto[]> {
    // Corregido: La ruta es /tipo/{tipo}
    return this.http.get<ProductoDto[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  eliminarProducto(id: number): Observable<void> {
    // Corregido: El método es POST y el 'id' va en el body
    return this.http.post<void>(`${this.apiUrl}/eliminar`, id);
  }

  //buscar por tipo y ... faltan
}
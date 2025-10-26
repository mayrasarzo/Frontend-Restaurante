import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor, *ngIf
import { Producto, ProductoDto } from '../../servicios/producto';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-lista.html', 
  styleUrls: ['./producto-lista.css']   
})
export class ProductoLista {
  productos: ProductoDto[] = []; // Array para guardar el menú
  error: string | null = null; 

  // Inyectamos el servicio de Productos
  constructor(private productoService: Producto) {} 

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.error = null; 
    this.productoService.listarProductos() // Llama al servicio
      .subscribe({
        next: (data) => {
          this.productos = data; // Guarda los productos
          if (data.length === 0) {
            // this.error = 'No hay productos cargados en el menú.';
          }
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.error = 'No se pudo cargar el menú. ¿El servicio de productos (ms-productos) está corriendo?';
          this.productos = [];
        }
      });
  }

}

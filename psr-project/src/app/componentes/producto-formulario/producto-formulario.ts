import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Producto, ProductoDto } from '../../servicios/producto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto-formulario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './producto-formulario.html', 
  styleUrls: ['./producto-formulario.css']   
})
export class ProductoFormulario {
  mensajeAccion: string | null = null; // Para feedback

  // Objeto para vincular con los inputs del formulario
  nuevoProducto: ProductoDto = {
    id: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    tipo: '' // Sin valor inicial, forzamos selección
  };
  // Opciones para el tipo de producto
  tiposProducto: string[] = ['plato', 'postre', 'bebida'];

  // Inyectamos Servicio y Router
  constructor(
    private productoService: Producto, // O 'Producto'
    private router: Router // Para volver a la lista
  ) {}

  agregarNuevoProducto(): void {
    this.mensajeAccion = null; // Limpia mensajes previos

    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio || this.nuevoProducto.precio <= 0 || !this.nuevoProducto.tipo) {
      this.mensajeAccion = 'Error: Nombre, Precio (>0) y Tipo son obligatorios.';
      return;
    }

    this.mensajeAccion = `Guardando "${this.nuevoProducto.nombre}"...`;

    // Llamamos al servicio para guardar
    this.productoService.guardarProducto(this.nuevoProducto)
      .subscribe({
        next: () => {
          this.mensajeAccion = `¡Producto "${this.nuevoProducto.nombre}" guardado con éxito! Volviendo a la lista...`;
          // Navegamos de vuelta a la lista después de un pequeño retraso
          setTimeout(() => {
            this.router.navigate(['/productos']);
          }, 1500); // Espera 1.5 segundos
        },
        error: (err) => {
          console.error('Error al guardar producto:', err);
          this.mensajeAccion = `Error al guardar el producto. Detalles: ${err.message || 'Error desconocido'}`;
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/productos']); // Vuelve a la lista
  }
}

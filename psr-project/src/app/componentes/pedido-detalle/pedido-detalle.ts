import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Producto, ProductoDto } from '../../servicios/producto'; 
import { PedidoRequest, Venta } from '../../servicios/venta';

// Interfaz para representar un item dentro del pedido actual en el frontend
interface PedidoItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

// Interfaz para el pedido que estamos construyendo
interface PedidoActual {
  mesaId: number;
  items: PedidoItem[];
}

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pedido-detalle.html', 
  styleUrls: ['./pedido-detalle.css'] 
})

export class PedidoDetalle implements OnInit{
  mesaId: number | null = null;
  productos: ProductoDto[] = [];
  errorCargaProductos: string | null = null;
  pedidoActual: PedidoActual = { mesaId: 0, items: [] };
  mensajeAccion: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productoService: Producto,
    private ventaService: Venta, // Inyecta VentaService
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('mesaId');
    if (idParam) {
      this.mesaId = parseInt(idParam, 10);
      this.pedidoActual = { mesaId: this.mesaId, items: [] }; 
    } else {
      console.error('No se encontró el ID de la mesa en la URL');
      this.errorCargaProductos = 'Error: Falta el ID de la mesa.';
    }
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.errorCargaProductos = null;
    this.productoService.listarProductos()
      .subscribe({
        next: (data) => {
          this.productos = data;
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.errorCargaProductos = 'No se pudo cargar el menú. ¿El servicio de productos está corriendo?';
        }
      });
  }
  // --- Función para agregar al pedido ---
  agregarAlPedido(producto: ProductoDto): void {
    this.mensajeAccion = null; // Limpia mensajes previos
    
    // Busca si el producto ya está en el pedido
    const itemExistente = this.pedidoActual.items.find(item => item.productoId === producto.id);

    if (itemExistente) {
      // Si ya existe, incrementa la cantidad
      itemExistente.cantidad++;
      this.mensajeAccion = `Se añadió otra unidad de ${producto.nombre}. Total: ${itemExistente.cantidad}`;
    } else {
      // Si no existe, lo añade como un nuevo item
      const nuevoItem: PedidoItem = {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precio 
      };
      this.pedidoActual.items.push(nuevoItem);
      this.mensajeAccion = `${producto.nombre} añadido al pedido.`;
    }
    console.log('Pedido actual:', this.pedidoActual);
  }

  // --- Funciones para manejar el pedido (enviarPedido sigue vacío por ahora) ---
  enviarPedido(): void {
    this.mensajeAccion = 'Enviando pedido...';
    this.errorCargaProductos = null; // Clear previous errors

    // 1. Preparamos el objeto PedidoRequest que espera el backend
    //    Necesitamos mapear nuestro PedidoItem a la estructura {productoId, cantidad}
    const pedidoParaEnviar: PedidoRequest = {
      mesaId: this.pedidoActual.mesaId,
      items: this.pedidoActual.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      })) // Creamos un nuevo array solo con id y cantidad
    };

    // 2. Llamamos al servicio
    this.ventaService.crearPedido(pedidoParaEnviar)
      .subscribe({
        next: () => {
          // Éxito
          this.mensajeAccion = '¡Pedido creado con éxito!';
          // Limpiamos el pedido actual después de enviarlo
          this.pedidoActual.items = [];
          // Opcional: Redirigir de vuelta a la lista de mesas después de un tiempo
          setTimeout(() => {
            this.router.navigate(['/mesas']);
          }, 2000); // Espera 2 segundos antes de redirigir
        },
        error: (err) => {
          // Error
          console.error('Error al crear el pedido:', err);
          // Intentamos obtener un mensaje más específico si el backend lo envía
          const errorMsg = err.error?.message || err.message || 'Error desconocido al crear el pedido.';
          this.mensajeAccion = `Error: ${errorMsg}. Revisa la consola para más detalles.`;
        }
      });
    }

  // (Opcional) Función para quitar un item del pedido
  quitarDelPedido(productoId: number): void {
     this.mensajeAccion = null;
     const index = this.pedidoActual.items.findIndex(item => item.productoId === productoId);
     if (index !== -1) {
       const item = this.pedidoActual.items[index];
       if (item.cantidad > 1) {
         item.cantidad--;
         this.mensajeAccion = `Se quitó una unidad de ${item.nombre}. Quedan: ${item.cantidad}`;
       } else {
         this.mensajeAccion = `${item.nombre} eliminado del pedido.`;
         this.pedidoActual.items.splice(index, 1); // Elimina el item del array
       }
     }
  }

  // (Opcional) Calcula el subtotal
  calcularSubtotal(): number {
    let subtotal = 0;
    for(const item of this.pedidoActual.items) {
      subtotal += item.cantidad * item.precioUnitario;
    }
    return subtotal;
  }
}

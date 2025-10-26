import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common'; // Para *ngFor, *ngIf
import { Venta, MesaDto } from '../../servicios/venta'; // Importamos el servicio
import { Router } from '@angular/router'; // Importamos Router para navegar
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mesa-lista',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './mesa-lista.html', // Asegúrate que el nombre del HTML sea correcto
  styleUrls: ['./mesa-lista.css'] // Asegúrate que el nombre del CSS sea correcto
})
export class MesaLista implements OnInit{
  mesas: MesaDto[] = []; //lisa mesas
  error: string | null = null;
  mensajeAccion: string | null = null; // Para mensajes de éxito/error al reservar
  nuevoNumeroMesa: number | null = null;

  //inyectamos
  constructor(
    private ventaService: Venta,
    private router: Router 
    ) {}

  // Se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.cargarMesas(); 
  }

  // Llama al servicio para obtener las mesas
  cargarMesas(): void {
    this.error = null; 
    this.ventaService.listarMesas() 
      .subscribe({ 
        next: (data) => { 
          this.mesas = data; 
        },
        error: (err) => { 
          console.error('Error al cargar mesas:', err);
          this.error = 'No se pudieron cargar las mesas. Revisa si el backend (ms-ventas) está corriendo.'; 
          this.mesas = []; 
        }
      });
  }

  agregarNuevaMesa(): void {
    this.error = null;
    this.mensajeAccion = null;

    if (this.nuevoNumeroMesa === null || this.nuevoNumeroMesa <= 0) {
      this.mensajeAccion = 'Por favor, ingresa un número de mesa válido.';
      return;
    }

    this.mensajeAccion = `Agregando mesa N° ${this.nuevoNumeroMesa}...`;

    const nuevaMesaDto: MesaDto = {
      id: 0, // 
      numero: this.nuevoNumeroMesa,
      estado: 'libre'
    };

    this.ventaService.crearMesa(nuevaMesaDto)
      .subscribe({
        next: () => {
          this.mensajeAccion = `¡Mesa N° ${this.nuevoNumeroMesa} agregada con éxito!`;
          this.nuevoNumeroMesa = null; 
          this.cargarMesas(); 
        },
        error: (err) => {
          console.error('Error al agregar mesa:', err);
          // Intentamos dar un mensaje útil
          let errorMsg = 'Error desconocido al agregar la mesa.';
          if (err.status === 500 && err.error?.message?.includes('Duplicate entry')) {
             errorMsg = `Ya existe una mesa con el número ${nuevaMesaDto.numero}.`;
          } else if (err.message) {
             errorMsg = err.message;
          }
          this.mensajeAccion = `Error: ${errorMsg}`;
        }
      });
  }

  verPedido(mesaId: number): void {
    // Navega a la ruta /pedido/mesa/{mesaId}
    this.router.navigate(['/pedido/mesa', mesaId]); 
    console.log(`Ver/Crear pedido para mesa ${mesaId}`); 
  }

  reservarMesa(mesaId: number): void {
     this.error = null; 
     this.mensajeAccion = 'Reservando...'; // Mensaje mientras espera

     this.ventaService.reservarMesa(mesaId) // Llama al nuevo método del servicio
       .subscribe({
         next: (mesaActualizada) => {
           // Éxito: Buscamos la mesa en nuestro array y actualizamos su estado
           const index = this.mesas.findIndex(m => m.id === mesaId);
           if (index !== -1) {
             this.mesas[index] = mesaActualizada; // Reemplazamos con la respuesta del backend
           }
           this.mensajeAccion = `Mesa N° ${mesaActualizada.numero} reservada con éxito!`;
           console.log('Mesa reservada:', mesaActualizada);
         },
         error: (err) => {
           console.error('Error al reservar mesa:', err);
           this.mensajeAccion = `Error al reservar mesa ${mesaId}. ¿Ya estaba reservada o cerrada?`;
           // Podríamos llamar a cargarMesas() para refrescar todo si falla
           // this.cargarMesas(); 
         }
       });
  }

  cerrarVenta(mesaId: number): void {
    this.error = null;
    this.mensajeAccion = `Cerrando venta para mesa ${mesaId}...`;

    this.ventaService.cerrarVentaPorMesa(mesaId) // Llama al nuevo método
      .subscribe({
        next: (pedidoCerrado) => {
          // Éxito: Actualizamos el estado de la mesa en la lista local
          const index = this.mesas.findIndex(m => m.id === mesaId);
          if (index !== -1) {
            this.mesas[index].estado = 'cerrada'; // Cambia el estado
            this.mensajeAccion = `Venta cerrada para mesa N° ${this.mesas[index].numero}. Total: $${pedidoCerrado.total}`;
          } else {
              this.mensajeAccion = `Venta cerrada (mesa no encontrada localmente). Total: $${pedidoCerrado.total}`;
          }
          console.log('Pedido cerrado:', pedidoCerrado);
          // Opcional: Recargar lista tras unos segundos
          // setTimeout(() => this.cargarMesas(), 3000);
        },
        error: (err) => {
          console.error('Error al cerrar venta:', err);
          this.mensajeAccion = `Error al cerrar venta para mesa ${mesaId}. Detalles: ${err.message || 'Error desconocido'}`;
        }
      });
  }
}

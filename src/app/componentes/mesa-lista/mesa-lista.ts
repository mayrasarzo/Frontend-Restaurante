import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Venta, MesaDto } from '../../servicios/venta'; 
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { EstadoMesa } from '../../enums/estado-mesa.enum';

@Component({
  selector: 'app-mesa-lista',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './mesa-lista.html',
  styleUrls: ['./mesa-lista.css']
})
export class MesaLista implements OnInit{
  public EstadoMesa = EstadoMesa;

  mesas: MesaDto[] = []; 
  
  mensajeInfo: string | null = null;
  mensajeError: string | null = null; 
  
  nuevoNumeroMesa: number | null = null;

  constructor(
    private ventaService: Venta,
    private router: Router 
    ) {}

  ngOnInit(): void {
    this.cargarMesas(); 
  }

  // Borra ambos mensajes
  private limpiarMensajes(): void {
    this.mensajeInfo = null;
    this.mensajeError = null;
  }

  // --- ¡NUEVA FUNCIÓN DE AYUDA! ---
  /**
   * Muestra un mensaje (info o error) que se borra solo después de 5 segundos.
   * @param tipo 'info' o 'error'
   * @param mensaje El texto a mostrar
   * @param recargar Opcional. Si es true, recarga las mesas después de 5 seg.
   */
  private mostrarMensaje(tipo: 'info' | 'error', mensaje: string, recargar: boolean = false): void {
    this.limpiarMensajes();

    if (tipo === 'info') {
      this.mensajeInfo = mensaje;
    } else {
      this.mensajeError = mensaje;
    }

    // Borra el mensaje y recarga
    setTimeout(() => {
      this.limpiarMensajes();
      if (recargar) {
        this.cargarMesas();
      }
    }, 1500); // 1 seg y medio
  }

  cargarMesas(): void {
    this.limpiarMensajes(); 
    
    this.ventaService.listarMesas() 
      .subscribe({ 
        next: (data) => { 
          this.mesas = data; 
        },
        error: (err) => { 
          console.error('Error al cargar mesas:', err);
          this.mostrarMensaje('error', 'No se pudieron cargar las mesas. Revisa si el backend (ms-ventas) está corriendo.');
          this.mesas = []; 
        }
      });
  }

  agregarNuevaMesa(): void {
    this.limpiarMensajes();

    if (this.nuevoNumeroMesa === null || this.nuevoNumeroMesa <= 0) {
      this.mostrarMensaje('error', 'Por favor, ingresa un número de mesa válido.');
      return;
    }

    this.mensajeInfo = `Agregando mesa N° ${this.nuevoNumeroMesa}...`; // Feedback instantáneo

    const nuevaMesaDto: MesaDto = {
      id: 0, 
      numero: this.nuevoNumeroMesa,
      estado: EstadoMesa.LIBRE
    };

    this.ventaService.crearMesa(nuevaMesaDto)
      .subscribe({
        next: () => {
          this.nuevoNumeroMesa = null; 
          this.mostrarMensaje('info', `¡Mesa N° ${nuevaMesaDto.numero} agregada con éxito!`, true);
        },
        error: (err) => {
          console.error('Error al agregar mesa:', err);
          let errorMsg = 'Error desconocido al agregar la mesa.';
          if (err.error && err.error.message?.includes('Duplicate entry')) {
             errorMsg = `Ya existe una mesa con el número ${nuevaMesaDto.numero}.`;
          } else if (err.error && err.error.message) {
             errorMsg = err.error.message;
          }
          this.mostrarMensaje('error', `Error: ${errorMsg}`, true);
        }
      });
  }

  verPedido(mesaId: number): void {
    this.router.navigate(['/pedido/mesa', mesaId]); 
  }

  reservarMesa(mesaId: number): void {
     this.limpiarMensajes(); 
     this.mensajeInfo = 'Reservando...'; // Feedback instantáneo

     this.ventaService.reservarMesa(mesaId) 
       .subscribe({
         next: (mesaActualizada) => {
           this.mostrarMensaje('info', `Mesa N° ${mesaActualizada.numero} reservada con éxito!`, true);
         },
         error: (err) => {
           console.error('Error al reservar mesa:', err);
           let errorMsg = '¿Ya estaba reservada o cerrada?';
           if (err.error && err.error.message) {
             errorMsg = err.error.message;
           }
           this.mostrarMensaje('error', `Error al reservar mesa: ${errorMsg}`, true);
         }
       });
  }

  cerrarVenta(mesaId: number): void {
    this.limpiarMensajes();
    this.mensajeInfo = `Cerrando venta para mesa ${mesaId}...`; // Feedback instantáneo

    this.ventaService.cerrarVentaPorMesa(mesaId) 
      .subscribe({
        next: (pedidoCerrado) => {
          this.mostrarMensaje('info', `Venta cerrada. Total: $${pedidoCerrado.total}`, true);
        },
        error: (err) => {
          console.error('Error al cerrar venta:', err);
          
          let errorMsg = 'Error desconocido.'; 
          
          if (err.error && err.error.message) {
            errorMsg = err.error.message;
          } 
          else if (err.error && typeof err.error === 'string') {
            errorMsg = err.error;
          }
          
          if (errorMsg.startsWith("No se encontró un pedido abierto para la mesa con id:")) {
            errorMsg = "No se encontró un pedido abierto.";
          }
          
          this.mostrarMensaje('error', `Error al cerrar venta: ${errorMsg}`, true);
        }
      });
  }
}
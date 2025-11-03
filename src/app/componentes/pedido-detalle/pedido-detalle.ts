import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Producto, ProductoDto } from '../../servicios/producto'; 
import { PedidoRequest, Venta } from '../../servicios/venta';
import { FormsModule } from '@angular/forms';
import { TipoProducto } from '../../enums/tipo-producto.enum';

declare var bootstrap: any;

// Interfaz para representar un item dentro del pedido actual en el frontend
interface PedidoItem {
  productoId: number | null; 
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  tipo: TipoProducto; 
}

// Interfaz para el pedido que estamos construyendo
interface PedidoActual {
  mesaId: number;
  items: PedidoItem[];
}

type TipoMenu = 'EJECUTIVO' | 'ESTUDIANTIL' | 'DEL_DIA';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pedido-detalle.html', 
  styleUrls: ['./pedido-detalle.css'] 
})

export class PedidoDetalle implements OnInit, AfterViewInit{
  @ViewChild('menuModalElement') menuModalElement!: ElementRef;
  private menuModal: any;


  mesaId: number | null = null;
  mesaNumero: number | null = null;

  productos: ProductoDto[] = [];
  errorCargaProductos: string | null = null;
  pedidoActual: PedidoActual = { mesaId: 0, items: [] };
  mensajeAccion: string | null = null;

  listaPlatos: ProductoDto[] = [];
  listaBebidas: ProductoDto[] = [];
  listaPostres: ProductoDto[] = [];

  platoSeleccionadoId: number | null = null;
  bebidaSeleccionadaId: number | null = null;
  postreSeleccionadoId: number | null = null;
  public TipoProducto = TipoProducto;
  tipoMenuSeleccionado: TipoMenu | null = null;

  // precios fijos MENUS
  readonly PRECIOS_FIJOS = {
    EJECUTIVO: 500,
    ESTUDIANTIL: 1000,
    DEL_DIA: 1200
  };

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
      this.pedidoActual.mesaId = this.mesaId; 
      this.cargarInfoMesa(this.mesaId); // <-- ¡NUEVO!
      this.cargarProductos();
    } else {
      console.error('No se encontró el ID de la mesa en la URL');
      this.errorCargaProductos = 'Error: Falta el ID de la mesa.';
    }
    this.cargarProductos();
  }

  cargarInfoMesa(id: number): void {
    this.ventaService.buscarMesaPorId(id).subscribe({
      next: (mesa) => {
        // Guardamos el NÚMERO de la mesa
        this.mesaNumero = mesa.numero;
      },
      error: (err) => {
        console.error('Error al cargar info de la mesa:', err);
        // Mostramos un error si no se encuentra
        this.errorCargaProductos = `Error al cargar datos de la mesa: ${err.error?.message || 'No se encontró la mesa.'}`;
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.menuModal = new bootstrap.Modal(this.menuModalElement.nativeElement);
  }

  cargarProductos(): void {
    this.errorCargaProductos = null;
    this.productoService.listarProductos()
      .subscribe({
        next: (data) => {
          this.productos = data;
          this.listaPlatos = data.filter(p => p.tipo === TipoProducto.PLATO);
          this.listaBebidas = data.filter(p => p.tipo === TipoProducto.BEBIDA);
          this.listaPostres = data.filter(p => p.tipo === TipoProducto.POSTRE);
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.errorCargaProductos = 'No se pudo cargar el menú. ¿El servicio de productos está corriendo?';
        }
      });
  }
  // --- Función para agregar al pedido ---
  agregarAlPedido(producto: ProductoDto): void {
    this.mensajeAccion = null; 
    const itemExistente = this.pedidoActual.items.find(item => 
      item.productoId === producto.id && item.productoId !== null
    );
    if (itemExistente) {
      itemExistente.cantidad++;
      this.mensajeAccion = `Se añadió otra unidad de ${producto.nombre}.`;
    } else {
      const nuevoItem: PedidoItem = {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precio,
        tipo: producto.tipo
      };
      this.pedidoActual.items.push(nuevoItem);
      this.mensajeAccion = `${producto.nombre} añadido al pedido.`;
    }
  }

  // --- Funciones para manejar el pedido (enviarPedido sigue vacío por ahora) ---
  enviarPedido(): void {
    this.mensajeAccion = 'Enviando pedido...';
    this.errorCargaProductos = null; 
    const pedidoParaEnviar: PedidoRequest = {
      mesaId: this.pedidoActual.mesaId,
      items: this.pedidoActual.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: (item.tipo === TipoProducto.PROMO) ? item.precioUnitario : undefined, 
        nombrePromocion: (item.tipo === TipoProducto.PROMO) ? item.nombre : undefined, 
        tipo: item.tipo
      }))
    };
    this.ventaService.crearPedido(pedidoParaEnviar)
      .subscribe({
        next: () => {
          this.mensajeAccion = '¡Pedido creado con éxito!';
          this.pedidoActual.items = [];
          setTimeout(() => {
            this.router.navigate(['/mesas']);
          }, 2000); 
        },
        error: (err) => {
          console.error('Error al crear el pedido:', err);
          const errorMsg = err.error?.message || err.message || 'Error desconocido al crear el pedido.';
          this.mensajeAccion = `Error: ${errorMsg}. Revisa la consola para más detalles.`;
        }
      });
    }

  quitarDelPedido(productoId: number | null, nombre?: string): void {
     this.mensajeAccion = null;
     let index = -1;
     if (productoId !== null) {
        index = this.pedidoActual.items.findIndex(item => item.productoId === productoId);
     } else {
        index = this.pedidoActual.items.findIndex(item => item.nombre === nombre);
     }
     if (index !== -1) {
       const item = this.pedidoActual.items[index];
       if (item.cantidad > 1) {
         item.cantidad--;
         this.mensajeAccion = `Se quitó una unidad de ${item.nombre}.`;
       } else {
         this.mensajeAccion = `${item.nombre} eliminado del pedido.`;
         this.pedidoActual.items.splice(index, 1); 
       }
     }
  }

  calcularSubtotal(): number {
    let subtotal = 0;
    for(const item of this.pedidoActual.items) {
      subtotal += item.cantidad * item.precioUnitario;
    }
    return subtotal;
  }

  abrirModalMenu(tipo: TipoMenu): void {
    this.platoSeleccionadoId = null;
    this.bebidaSeleccionadaId = null;
    this.postreSeleccionadoId = null;
    this.tipoMenuSeleccionado = tipo;
    this.mensajeAccion = null;
    
    // Muestra el modal de Bootstrap
    this.menuModal.show();
  }

  cerrarModalMenu(): void {
    // Oculta el modal de Bootstrap
    this.menuModal.hide();
    this.tipoMenuSeleccionado = null;
  }

  /**
   * Confirma la selección del menú y agrega los items al pedido
   */
  confirmarMenu(): void {
    if (!this.tipoMenuSeleccionado) return;
    const plato = this.productos.find(p => p.id === this.platoSeleccionadoId);
    const bebida = this.productos.find(p => p.id === this.bebidaSeleccionadaId);
    const postre = this.productos.find(p => p.id === this.postreSeleccionadoId);
    let precioFijo = 0;
    let sumaReal = 0;
    let itemsDelMenu: ProductoDto[] = [];
    if (!plato) {
      this.mensajeAccion = 'Error: Debes seleccionar un plato.';
      return;
    }
    itemsDelMenu.push(plato);
    sumaReal += plato.precio;
    if (this.tipoMenuSeleccionado === 'EJECUTIVO') {
        if (!bebida || !postre) {
          this.mensajeAccion = 'Error: Debes seleccionar bebida y postre.';
          return;
        }
        itemsDelMenu.push(bebida);
        itemsDelMenu.push(postre);
        sumaReal += bebida.precio + postre.precio;
        precioFijo = this.PRECIOS_FIJOS.EJECUTIVO;
    } 
    else if (this.tipoMenuSeleccionado === 'ESTUDIANTIL') {
        if (!bebida) {
          this.mensajeAccion = 'Error: Debes seleccionar una bebida.';
          return;
        }
        itemsDelMenu.push(bebida);
        sumaReal += bebida.precio;
        precioFijo = this.PRECIOS_FIJOS.ESTUDIANTIL;
    } 
    else if (this.tipoMenuSeleccionado === 'DEL_DIA') {
        if (!postre) {
          this.mensajeAccion = 'Error: Debes seleccionar un postre.';
          return;
        }
        itemsDelMenu.push(postre);
        sumaReal += postre.precio;
        precioFijo = this.PRECIOS_FIJOS.DEL_DIA;
    }
    for (const producto of itemsDelMenu) {
      this.agregarAlPedido(producto);
    }
    const descuento = precioFijo - sumaReal;
    if (descuento !== 0) {
      const itemDescuento: PedidoItem = {
        productoId: null,
        nombre: `Promo ${this.tipoMenuSeleccionado.toLowerCase()}`,
        cantidad: 1,
        precioUnitario: descuento,
        tipo: TipoProducto.PROMO
      };
      this.pedidoActual.items.push(itemDescuento);
    }

    this.cerrarModalMenu();
    this.mensajeAccion = `¡Menú ${this.tipoMenuSeleccionado.toLowerCase()} agregado (Precio Fijo: $${precioFijo})!`;
  }
}

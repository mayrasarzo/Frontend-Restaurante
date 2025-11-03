import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Para hacer llamadas HTTP
import { Observable } from 'rxjs'; // Para manejar respuestas asíncronas
import { TipoProducto } from '../enums/tipo-producto.enum';
import { EstadoPedido } from '../enums/estado-pedido.enum';
import { EstadoMesa } from '../enums/estado-mesa.enum';

export interface MesaDto {
  id: number;
  numero: number;
  estado: EstadoMesa;
}

export interface ProductoPedidoRequest {
  productoId: number | null; // <-- Aceptar null
  cantidad: number;
  nombrePromocion?: string;
  precioUnitario?: number; 
  tipo?: TipoProducto;     
}

export interface PedidoRequest {
  mesaId: number;
  items: ProductoPedidoRequest[];
}

export interface ProductoPedidoDto {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  tipo: TipoProducto;
}

export interface PedidoDto {
  id: number;
  mesaId: number;
  estado: EstadoPedido; 
  total: number;
  items: ProductoPedidoDto[];
}

@Injectable({
  providedIn: 'root'
})

export class Venta {
  // URL base de tu microservicio de Ventas
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) { }

  listarMesas(): Observable<MesaDto[]> {
    // Hace una petición GET a http://localhost:8080/api/ventas/mesas/listar
    return this.http.get<MesaDto[]>(`${this.apiUrl}/mesas/listar`);
  }

  crearMesa(mesa: MesaDto): Observable<void> {
    const url = `${this.apiUrl}/mesas/agregar`;
    return this.http.post<void>(url, mesa);
  }

  eliminarMesa(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mesas/eliminar`, id);
  }

  reservarMesa(idMesa: number): Observable<MesaDto> {
    // La URL incluye el ID de la mesa
    const url = `${this.apiUrl}/mesas/reservar/${idMesa}`;
    // Hacemos una petición POST. El 'null' es porque no enviamos body.
    return this.http.post<MesaDto>(url, null); 
  }

  cerrarVentaPorMesa(idMesa: number): Observable<PedidoDto> {
    const url = `${this.apiUrl}/mesas/cerrar-venta/${idMesa}`;
    return this.http.post<PedidoDto>(url, null); 
  }

  buscarMesaPorId(id: number): Observable<MesaDto> {
    return this.http.get<MesaDto>(`${this.apiUrl}/mesas/buscar/${id}`);
  }

// --- Endpoints de Pedido ---

  crearPedido(pedido: PedidoRequest): Observable<void> {
    const url = `${this.apiUrl}/pedidos/agregar`;
    return this.http.post<void>(url, pedido); // Enviamos el pedido en el body
  }

  cerrarPedido(idPedido: number): Observable<PedidoDto> {
    const url = `${this.apiUrl}/pedidos/cerrar/${idPedido}`;
    return this.http.post<PedidoDto>(url, null);
  }
}

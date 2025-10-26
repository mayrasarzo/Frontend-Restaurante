import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Para hacer llamadas HTTP
import { Observable } from 'rxjs'; // Para manejar respuestas asíncronas

export interface MesaDto {
  id: number;
  numero: number;
  estado: string;
}

export interface PedidoRequest { // <-- Añade 'export'
  mesaId: number;
  items: {
    productoId: number;
    cantidad: number;
  }[];
}

export interface PedidoDto {
  id: number;
  mesaId: number;
  estado: string;
  total: number;
  items: { 
    id: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    tipo: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})

export class Venta {
  // URL base de tu microservicio de Ventas (¡verifica el puerto!)
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) { }

  listarMesas(): Observable<MesaDto[]> {
    // Hace una petición GET a http://localhost:8080/api/ventas/mesas/listar
    return this.http.get<MesaDto[]>(`${this.apiUrl}/mesas/listar`);
  }

  reservarMesa(idMesa: number): Observable<MesaDto> {
    // La URL incluye el ID de la mesa
    const url = `${this.apiUrl}/mesas/reservar/${idMesa}`;
    // Hacemos una petición POST. El 'null' es porque no enviamos body.
    return this.http.post<MesaDto>(url, null); 
  }

  crearPedido(pedido: PedidoRequest): Observable<void> {
    const url = `${this.apiUrl}/pedidos/agregar`;
    return this.http.post<void>(url, pedido); // Enviamos el pedido en el body
  }

  cerrarVentaPorMesa(idMesa: number): Observable<PedidoDto> {
    const url = `${this.apiUrl}/mesas/cerrar-venta/${idMesa}`;
    return this.http.post<PedidoDto>(url, null); 
  }

  crearMesa(mesa: MesaDto): Observable<void> {
    const url = `${this.apiUrl}/mesas/agregar`;
    const body = { numero: mesa.numero }; 
    return this.http.post<void>(url, body);
  }
}

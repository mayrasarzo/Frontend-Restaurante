import { Routes } from '@angular/router';
import { ProductoLista} from './componentes/producto-lista/producto-lista';
import { MesaLista } from './componentes/mesa-lista/mesa-lista';
import { PedidoDetalle } from './componentes/pedido-detalle/pedido-detalle';
import { ProductoFormulario } from './componentes/producto-formulario/producto-formulario';

export const routes: Routes = [  
    { path: '', redirectTo: '/mesas', pathMatch: 'full' }, 
    // Ruta para mostrar la lista de mesas
    { path: 'mesas', component: MesaLista }, 
    // Ruta para mostrar el menú de productos
    { path: 'productos', component: ProductoLista }, 
    // Ruta para ver/editar un pedido (usaremos el ID de la mesa)
    { path: 'pedido/mesa/:mesaId', component: PedidoDetalle },
    { path: 'productos/agregar', component: ProductoFormulario}
];

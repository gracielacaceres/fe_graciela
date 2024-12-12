import { Component, OnInit } from '@angular/core';
import { VentaService } from '../../services/venta.service';
import { Venta, DetalleVenta } from '../../shared/venta.model';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Usuario } from '../../shared/usuario.model';
import { UsuarioService } from '../../core/usuario.service';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../shared/producto.model';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent implements OnInit {

  idUsuario!: number; // Usuario seleccionado
  idProducto!: number; // Producto seleccionado
  cantidad!: number; // Cantidad del producto
  precioUnitario!: number; // Precio unitario del producto
  subtotal!: number; // Subtotal del producto
  detalles: DetalleVenta[] = [];
  totalPago = 0;
  usuarios: Usuario[] = []; // Lista de usuarios activos
  productos: Producto[] = []; // Lista de productos disponibles
  ventas: Venta[] = []; // Lista de ventas activas/inactivas
  ventaSeleccionada: Venta | null = null; // Venta seleccionada para ver detalles
  mostrandoActivas = true; // Estado para alternar entre ventas activas e inactivas

  constructor(
    private ventaService: VentaService,
    private usuarioService: UsuarioService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarProductos();
    this.cargarVentasActivas();
    console.log('Usuarios:', this.usuarios);
    console.log('Productos:', this.productos);
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuariosActivos().subscribe({
      next: (usuarios) => (this.usuarios = usuarios),
      error: () =>
        Swal.fire('Error', 'Error al cargar usuarios. Inténtelo de nuevo.', 'error')
    });
  }

  onProductoChange(event: any): void {
    const productoSeleccionado = this.productos.find(p => p.idProducto === +this.idProducto);
    if (productoSeleccionado) {
      this.precioUnitario = productoSeleccionado.precio;
      this.calcularSubtotal();
    }
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        console.log('Productos cargados:', this.productos);
      },
      error: () =>
        Swal.fire('Error', 'Error al cargar productos. Inténtelo de nuevo.', 'error')
    });
  }

  cargarVentasActivas(): void {
    this.ventaService.listarVentasActivas().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        console.log('Ventas activas cargadas:', this.ventas);
      },
      error: () =>
        Swal.fire('Error', 'Error al cargar ventas activas. Inténtelo de nuevo.', 'error')
    });
  }

  cargarVentasInactivas(): void {
    this.ventaService.listarVentasInactivas().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        console.log('Ventas inactivas cargadas:', this.ventas);
      },
      error: () =>
        Swal.fire('Error', 'Error al cargar ventas inactivas. Inténtelo de nuevo.', 'error')
    });
  }

  alternarVentas(): void {
    this.mostrandoActivas = !this.mostrandoActivas;
    if (this.mostrandoActivas) {
      this.cargarVentasActivas();
    } else {
      this.cargarVentasInactivas();
    }
  }

  calcularSubtotal(): void {
    if (this.cantidad && this.precioUnitario) {
      this.subtotal = this.cantidad * this.precioUnitario;
    } else {
      this.subtotal = 0;
    }
  }

  agregarDetalle(): void {
    // Validar los campos antes de agregar al detalle
    if (!this.idProducto || !this.cantidad || !this.precioUnitario || this.cantidad <= 0 || this.precioUnitario <= 0) {
      Swal.fire('Advertencia', 'Por favor, complete todos los campos del producto con valores válidos.', 'warning');
      return;
    }

    // Buscar el producto seleccionado
    const productoSeleccionado = this.productos.find(p => p.idProducto === +this.idProducto);
    if (!productoSeleccionado) {
      Swal.fire('Error', 'Producto no válido.', 'error');
      return;
    }

    // Crear el detalle del producto
    const detalle: DetalleVenta = {
      idProducto: productoSeleccionado.idProducto,
      nombreProducto: productoSeleccionado.nombre, // Agregar el nombre del producto
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitario,
      subtotal: this.subtotal
    };

    // Agregar el detalle y recalcular el total
    this.detalles.push(detalle);
    this.actualizarTotal();

    // Reset campos del formulario de producto
    this.idProducto = 0;
    this.cantidad = 0;
    this.precioUnitario = 0;
    this.subtotal = 0;

    // Mostrar mensaje de éxito
    Swal.fire('Éxito', 'Producto agregado al detalle.', 'success');
  }

  actualizarTotal(): void {
    this.totalPago = this.detalles.reduce((total, detalle) => total + detalle.subtotal, 0);
  }

  eliminarDetalle(index: number): void {
    // Eliminar el detalle seleccionado
    this.detalles.splice(index, 1);

    // Recalcular el total
    this.actualizarTotal();

    // Mostrar mensaje de éxito
    Swal.fire('Éxito', 'Producto eliminado del detalle.', 'success');
  }

  registrarVenta(): void {
    if (!this.idUsuario) {
      Swal.fire('Advertencia', 'Por favor, seleccione un usuario.', 'warning');
      return;
    }

    if (this.detalles.length === 0) {
      Swal.fire('Advertencia', 'Debe agregar al menos un producto.', 'warning');
      return;
    }

    const venta: Venta = {
      usuario: {
        idUsuario: this.idUsuario,
        apellido: undefined,
        nombre: undefined
      },
      detalles: this.detalles.map(detalle => ({
        producto: { idProducto: detalle.idProducto },
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal
      })),
      fechaVenta: undefined,
      montoTotal: this.totalPago,
      estado: 'A',
      idVenta: undefined
    };

    this.ventaService.registrarVenta(venta).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Venta registrada exitosamente.', 'success');
        this.detalles = [];
        this.totalPago = 0;
        this.idUsuario = 0;
        this.cargarVentasActivas(); // Recargar la lista de ventas activas después de registrar una nueva venta
      },
      error: () =>
        Swal.fire('Error', 'Error al registrar la venta. Inténtelo de nuevo.', 'error')
    });
  }

  verDetalleVenta(venta: Venta): void {
    this.ventaSeleccionada = venta;
    // Mostrar el modal
    const modal = document.getElementById('detalleVentaModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  cerrarModal(): void {
    this.ventaSeleccionada = null;
    // Ocultar el modal
    const modal = document.getElementById('detalleVentaModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  eliminarVenta(idVenta: number): void {
    this.ventaService.eliminarVenta(idVenta).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Venta eliminada exitosamente.', 'success');
        this.alternarVentas(); // Recargar la lista de ventas después de eliminar una venta
      },
      error: () =>
        Swal.fire('Error', 'Error al eliminar la venta. Inténtelo de nuevo.', 'error')
    });
  }

  restaurarVenta(idVenta: number): void {
    this.ventaService.restaurarVenta(idVenta).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Venta restaurada exitosamente.', 'success');
        this.alternarVentas(); // Recargar la lista de ventas después de restaurar una venta
      },
      error: () =>
        Swal.fire('Error', 'Error al restaurar la venta. Inténtelo de nuevo.', 'error')
    });
  }
}
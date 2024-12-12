// shared/venta.model.ts
export interface DetalleVenta {
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
fechaVenta: any;
montoTotal: string|number;
estado: any;
idVenta: any;
  usuario: {
apellido: any;
nombre: any; idUsuario: number 
};
  detalles: {
precioUnitario: string|number;
subtotal: string|number;
    producto: { idProducto: number };
    cantidad: number;
  }[];
}
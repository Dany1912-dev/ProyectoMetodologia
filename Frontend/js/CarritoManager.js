// js/carrito-manager.js
class CarritoManager {
    constructor() {
        this.carrito = this.cargarCarrito();
    }
    
    cargarCarrito() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    }
    
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        this.actualizarBadge();
    }
    
    agregarProducto(producto, cantidad = 1) {
        const existente = this.carrito.find(p => p.idProducto === producto.idProducto);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            this.carrito.push({ ...producto, cantidad });
        }
        this.guardarCarrito();
    }
    
    eliminarProducto(idProducto) {
        this.carrito = this.carrito.filter(p => p.idProducto !== idProducto);
        this.guardarCarrito();
    }
    
    actualizarCantidad(idProducto, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            this.eliminarProducto(idProducto);
            return;
        }
        const producto = this.carrito.find(p => p.idProducto === idProducto);
        if (producto) {
            producto.cantidad = nuevaCantidad;
            this.guardarCarrito();
        }
    }
    
    obtenerTotal() {
        return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }
    
    obtenerCarrito() {
        return this.carrito;
    }
    
    limpiarCarrito() {
        this.carrito = [];
        localStorage.removeItem('carrito');
        this.actualizarBadge();
    }
    
    obtenerNumeroItems() {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }
    
    actualizarBadge() {
        const badge = document.getElementById('carritoBadge');
        if (badge) {
            const total = this.obtenerNumeroItems();
            badge.textContent = total;
            badge.classList.toggle('hidden', total === 0);
        }
    }
}

// Instancia global
const carritoManager = new CarritoManager();
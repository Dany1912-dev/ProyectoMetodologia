document.addEventListener('DOMContentLoaded', function() {
    const carritoBtn = document.getElementById('carritoBtn');
    const carritoSidebar = document.getElementById('carritoSidebar');
    const closeCarrito = document.getElementById('closeCarrito');
    const carritoOverlay = document.createElement('div');
    carritoOverlay.className = 'carrito-overlay';
    document.body.appendChild(carritoOverlay);

    // Event listeners
    carritoBtn.addEventListener('click', abrirCarrito);
    closeCarrito.addEventListener('click', cerrarCarrito);
    carritoOverlay.addEventListener('click', cerrarCarrito);
    document.getElementById('limpiarCarrito').addEventListener('click', limpiarCarrito);
    document.getElementById('procesarPedido').addEventListener('click', procesarPedido);

    function abrirCarrito() {
        carritoSidebar.classList.add('active');
        carritoOverlay.classList.add('active');
        actualizarVistaCarrito();
    }

    function cerrarCarrito() {
        carritoSidebar.classList.remove('active');
        carritoOverlay.classList.remove('active');
    }

    function actualizarVistaCarrito() {
        const carrito = carritoManager.obtenerCarrito();
        const carritoItems = document.getElementById('carritoItems');
        const carritoVacio = document.getElementById('carritoVacio');
        const carritoTotal = document.getElementById('carritoTotal');

        // Actualizar total
        carritoTotal.textContent = carritoManager.obtenerTotal().toFixed(2);

        if (carrito.length === 0) {
            carritoItems.classList.add('hidden');
            carritoVacio.classList.remove('hidden');
            return;
        }

        carritoVacio.classList.add('hidden');
        carritoItems.classList.remove('hidden');

        // Renderizar items
        carritoItems.innerHTML = carrito.map(item => `
            <div class="carrito-item" data-producto-id="${item.idProducto}">
                <div class="carrito-item-imagen">
                    <img src="${item.imagenUrl || 'https://picsum.photos/60/60?random=0'}" 
                         alt="${item.nombre}"
                         onerror="this.src='https://picsum.photos/60/60?random=0'">
                </div>
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">$${item.precio.toFixed(2)} c/u</div>
                    <div class="carrito-item-controls">
                        <button class="cantidad-btn disminuir" onclick="actualizarCantidad(${item.idProducto}, ${item.cantidad - 1})">-</button>
                        <span class="carrito-item-cantidad">${item.cantidad}</span>
                        <button class="cantidad-btn aumentar" onclick="actualizarCantidad(${item.idProducto}, ${item.cantidad + 1})">+</button>
                        <button class="eliminar-item" onclick="eliminarDelCarrito(${item.idProducto})">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function limpiarCarrito() {
        if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
            carritoManager.limpiarCarrito();
            actualizarVistaCarrito();
            mostrarMensaje('Carrito limpiado', 'info');
        }
    }

    async function procesarPedido() {
        const carrito = carritoManager.obtenerCarrito();
    
        if (carrito.length === 0) {
            mostrarMensaje('El carrito está vacío', 'error');
            return;
        }
        
        // Preguntar si es pedido especial
        const esEspecial = confirm('¿Es un pedido especial para evento?');
        let fechaEntregaEspecial = null;
        let notas = "";
        
        if (esEspecial) {
            // Solicitar fecha (mínimo 3 días después)
            const fechaMinima = new Date();
            fechaMinima.setDate(fechaMinima.getDate() + 3);
            
            const fechaInput = prompt(
                `Ingrese fecha de entrega (mínimo ${fechaMinima.toLocaleDateString()}):`,
                fechaMinima.toISOString().split('T')[0]
            );
            
            if (!fechaInput) return;
            
            fechaEntregaEspecial = new Date(fechaInput);
            notas = prompt('Notas especiales para el pedido:', '');
        }
        
        try {
            const pedidoData = {
                productos: carrito.map(item => ({
                    IdProducto: item.idProducto,
                    Cantidad: item.cantidad
                })),
                notas: notas,
                esPedidoEspecial: esEspecial,
                fechaEntregaEspecial: esEspecial ? fechaEntregaEspecial.toISOString() : null
            };
            
            const resultado = await api.crearPedido(pedidoData);
            
            if (resultado.Exito) {
                carritoManager.limpiarCarrito();
                mostrarMensaje(`Pedido #${resultado.IdPedido} creado`, 'success');
                cerrarCarrito();
                
                // Redirigir a mis pedidos
                setTimeout(() => {
                    window.location.href = 'mis-pedidos.html';
                }, 2000);
            }
        } catch (error) {
            mostrarMensaje('Error: ' + error.message, 'error');
        }
    }

    // Funciones globales para los botones del carrito
    window.actualizarCantidad = function(productoId, nuevaCantidad) {
        carritoManager.actualizarCantidad(productoId, nuevaCantidad);
        actualizarVistaCarrito();
    };

    window.eliminarDelCarrito = function(productoId) {
        carritoManager.eliminarProducto(productoId);
        actualizarVistaCarrito();
        mostrarMensaje('Producto eliminado del carrito', 'info');
    };
});
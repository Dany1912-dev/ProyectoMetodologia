// carrito.js - VERSIÓN COMPLETA Y FUNCIONAL
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 carrito.js cargado');
    
    // ========== VARIABLES ==========
    const productosGrid = document.getElementById('productosGrid');
    const categoriaFilter = document.getElementById('categoriaFilter');
    const searchInput = document.getElementById('searchInput');
    const loading = document.getElementById('loading');
    const noProducts = document.getElementById('noProducts');
    const productModal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const carritoBtn = document.getElementById('carritoBtn');
    const closeCarritoBtn = document.getElementById('closeCarrito');
    const carritoSidebar = document.getElementById('carritoSidebar');
    const carritoOverlay = document.querySelector('.carrito-overlay');
    const procesarPedidoBtn = document.getElementById('procesarPedido');
    const limpiarCarritoBtn = document.getElementById('limpiarCarrito');
    const misPedidosBtn = document.getElementById('misPedidosBtn');
    
    // ========== INICIALIZACIONES ==========
    // ÚNICA instancia de CarritoManager
    const carritoManager = new CarritoManager();
    
    let productos = [];
    let categorias = [];
    let filteredProductos = [];
    
    // ========== VERIFICACIONES ==========
    if (!api.token) {
        window.location.href = 'index.html';
        return;
    }
    
    // ========== EVENT LISTENERS ==========
    // Catálogo
    if (categoriaFilter) categoriaFilter.addEventListener('change', filtrarProductos);
    if (searchInput) searchInput.addEventListener('input', filtrarProductos);
    if (logoutBtn) logoutBtn.addEventListener('click', cerrarSesion);
    if (misPedidosBtn) misPedidosBtn.addEventListener('click', () => window.location.href = 'MisPedido.html');
    
    // Carrito
    if (carritoBtn) carritoBtn.addEventListener('click', abrirCarrito);
    if (closeCarritoBtn) closeCarritoBtn.addEventListener('click', cerrarCarrito);
    if (carritoOverlay) carritoOverlay.addEventListener('click', cerrarCarrito);
    if (procesarPedidoBtn) procesarPedidoBtn.addEventListener('click', procesarPedido);
    if (limpiarCarritoBtn) limpiarCarritoBtn.addEventListener('click', limpiarCarritoCompleto);
    
    // Modal
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal || e.target.classList.contains('close-modal')) {
                cerrarModal();
            }
        });
    }
    
    // ========== CARGAR DATOS INICIALES ==========
    cargarDatos();
    
    // ========== FUNCIONES DEL CATÁLOGO ==========
    async function cargarDatos() {
        try {
            if (loading) loading.classList.remove('hidden');
            
            // Cargar productos y categorías
            const [productosData, categoriasData] = await Promise.all([
                api.obtenerProductos(),
                api.obtenerCategorias()
            ]);

            productos = productosData;
            categorias = categoriasData;
            
            cargarCategorias();
            mostrarProductos(productos);
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            mostrarMensaje('Error al cargar los productos: ' + error.message, 'error');
        } finally {
            if (loading) loading.classList.add('hidden');
        }
    }
    
    function cargarCategorias() {
        if (!categoriaFilter) return;
        
        categoriaFilter.innerHTML = '<option value="">Todas las categorías</option>';
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.idCategoria;
            option.textContent = categoria.nombre;
            categoriaFilter.appendChild(option);
        });
    }
    
    function mostrarProductos(productosArray) {
        if (!productosGrid || !noProducts) return;
        
        productosGrid.innerHTML = '';
        
        if (productosArray.length === 0) {
            noProducts.classList.remove('hidden');
            productosGrid.classList.add('hidden');
            return;
        }

        noProducts.classList.add('hidden');
        productosGrid.classList.remove('hidden');

        productosArray.forEach(producto => {
            const productoCard = crearProductoCard(producto);
            productosGrid.appendChild(productoCard);
        });
    }
    
    function crearProductoCard(producto) {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <div class="producto-imagen">
                <img src="${producto.imagenUrl || 'https://picsum.photos/300/200?random=0'}" 
                     alt="${producto.nombre}"
                     loading="lazy">
            </div>
            <div class="producto-nombre">${producto.nombre}</div>
            <div class="producto-descripcion">${producto.descripcion}</div>
            <div class="producto-precio">$${producto.precio.toFixed(2)}</div>
            <div class="producto-categoria">${producto.categoria?.nombre || 'Sin categoría'}</div>
        `;

        card.addEventListener('click', () => mostrarDetalleProducto(producto));
        return card;
    }
    
    function filtrarProductos() {
        const categoriaId = categoriaFilter ? categoriaFilter.value : '';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        filteredProductos = productos.filter(producto => {
            const coincideCategoria = !categoriaId || producto.idCategoria == categoriaId;
            const coincideBusqueda = !searchTerm || 
                producto.nombre.toLowerCase().includes(searchTerm) ||
                producto.descripcion.toLowerCase().includes(searchTerm);
            
            return coincideCategoria && coincideBusqueda;
        });

        mostrarProductos(filteredProductos);
    }
    
    function mostrarDetalleProducto(producto) {
        if (!modalContent || !productModal) return;
        
        modalContent.innerHTML = `
            <span class="close-modal">&times;</span>
            <div class="modal-layout">
                <div class="modal-imagen">
                    <img src="${producto.imagenUrl || 'https://picsum.photos/200/200?random=0'}" 
                        alt="${producto.nombre}"
                        onerror="this.src='https://picsum.photos/200/200?random=0'">
                </div>
                
                <div class="modal-info">
                    <h2>${producto.nombre}</h2>
                    <p>${producto.descripcion}</p>
                    <div class="precio-modal">$${producto.precio.toFixed(2)}</div>
                    <div class="producto-categoria">${producto.categoria?.nombre || 'Sin categoría'}</div>
                    
                    <div class="cantidad-selector" style="margin: 15px 0;">
                        <label for="cantidadProducto">Cantidad:</label>
                        <input type="number" id="cantidadProducto" value="1" min="1" max="10" 
                               style="width: 80px; padding: 5px; margin-left: 10px;">
                    </div>
                    
                    <button class="btn-primary btn-carrito" id="btnAgregarCarrito">
                        🛒 Añadir al Carrito
                    </button>
                </div>
            </div>
        `;

        productModal.classList.remove('hidden');
        
        // Agregar evento al botón DESPUÉS de crear el modal
        setTimeout(() => {
            const btnAgregar = document.getElementById('btnAgregarCarrito');
            if (btnAgregar) {
                btnAgregar.addEventListener('click', () => {
                    agregarAlCarritoDesdeModal(producto.idProducto);
                });
            }
        }, 100);
    }
    
    function cerrarModal() {
        if (productModal) productModal.classList.add('hidden');
    }
    
    // ========== FUNCIONES DEL CARRITO ==========
    function abrirCarrito() {
        console.log('🔓 Abriendo carrito...');
        if (carritoSidebar && carritoOverlay) {
            carritoSidebar.classList.remove('hidden');
            carritoSidebar.classList.add('active');
            carritoOverlay.classList.add('active');
            actualizarVistaCarrito();
        }
    }
    
    function cerrarCarrito() {
        console.log('🔒 Cerrando carrito...');
        if (carritoSidebar && carritoOverlay) {
            carritoSidebar.classList.remove('active');
            carritoSidebar.classList.add('hidden');
            carritoOverlay.classList.remove('active');
        }
    }
    
    function actualizarVistaCarrito() {
        const carritoItems = document.getElementById('carritoItems');
        const carritoVacio = document.getElementById('carritoVacio');
        const carritoTotal = document.getElementById('carritoTotal');
        
        if (!carritoItems || !carritoVacio || !carritoTotal) {
            console.error('❌ Elementos del carrito no encontrados');
            return;
        }
        
        const carrito = carritoManager.obtenerCarrito();
        
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
            <div class="carrito-item">
                <div class="carrito-item-imagen">
                    <img src="${item.imagenUrl || 'https://picsum.photos/60/60'}" 
                         alt="${item.nombre}">
                </div>
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">$${item.precio.toFixed(2)} c/u</div>
                    <div class="carrito-item-controls">
                        <button class="cantidad-btn disminuir" data-id="${item.idProducto}" data-accion="disminuir">-</button>
                        <span class="carrito-item-cantidad">${item.cantidad}</span>
                        <button class="cantidad-btn aumentar" data-id="${item.idProducto}" data-accion="aumentar">+</button>
                        <button class="eliminar-item" data-id="${item.idProducto}" data-accion="eliminar">✕</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Agregar eventos a los botones del carrito
        document.querySelectorAll('.cantidad-btn, .eliminar-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const productoId = parseInt(this.getAttribute('data-id'));
                const accion = this.getAttribute('data-accion');
                
                if (accion === 'disminuir') {
                    const item = carritoManager.obtenerCarrito().find(p => p.idProducto === productoId);
                    if (item) {
                        actualizarCantidad(productoId, item.cantidad - 1);
                    }
                } else if (accion === 'aumentar') {
                    const item = carritoManager.obtenerCarrito().find(p => p.idProducto === productoId);
                    if (item) {
                        actualizarCantidad(productoId, item.cantidad + 1);
                    }
                } else if (accion === 'eliminar') {
                    eliminarDelCarrito(productoId);
                }
            });
        });
    }
    
    function agregarAlCarritoDesdeModal(productoId) {
        const cantidadInput = document.getElementById('cantidadProducto');
        const cantidad = cantidadInput ? parseInt(cantidadInput.value) || 1 : 1;
        const producto = productos.find(p => p.idProducto === productoId);
        
        if (producto) {
            carritoManager.agregarProducto(producto, cantidad);
            mostrarMensaje(`✅ ${cantidad} "${producto.nombre}" agregado(s) al carrito`, 'success');
            
            // Actualizar badge y vista
            carritoManager.actualizarBadge();
            
            // Si el carrito está abierto, actualizarlo
            if (carritoSidebar && carritoSidebar.classList.contains('active')) {
                actualizarVistaCarrito();
            }
            
            cerrarModal();
        }
    }
    
    function actualizarCantidad(productoId, nuevaCantidad) {
        carritoManager.actualizarCantidad(productoId, nuevaCantidad);
        actualizarVistaCarrito();
        carritoManager.actualizarBadge();
    }
    
    function eliminarDelCarrito(productoId) {
        carritoManager.eliminarProducto(productoId);
        actualizarVistaCarrito();
        carritoManager.actualizarBadge();
        mostrarMensaje('Producto eliminado del carrito', 'info');
    }
    
    function limpiarCarritoCompleto() {
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
        let fechaEntrega = null;
        let notas = "";
        
        if (esEspecial) {
            const fechaMinima = new Date();
            fechaMinima.setDate(fechaMinima.getDate() + 3);
            
            const fechaInput = prompt(
                `Ingrese fecha de entrega (mínimo ${fechaMinima.toLocaleDateString()}):\nFormato: YYYY-MM-DD`,
                fechaMinima.toISOString().split('T')[0]
            );
            
            if (!fechaInput) return;
            
            fechaEntrega = new Date(fechaInput);
            if (fechaEntrega < fechaMinima) {
                mostrarMensaje('Los pedidos especiales requieren al menos 3 días de anticipación', 'error');
                return;
            }
            
            notas = prompt('Notas especiales para el pedido:', '');
        }
        
        try {
            // Preparar datos para la API
            const pedidoData = {
                productos: carrito.map(item => ({
                    IdProducto: item.idProducto,
                    Cantidad: item.cantidad
                })),
                EsPedidoEspecial: esEspecial,
                FechaEntregaEspecial: esEspecial ? fechaEntrega.toISOString() : null,
                Notas: notas
            };
            
            console.log('📦 Enviando pedido:', pedidoData);
            
            const resultado = await api.crearPedido(pedidoData);
            
            if (resultado.exito) {
                carritoManager.limpiarCarrito();
                mostrarMensaje(`✅ Pedido #${resultado.idPedido} creado exitosamente`, 'success');
                cerrarCarrito();
                
                setTimeout(() => {
                    window.location.href = 'MisPedido.html';
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Error creando pedido:', error);
            mostrarMensaje('Error al crear el pedido: ' + error.message, 'error');
        }
    }
    
    function cerrarSesion() {
        api.clearToken();
        carritoManager.limpiarCarrito();
        window.location.href = 'index.html';
    }
    
    // ========== INICIALIZACIÓN FINAL ==========
    // Mostrar nombre de usuario
    const usuario = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (usuario.nombre && userName) {
        userName.textContent = usuario.nombre;
    }
    
    // Actualizar badge inicial
    carritoManager.actualizarBadge();
    
    console.log('✅ carrito.js inicializado correctamente');
});

// ========== FUNCIÓN GLOBAL PARA MENSAJES ==========
function mostrarMensaje(mensaje, tipo = 'info') {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        font-weight: bold;
        animation: fadeIn 0.3s;
        ${tipo === 'success' ? 'background: #28a745;' : ''}
        ${tipo === 'error' ? 'background: #dc3545;' : ''}
        ${tipo === 'info' ? 'background: #17a2b8;' : ''}
    `;
    
    // Remover mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje');
    mensajesAnteriores.forEach(m => m.remove());
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.style.animation = 'fadeOut 0.3s';
            setTimeout(() => mensajeDiv.remove(), 300);
        }
    }, 3000);
}
document.addEventListener('DOMContentLoaded', function() {
    const productosGrid = document.getElementById('productosGrid');
    const categoriaFilter = document.getElementById('categoriaFilter');
    const searchInput = document.getElementById('searchInput');
    const loading = document.getElementById('loading');
    const noProducts = document.getElementById('noProducts');
    const productModal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');

    let productos = [];
    let categorias = [];
    let filteredProductos = [];
    let carritoManager;

    // Verificar autenticación
    if (!api.token) {
        window.location.href = 'index.html';
        return;
    }

    // Inicializar carrito manager
    carritoManager = new CarritoManager();

    // Cargar datos iniciales
    cargarDatos();

    // Event Listeners
    categoriaFilter.addEventListener('change', filtrarProductos);
    searchInput.addEventListener('input', filtrarProductos);
    logoutBtn.addEventListener('click', cerrarSesion);
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal || e.target.classList.contains('close-modal')) {
            cerrarModal();
        }
    });

    async function cargarDatos() {
        try {
            loading.classList.remove('hidden');
            
            // Cargar productos y categorías en paralelo
            const [productosData, categoriasData] = await Promise.all([
                api.obtenerProductos(),
                api.obtenerCategorias()
            ]);

            productos = productosData;
            categorias = categoriasData;
            
            cargarCategorias();
            mostrarProductos(productos);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            mostrarMensaje('Error al cargar los productos: ' + error.message, 'error');
        } finally {
            loading.classList.add('hidden');
        }
    }

    function cargarCategorias() {
        categoriaFilter.innerHTML = '<option value="">Todas las categorías</option>';
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.idCategoria;
            option.textContent = categoria.nombre;
            categoriaFilter.appendChild(option);
        });
    }

    function mostrarProductos(productosArray) {
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
        const categoriaId = categoriaFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

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
                    
                    <button class="btn-primary btn-carrito" onclick="agregarAlCarritoDesdeModal(${producto.idProducto})">
                        🛒 Añadir al Carrito
                    </button>
                </div>
            </div>
        `;

        productModal.classList.remove('hidden');
    }

    function cerrarModal() {
        productModal.classList.add('hidden');
    }

    function cerrarSesion() {
        api.clearToken();
        carritoManager.limpiarCarrito();
        window.location.href = 'index.html';
    }

    // Mostrar nombre de usuario
    const usuario = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (usuario.nombre) {
        userName.textContent = usuario.nombre;
    }

    // Funciones globales para el carrito
    window.agregarAlCarritoDesdeModal = function(productoId) {
        const cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
        const producto = productos.find(p => p.idProducto === productoId);
        
        if (producto) {
            carritoManager.agregarProducto(producto, cantidad);
            mostrarMensaje(`${cantidad} "${producto.nombre}" agregado(s) al carrito`, 'success');
            cerrarModal();
        }
    };

    window.agregarAlCarrito = function(productoId) {
        const producto = productos.find(p => p.idProducto === productoId);
        if (producto) {
            carritoManager.agregarProducto(producto, 1);
            mostrarMensaje(`"${producto.nombre}" agregado al carrito`, 'success');
        }
    };
});

// Función de mensajes
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
        z-index: 1000;
        font-weight: bold;
        max-width: 300px;
        ${tipo === 'success' ? 'background: #28a745;' : ''}
        ${tipo === 'error' ? 'background: #dc3545;' : ''}
        ${tipo === 'info' ? 'background: #17a2b8;' : ''}
    `;
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}
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

    // Verificar autenticación
    if (!api.token) {
        window.location.href = 'index.html';
        return;
    }

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
            alert('Error al cargar los productos: ' + error.message);
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
                    <button class="btn-primary btn-carrito" onclick="agregarAlCarrito(${producto.idProducto})">
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
        window.location.href = 'index.html';
    }

    // Mostrar nombre de usuario (podrías guardarlo en el login)
    const usuario = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (usuario.nombre) {
        userName.textContent = usuario.nombre;
    }

    // Función global para el botón del modal
    window.agregarAlCarrito = function(productoId) {
        alert(`Producto ${productoId} agregado al carrito (función en desarrollo)`);
        cerrarModal();
    };
});
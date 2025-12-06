class APIClient {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
            
            // CONFIGURACIÓN DE HEADERS
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            // ✅ AÑADIR TOKEN SI EXISTE
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
                console.log(`🔐 Enviando token a ${endpoint}`);
            } else {
                console.warn(`⚠️ No hay token para ${endpoint}`);
                // Si no hay token pero el endpoint requiere auth, mejor redirigir
                if (endpoint.includes('/Pedidos/') || endpoint.includes('/Usuarios/')) {
                    window.location.href = 'index.html?error=no_token';
                    throw new Error('No autenticado');
                }
            }
            
            const config = {
                method: options.method || 'GET',
                headers: headers,
                body: options.body
            };
            
            console.log(`🌐 ${config.method} ${url}`);
            console.log('📤 Headers:', headers);
            
            try {
                const response = await fetch(url, config);
                
                console.log(`📥 Respuesta ${response.status} de ${endpoint}`);
                
                // MANEJO ESPECIAL PARA 401
                if (response.status === 401) {
                    console.error('❌ 401 Unauthorized - Token inválido');
                    this.clearToken();
                    window.location.href = 'index.html?error=unauthorized';
                    throw new Error('Sesión expirada o inválida');
                }
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ Error ${response.status}:`, errorText);
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`❌ Error en ${endpoint}:`, error);
                throw error;
            }
    }

    // Métodos específicos para Auth
    async login(email, password) {
        return this.request('/Auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async registro(datosRegistro) {
        return this.request('/Auth/registro', {
            method: 'POST',
            body: JSON.stringify(datosRegistro)
        });
    }

    async verificarEmail(email) {
        return this.request(`/Auth/verificar-email/${email}`);
    }

    // Métodos para Productos
    async obtenerProductos() {
        return this.request('/Productos');
    }

    async obtenerProductoPorId(id) {
        return this.request(`/Productos/${id}`);
    }

    async obtenerCategorias() {
        return this.request('/Productos/categorias');
    }

    // MÉTODOS NUEVOS PARA PEDIDOS
    async crearPedido(datosPedido) {
        return this.request('/Pedidos', {
            method: 'POST',
            body: JSON.stringify({
                productos: datosPedido.productos.map(p => ({
                    IdProducto: p.IdProducto || p.idProducto,
                    Cantidad: p.Cantidad || p.cantidad
                })),
                Notas: datosPedido.notas || "",
                EsPedidoEspecial: datosPedido.esPedidoEspecial || false,
                FechaEntregaEspecial: datosPedido.fechaEntregaEspecial || null
            })
        });
    }

    async cancelarPedido(idPedido) {
        return this.request(`/Pedidos/${idPedido}/estatus/Cancelado`, {
            method: 'PUT'
        });
    }

    async obtenerMisPedidos() {
        return this.request('/Pedidos/mis-pedidos');
    }

    // Métodos para Perfil (opcionales)
    async obtenerPerfil() {
        return this.request('/Usuarios/perfil');
    }

    async actualizarPerfil(datosPerfil) {
        return this.request('/Usuarios/perfil', {
            method: 'PUT',
            body: JSON.stringify({
                Nombre: datosPerfil.nombre,
                Apellido1: datosPerfil.apellido1,
                Apellido2: datosPerfil.apellido2,
                Telefono: datosPerfil.telefono
            })
        });
    }

    async actualizarDireccion(datosDireccion) {
        return this.request('/Usuarios/direccion', {
            method: 'PUT',
            body: JSON.stringify({
                Calle: datosDireccion.calle,
                NumeroExterior: datosDireccion.numeroExterior,
                NumeroInterior: datosDireccion.numeroInterior,
                Colonia: datosDireccion.colonia,
                CodigoPostal: datosDireccion.codigoPostal,
                Referencias: datosDireccion.referencias
            })
        });
    }

    async cambiarPassword(passwordActual, nuevaPassword) {
        return this.request('/Usuarios/cambiar-password', {
            method: 'POST',
            body: JSON.stringify({
                PasswordActual: passwordActual,
                NuevaPassword: nuevaPassword
            })
        });
    }

    async obtenerEstadisticas() {
        return this.request('/Usuarios/estadisticas');
    }

    // Guardar token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Eliminar token (logout)
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo'); // También limpiar info de usuario
    }
}

// Instancia global de la API
const api = new APIClient();
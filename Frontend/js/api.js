class APIClient {
    constructor(baseURL = 'http://localhost:5064/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token si existe
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en la petición API:', error);
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

    // Guardar token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Eliminar token (logout)
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}

// Instancia global de la API
const api = new APIClient();
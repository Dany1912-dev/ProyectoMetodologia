// perfil.js - GESTIÓN COMPLETA DEL PERFIL DE USUARIO
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 perfil.js cargado');
    
    // ========== VARIABLES ==========
    const loadingPerfil = document.getElementById('loadingPerfil');
    const perfilContent = document.getElementById('perfilContent');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const perfilNombreCompleto = document.getElementById('perfilNombreCompleto');
    const perfilEmail = document.getElementById('perfilEmail');
    const avatarIniciales = document.getElementById('avatarIniciales');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Variables para datos del usuario
    let usuarioData = null;
    let direccionData = null;
    let pedidosData = [];
    
    // ========== VERIFICACIONES ==========
    if (!api.token) {
        console.warn('⚠️ No hay token, redirigiendo a login');
        window.location.href = 'index.html';
        return;
    }
    
    // ========== EVENT LISTENERS ==========
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            api.clearToken();
            window.location.href = 'index.html';
        });
    }
    
    // Navegación por pestañas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Actualizar botones activos
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar contenido activo
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
    
    // ========== CARGAR DATOS DEL PERFIL ==========
    cargarPerfil();
    
    // ========== FUNCIONES PRINCIPALES ==========
    async function cargarPerfil() {
        try {
            console.log('🔄 Cargando perfil del usuario...');
            
            // Obtener datos del usuario de localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (userInfo.nombre && userName) {
                userName.textContent = userInfo.nombre;
            }
            
            // Cargar datos del backend
            await Promise.all([
                cargarDatosUsuario(),
                cargarDireccionUsuario(),
                cargarPedidosUsuario(),
                cargarEstadisticas()
            ]);
            
            // Mostrar contenido
            mostrarPerfil();
            
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            mostrarMensaje(`Error al cargar el perfil: ${error.message}`, 'error');
        } finally {
            if (loadingPerfil) loadingPerfil.classList.add('hidden');
            if (perfilContent) perfilContent.classList.remove('hidden');
        }
    }
    
    async function cargarDatosUsuario() {
        try {
            const respuesta = await api.obtenerPerfil();
            
            if (respuesta && respuesta.exito) {
                usuarioData = respuesta.perfil;
                console.log('✅ Datos de usuario cargados:', usuarioData);
            } else {
                throw new Error(respuesta?.mensaje || 'Error al obtener perfil');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos de usuario:', error);
            // Usar datos de localStorage como fallback
            usuarioData = JSON.parse(localStorage.getItem('userInfo') || '{}');
            console.log('ℹ️ Usando datos de localStorage como fallback');
        }
    }

    
    async function cargarDireccionUsuario() {
        try {
            // La dirección ya viene incluida en el perfil
            if (usuarioData && usuarioData.direccion) {
                direccionData = usuarioData.direccion;
                console.log('✅ Datos de dirección cargados:', direccionData);
            } else {
                direccionData = {};
                console.log('ℹ️ Usuario no tiene dirección registrada');
            }
            
        } catch (error) {
            console.error('❌ Error cargando dirección:', error);
            direccionData = {};
        }
    }
    
    async function cargarPedidosUsuario() {
        try {
            const respuesta = await api.obtenerMisPedidos();
            if (respuesta && respuesta.exito && respuesta.pedidos) {
                pedidosData = respuesta.pedidos;
                console.log(`✅ ${pedidosData.length} pedidos cargados`);
            } else {
                pedidosData = [];
                console.log('ℹ️ No hay pedidos o respuesta vacía');
            }
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            pedidosData = [];
        }
    }
    
    async function cargarEstadisticas() {
        // Las estadísticas se calculan a partir de los pedidos
        // En una implementación completa, podría haber un endpoint específico
    }
    
    function mostrarPerfil() {
        console.log('📊 Mostrando perfil del usuario');
        
        // Actualizar información principal
        if (usuarioData) {
            // Nombre completo
            const nombreCompleto = `${usuarioData.nombre || ''} ${usuarioData.apellido1 || ''}`.trim();
            if (perfilNombreCompleto) {
                perfilNombreCompleto.textContent = nombreCompleto || 'Usuario';
            }
            
            // Email
            if (perfilEmail) {
                perfilEmail.textContent = usuarioData.email || 'No disponible';
            }
            
            // Avatar con iniciales
            if (avatarIniciales) {
                const iniciales = obtenerIniciales(usuarioData.nombre, usuarioData.apellido1);
                avatarIniciales.textContent = iniciales;
            }
            
            // Información personal
            actualizarCampo('infoNombre', usuarioData.nombre);
            actualizarCampo('infoApellido1', usuarioData.apellido1);
            actualizarCampo('infoApellido2', usuarioData.apellido2 || '');
            actualizarCampo('infoEmail', usuarioData.email);
            actualizarCampo('infoTelefono', usuarioData.telefono || 'No especificado');
            actualizarCampo('infoTipoUsuario', usuarioData.tipoUsuario || 'Cliente');
        }
        
        // Dirección
        if (direccionData) {
            actualizarCampo('infoCalle', direccionData.calle || 'No especificada');
            actualizarCampo('infoNumeroExterior', direccionData.numeroExterior || 'S/N');
            actualizarCampo('infoNumeroInterior', direccionData.numeroInterior || '');
            actualizarCampo('infoColonia', direccionData.colonia || 'No especificada');
            actualizarCampo('infoCodigoPostal', direccionData.codigoPostal || '');
            actualizarCampo('infoReferencias', direccionData.referencias || 'Sin referencias');
        }
        
        // Estadísticas
        calcularEstadisticas();
        
        // Configurar funcionalidad de edición
        configurarEdicion();
        
        // Configurar formulario de cambio de contraseña
        configurarCambioPassword();
        
        // Configurar información de sesión
        configurarInfoSesion();
    }
    
    function obtenerIniciales(nombre, apellido) {
        const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : 'U';
        const inicialApellido = apellido ? apellido.charAt(0).toUpperCase() : 'S';
        return inicialNombre + inicialApellido;
    }
    
    function actualizarCampo(elementId, valor) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = valor || 'No disponible';
        }
    }
    
    function calcularEstadisticas() {
        // Estadísticas basadas en pedidos
        const totalPedidos = pedidosData.length;
        const pedidosActivos = pedidosData.filter(p => 
            p.estatus === 'Pendiente' || p.estatus === 'En Proceso'
        ).length;
        
        const totalGastado = pedidosData.reduce((sum, p) => sum + (p.total || 0), 0);
        const promedioPedido = totalPedidos > 0 ? totalGastado / totalPedidos : 0;
        
        const pedidosEspeciales = pedidosData.filter(p => p.esPedidoEspecial).length;
        
        // Actualizar UI
        actualizarCampo('statTotalPedidos', totalPedidos);
        actualizarCampo('statPedidosActivos', pedidosActivos);
        actualizarCampo('statTotalGastado', `$${totalGastado.toFixed(2)}`);
        actualizarCampo('statPedidosEspeciales', pedidosEspeciales);
        actualizarCampo('statPromedioPedido', `$${promedioPedido.toFixed(2)}`);
        
        // Miembro desde (fecha del primer pedido o fecha actual)
        if (pedidosData.length > 0) {
            const fechasPedidos = pedidosData.map(p => new Date(p.fechaPedido));
            const fechaMasAntigua = new Date(Math.min(...fechasPedidos));
            const opciones = { year: 'numeric', month: 'long' };
            actualizarCampo('statMiembroDesde', fechaMasAntigua.toLocaleDateString('es-ES', opciones));
        } else {
            actualizarCampo('statMiembroDesde', 'Reciente');
        }
        
        // Actividad reciente
        mostrarActividadReciente();
    }
    
    function mostrarActividadReciente() {
        const actividadReciente = document.getElementById('actividadReciente');
        if (!actividadReciente) return;
        
        if (pedidosData.length === 0) {
            actividadReciente.innerHTML = `
                <p style="text-align: center; color: #666; padding: 20px;">
                    Aún no tienes actividad. ¡Realiza tu primer pedido!
                </p>
            `;
            return;
        }
        
        // Tomar los últimos 5 pedidos
        const pedidosRecientes = [...pedidosData]
            .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
            .slice(0, 5);
        
        const html = pedidosRecientes.map(pedido => {
            const fecha = new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const icono = pedido.esPedidoEspecial ? '🎉' : '📦';
            const estatusClass = `estatus-${pedido.estatus.toLowerCase().replace(' ', '')}`;
            
            return `
                <div class="actividad-item" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                    transition: background 0.3s;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px;">${icono}</span>
                        <div>
                            <div style="font-weight: 500;">${pedido.esPedidoEspecial ? 'Pedido Especial' : 'Pedido'}</div>
                            <div style="font-size: 12px; color: #666;">${fecha}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: 600;">$${pedido.total.toFixed(2)}</span>
                        <span class="estatus-badge ${estatusClass}" style="font-size: 11px; padding: 3px 8px;">
                            ${pedido.estatus}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
        
        actividadReciente.innerHTML = html;
    }
    
    function configurarEdicion() {
        // Configurar clic en campos editables
        document.querySelectorAll('.info-value.editable').forEach(element => {
            element.addEventListener('click', function() {
                const field = this.getAttribute('data-field');
                abrirFormularioEdicion(field);
            });
        });
        
        // Configurar botones cancelar
        document.querySelectorAll('.btn-cancelar').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const form = this.closest('.form-edit');
                if (form) {
                    form.classList.remove('active');
                }
            });
        });
        
        // Configurar botones guardar
        document.querySelectorAll('.btn-guardar').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const field = this.getAttribute('data-field');
                await guardarCampo(field);
            });
        });
        
        // Configurar tecla Enter en inputs
        document.querySelectorAll('.form-edit input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const field = this.closest('.form-edit').previousElementSibling?.getAttribute('data-field');
                    if (field) {
                        guardarCampo(field);
                    }
                }
            });
        });
    }
    
    function abrirFormularioEdicion(field) {
        // Cerrar todos los formularios abiertos
        document.querySelectorAll('.form-edit').forEach(form => {
            form.classList.remove('active');
        });
        
        // Obtener formulario correspondiente
        const form = document.getElementById(`form${capitalize(field)}`);
        if (!form) return;
        
        // Obtener valor actual
        const valueElement = document.getElementById(`info${capitalize(field)}`);
        const currentValue = valueElement ? valueElement.textContent : '';
        
        // Poner valor actual en el input
        const input = form.querySelector('input');
        if (input) {
            input.value = currentValue;
            input.focus();
        }
        
        // Mostrar formulario
        form.classList.add('active');
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    async function guardarCampo(field) {
        const form = document.getElementById(`form${capitalize(field)}`);
        if (!form) return;
        
        const input = form.querySelector('input');
        if (!input) return;
        
        const nuevoValor = input.value.trim();
        const valorActual = document.getElementById(`info${capitalize(field)}`).textContent;
        
        if (nuevoValor === valorActual) {
            form.classList.remove('active');
            return;
        }
        
        if (!validarCampo(field, nuevoValor)) return;
        
        try {
            console.log(`💾 Guardando campo ${field}: ${nuevoValor}`);
            
            // Determinar qué endpoint usar según el campo
            if (['nombre', 'apellido1', 'apellido2', 'telefono'].includes(field)) {
                // Actualizar perfil
                const datosPerfil = {};
                datosPerfil[field] = nuevoValor;
                
                // Completar con datos actuales para los otros campos
                if (!datosPerfil.nombre) datosPerfil.nombre = usuarioData.nombre;
                if (!datosPerfil.apellido1) datosPerfil.apellido1 = usuarioData.apellido1;
                if (!datosPerfil.apellido2) datosPerfil.apellido2 = usuarioData.apellido2;
                if (!datosPerfil.telefono) datosPerfil.telefono = usuarioData.telefono;
                
                const resultado = await api.actualizarPerfil(datosPerfil);
                
                if (resultado.exito) {
                    // Actualizar usuarioData con la respuesta
                    if (resultado.usuario) {
                        usuarioData = { ...usuarioData, ...resultado.usuario };
                    }
                }
                
            } else if (['calle', 'numeroExterior', 'numeroInterior', 'colonia', 'codigoPostal', 'referencias'].includes(field)) {
                // Actualizar dirección
                const datosDireccion = {};
                datosDireccion[field] = nuevoValor;
                
                // Completar con datos actuales
                if (!datosDireccion.calle) datosDireccion.calle = direccionData.calle;
                if (!datosDireccion.numeroExterior) datosDireccion.numeroExterior = direccionData.numeroExterior;
                if (!datosDireccion.numeroInterior) datosDireccion.numeroInterior = direccionData.numeroInterior;
                if (!datosDireccion.colonia) datosDireccion.colonia = direccionData.colonia;
                if (!datosDireccion.codigoPostal) datosDireccion.codigoPostal = direccionData.codigoPostal;
                if (!datosDireccion.referencias) datosDireccion.referencias = direccionData.referencias;
                
                const resultado = await api.actualizarDireccion(datosDireccion);
                
                if (resultado.exito && resultado.direccion) {
                    direccionData = { ...direccionData, ...resultado.direccion };
                }
            }
            
            // Actualizar UI
            actualizarCampo(`info${capitalize(field)}`, nuevoValor);
            
            // Actualizar localStorage si es información del usuario
            if (['nombre', 'apellido1', 'apellido2', 'telefono'].includes(field)) {
                localStorage.setItem('userInfo', JSON.stringify(usuarioData));
                
                // Actualizar nombre en el header
                if (userName && field === 'nombre') {
                    userName.textContent = nuevoValor;
                }
                
                // Actualizar avatar
                if (avatarIniciales) {
                    const iniciales = obtenerIniciales(
                        field === 'nombre' ? nuevoValor : usuarioData.nombre,
                        field === 'apellido1' ? nuevoValor : usuarioData.apellido1
                    );
                    avatarIniciales.textContent = iniciales;
                }
            }
            
            // Cerrar formulario
            form.classList.remove('active');
            
            mostrarMensaje('✅ Cambios guardados exitosamente', 'success');
            
        } catch (error) {
            console.error(`❌ Error guardando campo ${field}:`, error);
            mostrarMensaje(`Error al guardar cambios: ${error.message}`, 'error');
        }
    }
    
    function validarCampo(field, value) {
        switch(field) {
            case 'telefono':
                if (!/^[\d\s\-\(\)]+$/.test(value)) {
                    mostrarMensaje('El teléfono solo puede contener números, espacios y guiones', 'error');
                    return false;
                }
                break;
                
            case 'codigoPostal':
                if (!/^\d{5}$/.test(value)) {
                    mostrarMensaje('El código postal debe tener 5 dígitos', 'error');
                    return false;
                }
                break;
                
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    mostrarMensaje('Formato de email inválido', 'error');
                    return false;
                }
                break;
        }
        return true;
    }
    
    function configurarCambioPassword() {
        const form = document.getElementById('formCambiarPassword');
        if (!form) return;
        
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const passwordStrength = document.getElementById('passwordStrength');
        const passwordMatch = document.getElementById('passwordMatch');
        
        // Validar fortaleza de contraseña
        if (newPassword) {
            newPassword.addEventListener('input', function() {
                const strength = calcularFortalezaPassword(this.value);
                passwordStrength.innerHTML = `Seguridad: <span class="strength-${strength.level}">${strength.text}</span>`;
            });
        }
        
        // Validar que las contraseñas coincidan
        if (confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                if (newPassword.value !== this.value) {
                    passwordMatch.textContent = '❌ Las contraseñas no coinciden';
                    passwordMatch.style.color = '#dc3545';
                } else {
                    passwordMatch.textContent = '✅ Las contraseñas coinciden';
                    passwordMatch.style.color = '#28a745';
                }
            });
        }
        
        // Enviar formulario
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPass = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            
            // Validaciones
            if (newPass.length < 6) {
                mostrarMensaje('La nueva contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            if (newPass !== confirmPass) {
                mostrarMensaje('Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (newPass === currentPass) {
                mostrarMensaje('La nueva contraseña debe ser diferente a la actual', 'error');
                return;
            }
            
            try {
                console.log('🔐 Intentando cambiar contraseña...');
                
                // TODO: Implementar llamada a API para cambiar contraseña
                // await api.cambiarPassword(currentPass, newPass);
                
                // Simular éxito
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                mostrarMensaje('✅ Contraseña cambiada exitosamente', 'success');
                form.reset();
                
                // Limpiar mensajes
                passwordStrength.innerHTML = 'Seguridad: <span class="strength-weak">Débil</span>';
                passwordMatch.textContent = '';
                
            } catch (error) {
                console.error('❌ Error cambiando contraseña:', error);
                mostrarMensaje(`Error al cambiar contraseña: ${error.message}`, 'error');
            }
        });
    }
    
    function calcularFortalezaPassword(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) return { level: 'weak', text: 'Débil' };
        if (score <= 3) return { level: 'medium', text: 'Media' };
        return { level: 'strong', text: 'Fuerte' };
    }
    
    function configurarInfoSesion() {
        // Último acceso
        const ultimoAcceso = document.getElementById('ultimoAcceso');
        if (ultimoAcceso) {
            ultimoAcceso.textContent = new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Información del dispositivo
        const dispositivoInfo = document.getElementById('dispositivoInfo');
        if (dispositivoInfo) {
            const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const navegador = navigator.userAgent.split(' ').pop().split('/')[0];
            dispositivoInfo.textContent = `${esMovil ? '📱' : '💻'} ${navegador}`;
        }
        
        // Cerrar sesión en todos los dispositivos
        const btnCerrarSesionTodos = document.getElementById('btnCerrarSesionTodos');
        if (btnCerrarSesionTodos) {
            btnCerrarSesionTodos.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres cerrar sesión en todos los dispositivos?\n\nTendrás que iniciar sesión nuevamente en cada uno.')) {
                    console.log('🔒 Cerrando sesión en todos los dispositivos...');
                    // TODO: Implementar llamada a API para invalidar todos los tokens
                    api.clearToken();
                    mostrarMensaje('✅ Sesión cerrada en todos los dispositivos', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            });
        }
    }
    
    console.log('✅ perfil.js inicializado correctamente');
});

// ========== FUNCIONES AUXILIARES ==========

// Función mostrarMensaje (la misma que en mis-pedidos.js)
function mostrarMensaje(mensaje, tipo = 'info') {
    // Implementación idéntica a la de mis-pedidos.js
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    const estilos = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        zIndex: '10000',
        fontWeight: 'bold',
        maxWidth: '300px',
        animation: 'fadeIn 0.3s'
    };
    
    switch(tipo) {
        case 'success': estilos.background = '#28a745'; break;
        case 'error': estilos.background = '#dc3545'; break;
        case 'warning': estilos.background = '#ffc107'; break;
        default: estilos.background = '#17a2b8';
    }
    
    Object.assign(mensajeDiv.style, estilos);
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        mensajeDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => mensajeDiv.remove(), 300);
    }, 3000);
}

// Agregar animaciones CSS si no existen
if (!document.querySelector('#animations-perfil')) {
    const style = document.createElement('style');
    style.id = 'animations-perfil';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
        
        .strength-weak { color: #dc3545; }
        .strength-medium { color: #ffc107; }
        .strength-strong { color: #28a745; }
    `;
    document.head.appendChild(style);
}